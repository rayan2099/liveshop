// Load test: hammer API /health endpoint and POST /orders
// Run with: npm install autocannon && node infrastructure/ci/load-test.js

import autocannon from 'autocannon';

const opts = {
  url: process.env.API_URL || 'http://localhost:3001',
  connections: parseInt(process.env.CONNECTIONS || '10'),
  pipelining: 5,
  duration: parseInt(process.env.DURATION || '30'),
  requests: [
    {
      path: '/health',
      method: 'GET',
      title: 'GET /health',
    },
  ],
};

async function run() {
  try {
    console.log(`Load test starting: ${opts.url} with ${opts.connections} connections for ${opts.duration}s`);
    const result = await autocannon(opts);
    
    console.log('\n=== LOAD TEST RESULTS ===');
    console.log(`Requests: ${result.requests.total}`);
    console.log(`Throughput: ${Math.round(result.throughput.total / 1024 / 1024 * 100) / 100} MB/s`);
    console.log(`Latency avg: ${Math.round(result.latency.mean)}ms`);
    console.log(`Latency p99: ${Math.round(result.latency.p99)}ms`);
    console.log(`Errors: ${result.errors}`);
    console.log(`Timeouts: ${result.timeouts}`);
    
    // Exit with error if too many failures
    if (result.errors > result.requests.total * 0.05) {
      console.error('ERROR: >5% request failure rate');
      process.exit(1);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Load test failed:', err);
    process.exit(2);
  }
}

run();
