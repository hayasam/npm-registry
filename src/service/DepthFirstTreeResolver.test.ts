import "reflect-metadata";

import { isTree } from "../models/DependencyTree";
import { DebugLoggerFactory } from "../utils/DebugLoggerFactory";
import { DepthFirstTreeResolver } from "./DepthFirstTreeResolver";
import { MockPackageResolver } from "../../test/fixtures/MockPackageResolver";
import { MockVersionResolver } from "../../test/fixtures/MockVersionResolver";

function createMocks(allowRepeatTraversal: boolean = false) {
  const packageResolver = new MockPackageResolver();
  const versionResolver = new MockVersionResolver();
  const treeResolver = new DepthFirstTreeResolver(
    new DebugLoggerFactory(),
    packageResolver,
    versionResolver,
    1, // concurrency
    allowRepeatTraversal
  );
  return { packageResolver, versionResolver, treeResolver };
}

describe("DepthFirstTreeResolver", () => {
  it("recursively resolves dependency tree", async () => {
    // arrange
    const { treeResolver, packageResolver } = createMocks(true);

    // act
    const tree = await treeResolver.getDependencyTree("react", "16.13.0");

    // assert
    expect(tree.name).toBe("react");

    const objectAssign = tree.dependencies["object-assign"];
    expect(objectAssign).toBeDefined();

    if (!isTree(objectAssign)) {
      fail("Resolver failed to produce a dependency tree.");
    }

    expect(objectAssign.resolvedVersion).toBe("4.1.1");

    expect(packageResolver.getPackageInfo).toBeCalled();
  });

  it("prevents repeat traversals if instructed", async () => {
    // arrange
    const { treeResolver } = createMocks();

    // act
    const tree = await treeResolver.getDependencyTree("react", "16.13.0");

    // assert
    expect(tree.name).toBe("react");

    const objectAssign = tree.dependencies["object-assign"];
    expect(objectAssign).toContain("Already traversed");
  });

  it("stops if it can't resolve a package", async () => {
    // arrange
    const { treeResolver, packageResolver } = createMocks();
    packageResolver.getPackageInfo.mockRejectedValue("Not found!");

    // act
    const promise = treeResolver.getDependencyTree("react", "16.13.0");

    // assert
    expect(promise).rejects.toEqual("Not found!");
  });
});
