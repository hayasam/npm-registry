import { NpmPackage } from "../../src/models/NpmPackage";
import { VersionResolver } from "../../src/service/VersionResolver";

export class MockVersionResolver implements VersionResolver {
  private static getPackageVersion(name: string): string {
    switch (name) {
      case "core-js":
        return "3.8.3";
      case "fbjs":
        return "0.8.0";
      case "js-tokens":
        return "6.0.0";
      case "loose-envify":
        return "1.4.0";
      case "object-assign":
        return "4.1.1";
      case "prop-types":
        return "15.6.2";
      case "react":
        return "15.0.2";
      default:
        throw new Error(`No fixture version for package ${name}.`);
    }
  }

  public resolveMaxSatisfyingVersion = jest.fn();

  constructor() {
    this.resolveMaxSatisfyingVersion.mockImplementation(
      (name: string, version: string) =>
        Promise.resolve(MockVersionResolver.getPackageVersion(name))
    );
  }
}
