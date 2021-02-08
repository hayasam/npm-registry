import { inject, injectable } from "inversify";
import { Logger, LoggerFactory } from "../utils/LoggerFactory";
import { VersionResolver } from "./VersionResolver";
import { maxSatisfying } from "semver";
import { PackageResolver } from "./PackageResolver";
import { NotFoundError } from "restify-errors";

@injectable()
export class SemverVersionResolver implements VersionResolver {
  private readonly log: Logger;

  constructor(
    @inject("LoggerFactory") readonly loggerFactory: LoggerFactory,
    @inject("PackageResolver") private readonly packageResolver: PackageResolver
  ) {
    this.log = loggerFactory.getLogger(SemverVersionResolver.name);
  }

  async resolveMaxSatisfyingVersion(
    name: string,
    version: string
  ): Promise<string> {
    const info = await this.packageResolver.getPackageInfo(name);
    const versions = Object.keys(info.versions);
    const matchedVersion = maxSatisfying(versions, version);
    if (matchedVersion) {
      return matchedVersion;
    }
    const error = new NotFoundError(
      "Can't find a version matching %s in the list of versions for package %s: %j",
      version,
      name,
      versions
    );
    this.log.warn(error);
    throw error;
  }
}
