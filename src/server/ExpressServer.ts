import { Application } from "express";
import express = require("express");
import { inject, injectable, multiInject } from "inversify";
import { Controller } from "../controllers/Controller";
import { Logger, LoggerFactory } from "../utils/LoggerFactory";
import { Server } from "./Server";

@injectable()
export class ExpressServer implements Server {
  private readonly log: Logger;
  private readonly app: Application;

  constructor(
    @inject("config.server.port") private readonly port: number,
    @inject("LoggerFactory") readonly loggerFactory: LoggerFactory,
    @multiInject("Controller") private readonly controllers: Controller[]
  ) {
    this.log = loggerFactory.getLogger(ExpressServer.name);
    this.app = express();
    this.app.use(express.json());

    for (const controller of this.controllers) {
      this.log.debug(
        "Binding controller %s %s.",
        controller.method,
        controller.path
      );
      switch (controller.method) {
        case "GET":
          this.app.get(controller.path, controller.handler);
          break;
        case "POST":
          this.app.post(controller.path, controller.handler);
          break;
        default:
          this.log.error(
            "Unknown method %s in controller %s.",
            controller.method,
            controller.path
          );
      }
    }
  }

  start(callback?: () => void): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      try {
        this.app.listen(this.port, () => {
          self.log.debug("Started listening on port %d...", self.port);
          resolve();
        });
      } catch (error) {
        self.log.error(
          error,
          "Failed to start listening on port %d.",
          self.port
        );
        reject(error);
      } finally {
        if (callback) {
          callback();
        }
      }
    });
  }

  stop(callback?: () => void): Promise<void> {
    this.log.info("Server shutting down.");
    if (callback) {
      callback();
    }
    return Promise.resolve();
  }
}
