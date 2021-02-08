import { NpmPackage } from "../../src/models/NpmPackage";
import { PackageResolver } from "../../src/service/PackageResolver";

export class MockPackageResolver implements PackageResolver {
  private static getPackageMock(name: string): NpmPackage {
    switch (name) {
      case "core-js":
        return require("./core-js.json");
      case "fbjs":
        return require("./fbjs.json");
      case "js-tokens":
        return require("./js-tokens.json");
      case "loose-envify":
        return require("./loose-envify.json");
      case "object-assign":
        return require("./object-assign.json");
      case "prop-types":
        return require("./prop-types.json");
      case "react":
        return require("./react.json");
      default:
        throw new Error(`No fixture for package ${name}`);
    }
  }

  public getPackageInfo = jest.fn();

  constructor() {
    this.getPackageInfo.mockImplementation((name) =>
      Promise.resolve(MockPackageResolver.getPackageMock(name))
    );
  }
}
