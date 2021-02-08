import { DependencyTree } from "../models/DependencyTree";

export interface TreeResolver {
  getDependencyTree(
    name: string,
    version: string
  ): Promise<DependencyTree>;
}
