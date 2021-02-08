import { RequestHandler } from "express";
import { inject, injectable } from "inversify";
import { Logger, LoggerFactory } from "../utils/LoggerFactory";
import { Controller, HttpMethod } from "./Controller";
import { TreeResolver } from "../service/TreeResolver";
import Handlebars = require("handlebars");
import * as fs from "fs";

@injectable()
export class DisplayDependencyTree implements Controller {
  readonly path: string = "/display/:name/:version";
  readonly method: HttpMethod = "GET";

  private readonly log: Logger;
  private readonly template: HandlebarsTemplateDelegate<any>;

  constructor(
    @inject("LoggerFactory") readonly loggerFactory: LoggerFactory,
    @inject("TreeResolver")
    private readonly treeResolver: TreeResolver
  ) {
    this.log = loggerFactory.getLogger(DisplayDependencyTree.name);
    Handlebars.registerPartial(
      "dependency",
      Handlebars.compile(
        fs.readFileSync("./src/templates/dependency.hbs").toString("utf-8")
      )
    );
    this.template = Handlebars.compile(
      fs.readFileSync("./src/templates/tree.hbs").toString("utf-8")
    );
  }

  readonly handler: RequestHandler = async (req, res, next) => {
    const { version, name } = req.params;
    // TODO validation

    try {
      const tree = await this.treeResolver.getDependencyTree(name, version);

      return res
        .status(200)
        .type("html")
        .send(
          this.template({
            root: tree,
          })
        );
    } catch (error) {
      return next(error);
    }
  };
}
