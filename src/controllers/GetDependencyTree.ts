import { RequestHandler } from "express";
import { inject, injectable } from "inversify";
import { Logger, LoggerFactory } from "../utils/LoggerFactory";
import { Controller, HttpMethod } from "./Controller";
import { TreeResolver } from "../service/TreeResolver";

@injectable()
export class GetDependencyTree implements Controller {
  readonly path: string = "/package/:name/:version";
  readonly method: HttpMethod = "GET";

  private readonly log: Logger;

  constructor(
    @inject("LoggerFactory") readonly loggerFactory: LoggerFactory,
    @inject("TreeResolver")
    private readonly treeResolver: TreeResolver
  ) {
    this.log = loggerFactory.getLogger(GetDependencyTree.name);
  }

  readonly handler: RequestHandler = async (req, res, next) => {
    const { version, name } = req.params;
    // TODO validation

    try {
      const tree = await this.treeResolver.getDependencyTree(name, version);
      return res.status(200).json(tree);
    } catch (error) {
      return next(error);
    }
  };
}
