"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildNumberManager = void 0;
const rest_1 = require("@octokit/rest");
const core = __importStar(require("@actions/core"));
class BuildNumberManager {
    constructor(githubToken, repository) {
        this.buildNumbersPath = '.github/build-numbers.json';
        this.octokit = new rest_1.Octokit({
            auth: githubToken,
        });
        const [owner, repo] = repository.split('/');
        if (!owner || !repo) {
            throw new Error('Repository must be in format "owner/repo"');
        }
        this.owner = owner;
        this.repo = repo;
    }
    async getCurrentBuildNumber(id, initialNumber) {
        try {
            // Get existing build numbers file
            const buildNumbers = await this.getBuildNumbers();
            const previousNumber = buildNumbers[id] || (initialNumber - 1);
            const newNumber = previousNumber + 1;
            const created = !(id in buildNumbers);
            return {
                previousNumber,
                newNumber,
                created
            };
        }
        catch (error) {
            core.error(`Error getting build number: ${error}`);
            throw error;
        }
    }
    async saveBuildNumber(id, newNumber) {
        try {
            // Get current build numbers
            const buildNumbers = await this.getBuildNumbers();
            // Update with new number
            buildNumbers[id] = newNumber;
            // Save updated build numbers
            await this.saveBuildNumbers(buildNumbers);
        }
        catch (error) {
            core.error(`Error saving build number: ${error}`);
            throw error;
        }
    }
    async getAndIncrementBuildNumber(id, initialNumber) {
        try {
            // Try to get existing build numbers file
            const buildNumbers = await this.getBuildNumbers();
            const previousNumber = buildNumbers[id] || (initialNumber - 1);
            const newNumber = previousNumber + 1;
            const created = !(id in buildNumbers);
            // Update build numbers
            buildNumbers[id] = newNumber;
            // Save updated build numbers
            await this.saveBuildNumbers(buildNumbers);
            return {
                previousNumber,
                newNumber,
                created
            };
        }
        catch (error) {
            core.error(`Error managing build number: ${error}`);
            throw error;
        }
    }
    async getBuildNumbers() {
        try {
            const response = await this.octokit.repos.getContent({
                owner: this.owner,
                repo: this.repo,
                path: this.buildNumbersPath,
            });
            if ('content' in response.data) {
                const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
                return JSON.parse(content);
            }
            return {};
        }
        catch (error) {
            if (error.status === 404) {
                core.info('Build numbers file not found, creating new one');
                return {};
            }
            throw error;
        }
    }
    async saveBuildNumbers(buildNumbers) {
        const content = JSON.stringify(buildNumbers, null, 2);
        const encodedContent = Buffer.from(content).toString('base64');
        try {
            // Try to get existing file to get its SHA
            const existingFile = await this.octokit.repos.getContent({
                owner: this.owner,
                repo: this.repo,
                path: this.buildNumbersPath,
            });
            let sha;
            if ('sha' in existingFile.data) {
                sha = existingFile.data.sha;
            }
            // Update existing file
            await this.octokit.repos.createOrUpdateFileContents({
                owner: this.owner,
                repo: this.repo,
                path: this.buildNumbersPath,
                message: `Update build numbers`,
                content: encodedContent,
                sha,
            });
        }
        catch (error) {
            if (error.status === 404) {
                // Create new file
                await this.octokit.repos.createOrUpdateFileContents({
                    owner: this.owner,
                    repo: this.repo,
                    path: this.buildNumbersPath,
                    message: `Initialize build numbers`,
                    content: encodedContent,
                });
            }
            else {
                throw error;
            }
        }
        core.info(`Build numbers updated and committed to ${this.buildNumbersPath}`);
    }
}
exports.BuildNumberManager = BuildNumberManager;
//# sourceMappingURL=build-number-manager.js.map