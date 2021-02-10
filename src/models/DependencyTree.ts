export type AlreadyTraversed = string;

export type Dependency = DependencyTree | AlreadyTraversed;
export type Dependencies = { [name: string]: Dependency };

export interface DependencyTree {
  name: string;
  version: string;
  resolvedVersion: string;
  dependencies: Dependencies;
}

export function isTree(value: any): value is DependencyTree {
  return value.name && value.dependencies;
}
