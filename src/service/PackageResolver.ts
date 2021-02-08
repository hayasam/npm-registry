import { NpmPackage } from "../models/NpmPackage";

export interface PackageResolver {
  getPackageInfo(name: string): Promise<NpmPackage>;
}
