import "reflect-metadata";

import { Container } from "inversify";
import { Controller } from "./controllers/Controller";
import { GetDependencyTree } from "./controllers/GetDependencyTree";
import { ExpressServer } from "./server/ExpressServer";
import { Server } from "./server/Server";
import { LoggerFactory } from "./utils/LoggerFactory";
import { DebugLoggerFactory } from "./utils/DebugLoggerFactory";
import { TreeResolver } from "./service/TreeResolver";
import { DepthFirstTreeResolver } from "./service/DepthFirstTreeResolver";
import { NpmPackageResolver } from "./service/NpmPackageResolver";
import { PackageResolver } from "./service/PackageResolver";
import { CachedPackageResolver } from "./service/CachedPackageResolver";
import { SemverVersionResolver } from "./service/SemverVersionResolver";
import { VersionResolver } from "./service/VersionResolver";
import { DisplayDependencyTree } from "./controllers/DisplayDependencyTree";

const container = new Container();

container.bind<number>("config.server.port").toConstantValue(3000);
container.bind<boolean>("config.allowRepeatTraversal").toConstantValue(false);

container.bind<Server>("Server").to(ExpressServer).inSingletonScope();

container
  .bind<LoggerFactory>("LoggerFactory")
  //.to(BunyanLoggerFactory)
  .to(DebugLoggerFactory)
  .inSingletonScope();

container
  .bind<Controller>("Controller")
  .to(GetDependencyTree)
  .inSingletonScope();

container
  .bind<Controller>("Controller")
  .to(DisplayDependencyTree)
  .inSingletonScope();

container
  .bind<TreeResolver>("TreeResolver")
  .to(DepthFirstTreeResolver)
  .inSingletonScope();

container
  .bind<PackageResolver>("UncachedPackageResolver")
  .to(NpmPackageResolver)
  .inSingletonScope();

container
  .bind<PackageResolver>("PackageResolver")
  .to(CachedPackageResolver)
  .inSingletonScope();

container
  .bind<VersionResolver>("VersionResolver")
  .to(SemverVersionResolver)
  .inSingletonScope();

export default container;
