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

    // Get current build number (without incrementing in repo yet)
    const result = await manager.getCurrentBuildNumber(id, initialNumber);

    // Save state for post action
    core.saveState('id', id);
    core.saveState('initial_number', initialNumber.toString());
    core.saveState('gh_repo', ghRepo);
    core.saveState('github_token', githubToken);
    core.saveState('new_number', result.newNumber.toString());

    // Set outputs
    core.setOutput('build_number', result.newNumber.toString());
    core.setOutput('previous_number', result.previousNumber.toString());

    core.info(`Previous build number: ${result.previousNumber}`);
    core.info(`New build number: ${result.newNumber} (will be saved after job completion)`);

  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

run(); 
