import * as core from '@actions/core';
import { BuildNumberManager } from './build-number-manager';

async function run(): Promise<void> {
  try {
    // Get inputs
    const id = core.getInput('id', { required: true });
    const initialNumber = parseInt(core.getInput('initial_number', { required: true }), 10);
    const ghRepo = core.getInput('gh_repo', { required: true });
    const githubToken = core.getInput('github_token') || process.env.GITHUB_TOKEN;
    const onlyIncrementAfterFinish = core.getInput('only_increment_after_finish') === 'true';

    if (!githubToken) {
      throw new Error('GitHub token is required');
    }

    if (isNaN(initialNumber)) {
      throw new Error('initial_number must be a valid number');
    }

    core.info(`Managing build number for ID: ${id}`);
    core.info(`Repository: ${ghRepo}`);
    core.info(`Initial number: ${initialNumber}`);
    core.info(`Only increment after finish: ${onlyIncrementAfterFinish}`);

    // Initialize build number manager
    const manager = new BuildNumberManager(githubToken, ghRepo);

    let result;

    if (onlyIncrementAfterFinish) {
      // Original behavior: get current number without incrementing in repo yet
      result = await manager.getCurrentBuildNumber(id, initialNumber);

      // Save state for post action
      core.saveState('id', id);
      core.saveState('initial_number', initialNumber.toString());
      core.saveState('gh_repo', ghRepo);
      core.saveState('github_token', githubToken);
      core.saveState('new_number', result.newNumber.toString());
      core.saveState('only_increment_after_finish', 'true');

      core.info(`Previous build number: ${result.previousNumber}`);
      core.info(`New build number: ${result.newNumber} (will be saved after job completion)`);
    } else {
      // New behavior: increment immediately
      result = await manager.getAndIncrementBuildNumber(id, initialNumber);

      // Save state to indicate post action should not run
      core.saveState('only_increment_after_finish', 'false');

      core.info(`Previous build number: ${result.previousNumber}`);
      core.info(`New build number: ${result.newNumber} (saved immediately)`);
    }

    // Set outputs
    core.setOutput('build_number', result.newNumber.toString());
    core.setOutput('previous_number', result.previousNumber.toString());

  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

run(); 
