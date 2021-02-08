import { LogLevelString, LoggerOptions, Stream } from "bunyan";
import * as Bunyan from "bunyan";
import { bunyanSerializer } from "restify-errors";
import { inject, injectable, optional } from "inversify";
import { Logger, LoggerFactory } from "./LoggerFactory";

@injectable()
export class BunyanLoggerFactory implements LoggerFactory {
  private readonly params: Partial<LoggerOptions>;

  public constructor(
    @inject("config.logger.prefix")
    @optional()
    private readonly prefix: string = "",
    @inject("config.logger.level")
    @optional()
    readonly logLevel: LogLevelString = "debug",
    /* eslint-disable @typescript-eslint/no-explicit-any */
    @inject("config.logger.meta") @optional() readonly meta: any = {},
    @inject("config.logger.stdout")
    @optional()
    readonly out: NodeJS.WritableStream | Stream = process.stdout,
    @inject("config.logger.streams")
    @optional()
    readonly streamsOverride?: Stream[]
  ) {
    const file = prefix.endsWith(".") ? `${prefix}log` : `${prefix}.log`;
    const filename = `/var/log/app/${file}`;
    const stdoutStream: Stream = {
      stream: out,
      type: "stream",
      level: logLevel,
    };
    const fileStream: Stream = {
      type: "rotating-file",
      level: "info",
      path: filename,
      period: "1d", // daily rotation
      count: 31, // keep 31 back copies
    };

    const shouldWriteFile = false; // env !== 'development';
    const defaultStreams: Stream[] = shouldWriteFile
      ? [stdoutStream, fileStream]
      : [stdoutStream];
    const outputStreams: Stream[] =
      typeof streamsOverride !== "undefined" ? streamsOverride : defaultStreams;

    this.params = {
      level: logLevel,
      serializers: { ...Bunyan.stdSerializers, err: bunyanSerializer },
      streams: outputStreams,
    };
  }

  public getLogger(name: string): Logger {
    return Bunyan.createLogger({ name: this.prefix + name, ...this.params });
  }
}
