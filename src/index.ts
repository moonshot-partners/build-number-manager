import * as core from '@actions/core';
import { BuildNumberManager } from './build-number-manager';

async function run(): Promise<void> {
  try {
    // Get inputs
    const id = core.getInput('id', { required: true });
    const initialNumber = parseInt(core.getInput('initial_number', { required: true }), 10);
    const ghRepo = core.getInput('gh_repo', { required: true });
    const githubToken = core.getInput('github_token') || process.env.GITHUB_TOKEN;

    if (!githubToken) {
      throw new Error('GitHub token is required');
    }

    if (isNaN(initialNumber)) {
      throw new Error('initial_number must be a valid number');
    }

    core.info(`Managing build number for ID: ${id}`);
    core.info(`Repository: ${ghRepo}`);
    core.info(`Initial number: ${initialNumber}`);

    // Initialize build number manager
    const manager = new BuildNumberManager(githubToken, ghRepo);

    // Get current build number and increment it
    const result = await manager.getAndIncrementBuildNumber(id, initialNumber);

    // Set outputs
    core.setOutput('build_number', result.newNumber.toString());
    core.setOutput('previous_number', result.previousNumber.toString());

    core.info(`Previous build number: ${result.previousNumber}`);
    core.info(`New build number: ${result.newNumber}`);

  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

run(); 
