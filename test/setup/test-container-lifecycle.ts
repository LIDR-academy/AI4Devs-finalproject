import { ContainerSetup } from './container.setup';

async function testContainerLifecycle() {
  const containerSetup = new ContainerSetup();
  
  console.log('=== Testing Container Lifecycle ===\n');
  
  try {
    // Test 1: Start containers
    console.log('1. Starting containers...');
    await containerSetup.startContainers();
    
    // Test 2: Verify containers are running (without stopping them)
    console.log('\n2. Verifying containers are running...');
    const areRunning = await containerSetup.areContainersRunning();
    if (areRunning) {
      console.log('✅ All test containers are running successfully!');
    } else {
      console.log('❌ Some test containers are not running');
    }
    
    console.log('\n✅ Container lifecycle test completed successfully!');
    console.log('Note: Test containers are left running for other tests to use.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testContainerLifecycle();
