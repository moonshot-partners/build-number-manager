export interface BuildNumberResult {
    previousNumber: number;
    newNumber: number;
    created: boolean;
}
export declare class BuildNumberManager {
    private octokit;
    private owner;
    private repo;
    private buildNumbersPath;
    constructor(githubToken: string, repository: string);
    getCurrentBuildNumber(id: string, initialNumber: number): Promise<BuildNumberResult>;
    saveBuildNumber(id: string, newNumber: number): Promise<void>;
    getAndIncrementBuildNumber(id: string, initialNumber: number): Promise<BuildNumberResult>;
    private getBuildNumbers;
    private saveBuildNumbers;
}
//# sourceMappingURL=build-number-manager.d.ts.map