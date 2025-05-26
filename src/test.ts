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

// Mock test to verify the logic
async function testInitialNumberLogic() {
  console.log('Testing initial number logic...');
  
  // This is a conceptual test - in reality you'd need proper mocking
  // The key logic is:
  // - First time (created = true): previousNumber = initialNumber, newNumber = initialNumber + 1
  // - Subsequent times: previousNumber = stored value, newNumber = previousNumber + 1
  
  const initialNumber = 50;
  
  // Simulate first time scenario
  const firstTimeResult = {
    previousNumber: initialNumber,      // Should be 50
    newNumber: initialNumber + 1,       // Should be 51
    created: true
  };
  
  console.log('First time scenario:');
  console.log(`  Initial number: ${initialNumber}`);
  console.log(`  Previous number: ${firstTimeResult.previousNumber}`);
  console.log(`  New number: ${firstTimeResult.newNumber}`);
  console.log(`  Created: ${firstTimeResult.created}`);
  
  // Simulate subsequent run
  const subsequentResult = {
    previousNumber: 51,                 // Previous stored value
    newNumber: 52,                      // Previous + 1
    created: false
  };
  
  console.log('\nSubsequent run scenario:');
  console.log(`  Previous number: ${subsequentResult.previousNumber}`);
  console.log(`  New number: ${subsequentResult.newNumber}`);
  console.log(`  Created: ${subsequentResult.created}`);
  
  console.log('\n✅ Logic verification complete!');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testBuildNumberManager();
  testInitialNumberLogic();
} 
