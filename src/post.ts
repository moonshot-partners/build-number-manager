import * as core from '@actions/core';
import { BuildNumberManager } from './build-number-manager';

async function post(): Promise<void> {
  try {
    // Get saved state from main action
    const id = core.getState('id');
    const initialNumber = parseInt(core.getState('initial_number'), 10);
    const ghRepo = core.getState('gh_repo');
    const githubToken = core.getState('github_token');
    const newNumber = parseInt(core.getState('new_number'), 10);

    if (!id || !ghRepo || !githubToken || isNaN(initialNumber) || isNaN(newNumber)) {
      core.info('No build number state found or invalid state. Skipping post action.');
      return;
    }

    core.info(`Post action: Saving build number ${newNumber} for ID: ${id}`);

    // Initialize build number manager
    const manager = new BuildNumberManager(githubToken, ghRepo);

    // Save the incremented build number to repository
    await manager.saveBuildNumber(id, newNumber);

    core.info(`✅ Build number ${newNumber} successfully saved to repository`);

  } catch (error) {
    core.warning(`Failed to save build number: ${error instanceof Error ? error.message : 'Unknown error'}`);
    // Don't fail the entire workflow if post action fails
  }
}

post(); 
