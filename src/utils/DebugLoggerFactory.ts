import { LogLevelString } from "bunyan";
import * as Bunyan from "bunyan";
import { inject, injectable, optional } from "inversify";
import { Logger, LoggerFactory } from "./LoggerFactory";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const PrettyStream = require("bunyan-prettystream");

const prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

/**
 * LoggerFactory that produces a bunyan logger using a PrettyStream
 * https://www.npmjs.com/package/bunyan-pretty-stream
 * Intended only for use in tests and while debugging
 */
@injectable()
export class DebugLoggerFactory implements LoggerFactory {
  constructor(
    @inject("config.log.level")
    @optional()
    private readonly level: LogLevelString = "debug"
  ) {}

  public getLogger(name: string): Logger {
    return Bunyan.createLogger({
      name,
      streams: [
        {
          level: this.level,
          type: "raw",
          stream: prettyStdOut,
        },
      ],
    });
  }
}
