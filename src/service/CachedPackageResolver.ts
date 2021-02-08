import { inject, injectable } from "inversify";
import { NpmPackage } from "../models/NpmPackage";
import { Logger, LoggerFactory } from "../utils/LoggerFactory";
import { PackageResolver } from "./PackageResolver";
import LRUCache = require("lru-cache");

@injectable()
export class CachedPackageResolver implements PackageResolver {
  private readonly log: Logger;
  private readonly cache: LRUCache<string, NpmPackage>;

  constructor(
    @inject("LoggerFactory") readonly loggerFactory: LoggerFactory,
    @inject("UncachedPackageResolver")
    private readonly packageResolver: PackageResolver
  ) {
    this.log = loggerFactory.getLogger(CachedPackageResolver.name);
    this.cache = new LRUCache({
      max: 500,
      maxAge: 1000 * 60 * 60,
    });
  }

  async getPackageInfo(name: string): Promise<NpmPackage> {
    const key = name.toLowerCase();
    const cached = this.cache.get(key);
    if (cached) {
      this.log.debug("Cache hit for package %s.", key);
      return cached;
    }
    const uncached = await this.packageResolver.getPackageInfo(name);
    this.cache.set(key, uncached);
    this.log.debug("Cache missed for package %s.", name);
    return uncached;
  }
}
