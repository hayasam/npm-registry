import { inject, injectable, optional } from "inversify";
import {
  Dependencies,
  Dependency,
  DependencyTree,
} from "../models/DependencyTree";
import { Logger, LoggerFactory } from "../utils/LoggerFactory";
import { PackageResolver } from "./PackageResolver";
import { TreeResolver } from "./TreeResolver";
import { VersionResolver } from "./VersionResolver";
import { NotFoundError } from "restify-errors";
import Bluebird = require("bluebird");

interface ParentPackage {
  parentName: string;
  parentVersion: string;
}

class TraversalHistory {
  private traversedPackages: {
    [key: string]: ParentPackage;
  } = {};

  private static key(name: string, version: string) {
    return `${name}${version}`;
  }

  add(
    name: string,
    version: string,
    parentName: string,
    parentVersion: string
  ): void {
    this.traversedPackages[TraversalHistory.key(name, version)] = {
      parentName,
      parentVersion,
    };
  }

  get(name: string, version: string): ParentPackage | undefined {
    return this.traversedPackages[TraversalHistory.key(name, version)];
  }
}

@injectable()
export class DepthFirstTreeResolver implements TreeResolver {
  private readonly log: Logger;
  private readonly maxConcurrency: number;
  private readonly allowRepeatTraversal: boolean;

  constructor(
    @inject("LoggerFactory") readonly loggerFactory: LoggerFactory,
    @inject("PackageResolver")
    private readonly packageResolver: PackageResolver,
    @inject("VersionResolver")
    private readonly versionResolver: VersionResolver,
    @inject("config.maxConcurrency")
    @optional()
    maxConcurrency?: number,
    @inject("config.allowRepeatTraversal")
    @optional()
    allowRepeatTraversal?: boolean
  ) {
    this.log = loggerFactory.getLogger(DepthFirstTreeResolver.name);
    this.maxConcurrency = maxConcurrency || 1;
    this.allowRepeatTraversal = allowRepeatTraversal || false;
  }

  /*
    Get the first level of a dependency.
   */
  private async getDependency(
    name: string,
    version: string,
    parentName: string,
    parentVersion: string,
    traversalHistory: TraversalHistory
  ): Promise<Dependency> {
    const resolvedVersion = await this.versionResolver.resolveMaxSatisfyingVersion(
      name,
      version
    );

    if (!this.allowRepeatTraversal) {
      // Setting allowRepeatTraversal to false stops duplicate subtrees and circular dependencies.
      // Useful to optimise response size by not sending the same subtree multiple times.
      const traversed = traversalHistory.get(name, resolvedVersion);
      if (traversed) {
        return `Already traversed by ${traversed.parentName}@${traversed.parentVersion}`;
      }
    }

    const dependencies = await this.getRecursiveDependencyTree(
      name,
      resolvedVersion,
      parentName,
      parentVersion,
      traversalHistory
    );

    return {
      name: name,
      version: version,
      resolvedVersion: resolvedVersion,
      dependencies: dependencies,
    };
  }

  private async getRecursiveDependencyTree(
    name: string,
    version: string,
    parentName: string,
    parentVersion: string,
    traversalHistory: TraversalHistory
  ): Promise<Dependencies> {
    const level1 = await this.packageResolver.getPackageInfo(name);

    if (!level1.versions[version]) {
      throw new NotFoundError(
        "Can't find version %s for package %s.",
        version,
        name
      );
    }

    traversalHistory.add(
      name,
      version,
      parentName,
      parentVersion
    );

    const dependencies = level1.versions[version].dependencies || {};

    const subtree = await Bluebird.map(
      Object.keys(dependencies),
      async (key: string) => {
        const dependency = await this.getDependency.bind(this)(
          key,
          dependencies[key],
          name,
          version,
          traversalHistory
        );
        return {
          name: key,
          dependency,
        };
      },
      {
        concurrency: this.maxConcurrency,
      }
    );

    return subtree.reduce((tree, { name, dependency }) => {
      tree[name] = dependency;
      return tree;
    }, {});
  }

  async getDependencyTree(
    name: string,
    version: string
  ): Promise<DependencyTree> {
    const tree: Dependencies = await this.getRecursiveDependencyTree(
      name,
      version,
      "root",
      "",
      new TraversalHistory()
    );

    return {
      name: name,
      version: version,
      resolvedVersion: version,
      dependencies: tree,
    };
  }
}
