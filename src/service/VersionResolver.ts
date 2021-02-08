export interface VersionResolver {
    resolveMaxSatisfyingVersion(name: string, version: string): Promise<string>;
}