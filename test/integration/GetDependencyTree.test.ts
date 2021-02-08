import { Server } from "../../src/server/Server";
import container from "../../src/bindings";
import { PackageResolver } from "../../src/service/PackageResolver";
import { MockPackageResolver } from "../fixtures/MockPackageResolver";
import Axios from "axios";
import { MockVersionResolver } from "../fixtures/MockVersionResolver";
import { VersionResolver } from "../../src/service/VersionResolver";

describe("GET /package/:name/:version", () => {
  let server: Server;

  let http = Axios.create({
    baseURL: "http://localhost:3000",
    headers: {
      "Content-type": "application/json",
    },
    timeout: 5000,
  });
  let packageResolver: MockPackageResolver;
  let versionResolver: MockVersionResolver;

  beforeAll(async () => {
    packageResolver = new MockPackageResolver();
    versionResolver = new MockVersionResolver();

    container.unbind("PackageResolver");
    container.unbind("VersionResolver");

    container
      .bind<PackageResolver>("PackageResolver")
      .toConstantValue(packageResolver);
    container
      .bind<VersionResolver>("VersionResolver")
      .toConstantValue(versionResolver);

    server = container.get<Server>("Server");
    return server.start();
  });

  afterAll(async () => {
    return server.stop();
  });

  it("responds with dependency tree", async () => {
    try {
      const res = await http.get("/package/react/15.0.2");

      expect(res.status).toBe(200);
      expect(res.data).toMatchObject({
        name: "react",
        version: "15.0.2",
        dependencies: {
          fbjs: {
            version: "^0.8.0",
            dependencies: {
              "core-js": {
                version: "^1.0.0",
                resolvedVersion: "3.8.3",
              },
            },
          },
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
});
