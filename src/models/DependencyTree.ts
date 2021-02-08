export type AlreadyTraversed = string;

export type Dependency = DependencyTree | AlreadyTraversed;
export type Dependencies = { [name: string]: Dependency };

export interface DependencyTree {
  name: string;
  version: string;
  resolvedVersion: string;
  dependencies: Dependencies;
}
