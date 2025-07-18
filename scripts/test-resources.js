/**
 * Test Resource Generator
 * Generates a small batch of resources for testing
 */

const { generateResource, RESOURCE_DATA } = require('./generate-resources');

// Generate 5 test resources
console.log('🧪 Testing resource generation...\n');

for (let i = 0; i < 5; i++) {
  const resource = generateResource(i);
  console.log(`📄 Resource ${i + 1}:`);
  console.log(`   Title: ${resource.title}`);
  console.log(`   Type: ${resource.resource_type}`);
  console.log(`   Difficulty: ${resource.difficulty_level}`);
  console.log(`   Premium: ${resource.is_premium ? 'Yes' : 'No'}`);
  console.log(`   Published: ${resource.is_published ? 'Yes' : 'No'}`);
  console.log(`   Tags: ${resource.tags.join(', ')}`);
  console.log(`   Estimated Time: ${resource.estimated_read_time} min`);
  console.log(`   Content Length: ${resource.content.length} chars`);
  console.log(`   URL: ${resource.content_url}`);
  console.log('');
}

console.log('✅ Test completed successfully!');
console.log('\nTo generate all 1,000 resources, run:');
console.log('npm run generate:resources');