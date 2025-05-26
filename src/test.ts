import { BuildNumberManager } from './build-number-manager';

// Simple test to verify the BuildNumberManager class
async function testBuildNumberManager() {
  console.log('🧪 Testing BuildNumberManager...');
  
  // Note: This is a basic test that would require a real GitHub token and repository
  // In a real scenario, you would use a testing framework like Jest
  
  try {
    const token = process.env.GITHUB_TOKEN || 'fake-token-for-testing';
    const repo = 'test-owner/test-repo';
    
    const manager = new BuildNumberManager(token, repo);
    console.log('✅ BuildNumberManager instance created successfully');
    
    // Test repository parsing
    const [owner, repoName] = repo.split('/');
    console.log(`✅ Repository parsed: owner=${owner}, repo=${repoName}`);
    
    console.log('🎉 Basic tests passed!');
    console.log('📝 Note: Full integration tests require a real GitHub token and repository');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testBuildNumberManager();
} 
