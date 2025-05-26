import { Octokit } from '@octokit/rest';
import * as core from '@actions/core';

export interface BuildNumberResult {
  previousNumber: number;
  newNumber: number;
  created: boolean;
}

export class BuildNumberManager {
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private buildNumbersPath = '.github/build-numbers.json';

  constructor(githubToken: string, repository: string) {
    this.octokit = new Octokit({
      auth: githubToken,
    });

    const [owner, repo] = repository.split('/');
    if (!owner || !repo) {
      throw new Error('Repository must be in format "owner/repo"');
    }

    this.owner = owner;
    this.repo = repo;
  }

  async getCurrentBuildNumber(id: string, initialNumber: number): Promise<BuildNumberResult> {
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

    } catch (error) {
      core.error(`Error getting build number: ${error}`);
      throw error;
    }
  }

  async saveBuildNumber(id: string, newNumber: number): Promise<void> {
    try {
      // Get current build numbers
      const buildNumbers = await this.getBuildNumbers();
      
      // Update with new number
      buildNumbers[id] = newNumber;

      // Save updated build numbers
      await this.saveBuildNumbers(buildNumbers);

    } catch (error) {
      core.error(`Error saving build number: ${error}`);
      throw error;
    }
  }

  async getAndIncrementBuildNumber(id: string, initialNumber: number): Promise<BuildNumberResult> {
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

    } catch (error) {
      core.error(`Error managing build number: ${error}`);
      throw error;
    }
  }

  private async getBuildNumbers(): Promise<Record<string, number>> {
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
    } catch (error: any) {
      if (error.status === 404) {
        core.info('Build numbers file not found, creating new one');
        return {};
      }
      throw error;
    }
  }

  private async saveBuildNumbers(buildNumbers: Record<string, number>): Promise<void> {
    const content = JSON.stringify(buildNumbers, null, 2);
    const encodedContent = Buffer.from(content).toString('base64');

    try {
      // Try to get existing file to get its SHA
      const existingFile = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: this.buildNumbersPath,
      });

      let sha: string | undefined;
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

    } catch (error: any) {
      if (error.status === 404) {
        // Create new file
        await this.octokit.repos.createOrUpdateFileContents({
          owner: this.owner,
          repo: this.repo,
          path: this.buildNumbersPath,
          message: `Initialize build numbers`,
          content: encodedContent,
        });
      } else {
        throw error;
      }
    }

    core.info(`Build numbers updated and committed to ${this.buildNumbersPath}`);
  }
} 
