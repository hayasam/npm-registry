# npm-registry

Fetch a package by given name and version from [npm registry](https://registry.nmpjs.org) and display it in the browser, including its transitive dependency.

## API Design

### Fetch package with transitive dependencies

- The API endpoint preserves the endpoint format given by the exercise.

- The `GET` is handled by the `GetDependencyTree` controller.

- The controller uses a `TreeResolver` interface, implemented by `DepthFirstTreeResolver`. An explanation of how this works is provided [below](#resolving-the-dependency-tree).

- A configuration parameter called `allowRepeatTraversal` specifies whether walking the same dependency tree multiple times is allowed or not.
  - In the response below, the parameter is set to `false`. This results in the message `"loose-envify": "Already traversed by fbjs@0.8.1`, instead of the dependency tree for `loose-envify`, which is displayed already inside `fbjs`.
  - Setting the parameter to `true` will display the dependency tree again.
  - This reduces the size of the response, decreases the response latency and saves network bandwidth.
  - It also helps render the DOM faster when displaying the dependency tree.

<details>
  <summary>Example response </summary>

  `GET http://localhost:3000/package/react/15.0.2`

  ```json
  {
    "packageName": "react",
    "version": "15.0.2",
    "resolvedVersion": "15.0.2",
    "dependencies": {
      "fbjs": {
        "packageName": "fbjs",
        "version": "^0.8.0",
        "resolvedVersion": "0.8.17",
        "dependencies": {
          "core-js": {
            "packageName": "core-js",
            "version": "^1.0.0",
            "resolvedVersion": "1.2.7",
            "dependencies": {}
          },
          "isomorphic-fetch": {
            "packageName": "isomorphic-fetch",
            "version": "^2.1.1",
            "resolvedVersion": "2.2.1",
            "dependencies": {
              "node-fetch": {
                "packageName": "node-fetch",
                "version": "^1.0.1",
                "resolvedVersion": "1.7.3",
                "dependencies": {
                  "encoding": {
                    "packageName": "encoding",
                    "version": "^0.1.11",
                    "resolvedVersion": "0.1.13",
                    "dependencies": {
                      "iconv-lite": {
                        "packageName": "iconv-lite",
                        "version": "^0.6.2",
                        "resolvedVersion": "0.6.2",
                        "dependencies": {
                          "safer-buffer": {
                            "packageName": "safer-buffer",
                            "version": ">= 2.1.2 < 3.0.0",
                            "resolvedVersion": "2.1.2",
                            "dependencies": {}
                          }
                        }
                      }
                    }
                  },
                  "is-stream": {
                    "packageName": "is-stream",
                    "version": "^1.0.1",
                    "resolvedVersion": "1.1.0",
                    "dependencies": {}
                  }
                }
              },
              "whatwg-fetch": {
                "packageName": "whatwg-fetch",
                "version": ">=0.10.0",
                "resolvedVersion": "3.5.0",
                "dependencies": {}
              }
            }
          },
          "loose-envify": {
            "packageName": "loose-envify",
            "version": "^1.0.0",
            "resolvedVersion": "1.4.0",
            "dependencies": {
              "js-tokens": {
                "packageName": "js-tokens",
                "version": "^3.0.0 || ^4.0.0",
                "resolvedVersion": "4.0.0",
                "dependencies": {}
              }
            }
          },
          "object-assign": {
            "packageName": "object-assign",
            "version": "^4.1.0",
            "resolvedVersion": "4.1.1",
            "dependencies": {}
          },
          "promise": {
            "packageName": "promise",
            "version": "^7.1.1",
            "resolvedVersion": "7.3.1",
            "dependencies": {
              "asap": {
                "packageName": "asap",
                "version": "~2.0.3",
                "resolvedVersion": "2.0.6",
                "dependencies": {}
              }
            }
          },
          "setimmediate": {
            "packageName": "setimmediate",
            "version": "^1.0.5",
            "resolvedVersion": "1.0.5",
            "dependencies": {}
          },
          "ua-parser-js": {
            "packageName": "ua-parser-js",
            "version": "^0.7.18",
            "resolvedVersion": "0.7.23",
            "dependencies": {}
          }
        }
      },
      "loose-envify": "Already traversed by fbjs@0.8.17",
      "object-assign": "Already traversed by fbjs@0.8.17"
    }
  }
  ```
</details>


### Display a package with transitive dependencies

- The `GET` is handled by the `DisplayDependencyController`.

- It uses the same interface `TreeResolver` and its in memory implementation.

- It uses the [Handlebars](https://handlebarsjs.com/) template engine to generate a very simplistic HTML, as shown below.
  - This exercise doesn't use any front-end framework but a lot can be done to make the UX nicer.
  - For simplicity, the tree is displayed by calling an API endpoint. In production, it would probably be rendered by a separate web page which calls the API.
  - For this exercise, the display makes use of the memory cache created at the `TreeResolver` level. This means that once a particular dependency tree has been resolved, the display can be called multiple times without hitting `npmjs`.

<details>
  <summary>Example response</summary>

  `http://localhost:3000/display/react/15.0.2`

  ```html
  <h1>Dependency tree</h1>

  <section>
    <h2>react@15.0.2</h2>
    <ul>
      <li>
        <section>
          <h2>fbjs@0.8.17</h2>
          <ul>
            <li>
              <section>
                <h2>core-js@1.2.7</h2>
                <ul></ul>
              </section>
            </li>
            <li>
              <section>
                <h2>isomorphic-fetch@2.2.1</h2>
                <ul>
                  <li>
                    <section>
                      <h2>node-fetch@1.7.3</h2>
                      <ul>
                        <li>
                          <section>
                            <h2>encoding@0.1.13</h2>
                            <ul>
                              <li>
                                <section>
                                  <h2>iconv-lite@0.6.2</h2>
                                  <ul>
                                    <li>
                                      <section>
                                        <h2>safer-buffer@2.1.2</h2>
                                        <ul></ul>
                                      </section>
                                    </li>
                                  </ul>
                                </section>
                              </li>
                            </ul>
                          </section>
                        </li>
                        <li>
                          <section>
                            <h2>is-stream@1.1.0</h2>
                            <ul></ul>
                          </section>
                        </li>
                      </ul>
                    </section>
                  </li>
                  <li>
                    <section>
                      <h2>whatwg-fetch@3.5.0</h2>
                      <ul></ul>
                    </section>
                  </li>
                </ul>
              </section>
            </li>
            <li>
              <section>
                <h2>loose-envify@1.4.0</h2>
                <ul>
                  <li>
                    <section>
                      <h2>js-tokens@4.0.0</h2>
                      <ul></ul>
                    </section>
                  </li>
                </ul>
              </section>
            </li>
            <li>
              <section>
                <h2>object-assign@4.1.1</h2>
                <ul></ul>
              </section>
            </li>
            <li>
              <section>
                <h2>promise@7.3.1</h2>
                <ul>
                  <li>
                    <section>
                      <h2>asap@2.0.6</h2>
                      <ul></ul>
                    </section>
                  </li>
                </ul>
              </section>
            </li>
            <li>
              <section>
                <h2>setimmediate@1.0.5</h2>
                <ul></ul>
              </section>
            </li>
            <li>
              <section>
                <h2>ua-parser-js@0.7.23</h2>
                <ul></ul>
              </section>
            </li>
          </ul>
        </section>
      </li>
      <li>
        <section>
          <h1>Already traversed by fbjs@0.8.17</h1>
        </section>
      </li>
      <li>
        <section>
          <h1>Already traversed by fbjs@0.8.17</h1>
        </section>
      </li>
    </ul>
  </section>
  ```
</details>

### Domain models

`NpmPackage`

- Used internally to deserialize a minimum response from `GET https://registry.npmjs.org/{name}`.

`DependencyTree`

- Used externally by the API responses.

- Defines a dependency tree with the following properties:
  - `name`: the package name
  - `version`: a [semver expression](semver.pdf)
  - `resolvedVersion`: an actual version resolved from the semver expression
  - `dependencies`: which is a map where the key is a child package name and the value is either a sub-tree of type `DependencyTree` or a custom type called `AlreadyTraversed`, to prevent circular dependencies; the map keys are used to fetch and traverse the subtree of dependencies.

## Resolving the dependency tree

`TreeResolver`

- Receives a package name and a version and outputs a `DependencyTree` model.

- The provided implementation of the `TreeResolver` interface is `DepthFirstTreeResolver`, which resolves the dependency tree in memory using a depth-first tree traversal.

- It uses two other interfaces, `PackageResolver` and `VersionResolver`, which are injected in the constructor, making them easily mockable in tests.

- The recursion uses a local `TraversalHistory` helper class. 
  - This builds the dependency tree, remembering the parent package. 
  - Useful when setting the config param `allowRepeatTraversal`: if the param is `true`
  and a tree has already been traversed, then the parent is displayed instead, e.g. `"loose-envify": "Already traversed by fbjs@0.8.17"`. 
  - It is also useful to prevent circular dependencies, although probably `npm` disallows them.

- Because of the `npmjs` rate limiting, an attempt has been made to limit the number of concurrent requests using a config option called `maxConcurrency`.
  - This is done with a library called [bluebird](https://www.npmjs.com/package/bluebird) which has a `concurrency` option for `Promises`.
  - However, yhe concurrency limit is per subtree which means that, in total, there will be more requests sent to `npmjs` than the value of the `maxConcurrency` parameter.
  - A global concurrency limit needs a `Promise` pool, implemented either with a FIFO queue or, potentially, with a library like [es-promise-pool](https://www.npmjs.com/package/es6-promise-pool).

`PackageResolver`

- Receives a package name and retrieves a corresponding `NpmPackage`.

- There are two implementations: one for cached and one for uncached packages.

- `NpmPackageResolver` uses `registry.nmpjs.org` to trigger a `GET` request and retrieve a `NpmPackage`.

- `CachedPackageResolver`:

  - Uses an injected `NpmPackageResolver` and an [LRUCache](https://www.npmjs.com/package/lru-cache) to cache retrieved packages in memory.
  - In case of a cache miss, the package is retrieved and cached.
  - This is the default implementation used whenever a `PackageResolver` is injected because is bound with the name `PackageResolver` in `binding.ts`.

- In production, there needs to be another implementation using a persistent data store like Redis to cache the responses in between server restarts.

`VersionResolver`

- Receives a package name and version (semver expression) and resolves the expression to an actual version.

- Uses [semver](https://www.npmjs.com/package/semver) `maxSatisfying(versions, range)` which resolves to the highest version in the list that satisfies the range or null, if none do.

- This works if the dependencies are resolved with an `npm install` every time. In practice, if this was used to create a vulnerability scanner, it would probably be used by a project that is deployed with a specific `package-lock.json`. In that case, the dependency versions would have to be resolved from that lock file, because they might not be the latest.

## Production readiness suggestions

### API

- **Model schema generation and validation** is missing but it's highly recommended to use an API description language like [OpenAPI/Swagger](https://www.openapis.org/). This serve as _single source of truth_ for API design and implementation and also provide a human-readable API documentation.

- **Input validation** is missing but this is essential to prevent a range of attacks like SQLi and XSS. Validation can be done by:

  - Escaping and html-encoding the input parameters
  - Sanitising the input by whitelisting (preferred) or disallowing dangerous characters
  - Validating the input against allowed schemas

- **Error handling** is missing but having a common way of treating API errors makes the API easier to consume. This can be setup as part of the Express middleware. A good approach is to separate _validation errors_ from _integration errors_ as shown [here](https://evelyne24.github.io/system-design-checklist/api).

- **Flow control** is not implemented but this ensures that the service handles load better. For example, `npmjs` throttles the requests, so our service would also implement rate limiting for pre-registered API keys, either using a separate gateway (preferred) or an internal mechanism.

### Testing

- Test-Driven-Development (e.g. *Red, Green, Refactor* approach) is always a good idea, but it takes more time and commitment. 
- It works well in companies that already have this culture and see code quality as investment, not cost.
- Tests are part of the CI/CD process.
- Deployments happen only if tests are green. 
- This project has only a few test examples.

In practice, it's difficult to reach test Nirvana.

#### Unit testing

- First level of code quality. 
- Tests logical units in isolation, mocking dependencies. 
- Useful to reduce bug fixing costs by catching small to medium errors and making design corrections earlier. 
- Helps with the debugging process. 
- Easier to run and maintain than integration and UX tests.

Example: `DepthFirstTreeResolver.test.ts`.

#### Integration testing

- Tests multiple, bigger components in interaction. 
- Good test data is hard to ingest and maintain.
- Slower to execute, especially ones that require a live database connection. 
- Best to wrap everything in Docker, composing all the resources needed, e.g. database, service, integration testing service etc.
- Good to mock any dependency that makes a call to a third-party service, e.g. `npmjs` which might be throttled and make the tests flaky.

Example: `GetDependencyTree.test.ts`

#### Load testing

- Good for APIs and websites.
- Good services to use are [JMeter](https://jmeter.apache.org/), [Gatling](https://gatling.io/), [Blazemeter](https://www.blazemeter.com/).
- Hard to write good scenarios and simulations.
- Multiple flavours:
  - _Stress testing_: "Flash sales" type of testing, lots of users in the smallest unit of time; checks if the load balancing and auto-scaling works.
  - _Soak testing_: tests how the system behaves under a longer stretch of time, e.g. check CPU load, memory leaks.
  - _Capacity testing_: tests how much throughput the system can handle, in cycles of increase load > level > increase load.

#### Chaos engineering testing

- Injects random failures in an internal system (e.g. kills servers) to check the fault tolerance of the system and the metrics associated (e.g. restore time).
- Great for companies who offer strong SLAs.
- Great to have for Disaster Recovery scenarios.
- Can be done [as-a-service](https://netflix.github.io/chaosmonkey/).

### Production-readiness

- A production-ready service would first fix the concurrency issue explained above, using a global pool of requests to `npmjs`.
- It would use a permanent data store (e.g. Redis or DynamoDB) to store the cached packages
- It would be deployed under an API Gateway (e.g. AWS API Gateway), which can handle things like auth, rate limiting, versioning, caching responses etc.
- It would be deployed as a container (e.g. Docker).
- It would declare all configurations via infrastructure-as-code as part of the CI/CD (e.g Terraform).
- It would either be deployed on a virtual server in a cloud provider that sits behind a load balancer with auto-scaling enabled (e.g. AWS EC2 + ALB) or (preferred) a serverless function (e.g. AWS Lambda) or managed orchestration system (e.g. AWS ECS).


### UX

- The UX can be improved by adding a front-end framework, e.g. Milligram, Bootstrap, Foundation
- They do the heavy lifting on things like responsiveness, cross-browser support etc.
- For this exercise, the rendering is done server-side, which is good for caching by a CDN.
- An alternative, can be a separate website that calls an internal API and renders the view client-side.
- That would require more setup, to place the API under the same domain as the website or enabling Cross-Origin Resource Sharing (CORS).
