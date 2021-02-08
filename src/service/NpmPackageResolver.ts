import Axios, { AxiosInstance, AxiosResponse } from "axios";
import { inject, injectable } from "inversify";
import { NpmPackage } from "../models/NpmPackage";
import { Logger, LoggerFactory } from "../utils/LoggerFactory";
import { PackageResolver } from "./PackageResolver";
import { InternalServerError, NotFoundError } from "restify-errors";

@injectable()
export class NpmPackageResolver implements PackageResolver {
  private readonly log: Logger;
  private readonly agent: AxiosInstance;

  constructor(@inject("LoggerFactory") readonly loggerFactory: LoggerFactory) {
    this.log = loggerFactory.getLogger(NpmPackageResolver.name);
    this.agent = Axios.create({
      baseURL: "https://registry.npmjs.org",
      headers: {
        "Content-type": "application/json",
      },
      timeout: 5000,
    });
  }

  async getPackageInfo(name: string): Promise<NpmPackage> {
    // TODO url encode name
    let result: AxiosResponse<NpmPackage>;
    try {
      // TODO validate schema for deserialisation
      result = await this.agent.get<NpmPackage>(`/${name}`);
    } catch (error) {
      this.log.error(error, "Can't fetch package %s.", name);
      throw new InternalServerError("Can't fetch package %s.", name);
    }
    if (result?.status === 404) {
      this.log.info({ res: result }, "Can't find package %s.", name);
      throw new NotFoundError("Unknown package %s.", name);
    }
    if (result?.status === 200) {
      return result.data;
    }
    this.log.error({ res: result }, "Can't fetch package %s.", name);
    throw new InternalServerError("Can't fetch package %s.", name);
  }
}
