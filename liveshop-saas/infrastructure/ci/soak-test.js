// Soak test: long-running stream session with reconnect behavior  
// Simulates client connecting, staying connected, and reconnecting after network failure.
// Run with: npm install socket.io-client && node infrastructure/ci/soak-test.js

import { io } from 'socket.io-client';

const STREAM_URL = process.env.STREAM_URL || 'http://localhost:3002';
const DURATION_MS = parseInt(process.env.SOAK_DURATION || '60000'); // 1 minute default
const RECONNECT_INTERVAL = 15000; // 15s
const MAX_RECONNECTS = 3;

async function soakTest() {
  let reconnectCount = 0;
  let connectionErrors = 0;
  let startTime = Date.now();

  console.log(`Soak test starting: ${STREAM_URL}, duration: ${DURATION_MS}ms`);

  return new Promise((resolve, reject) => {
    const socket = io(STREAM_URL, { 
      reconnection: true,
      reconnectionDelay: RECONNECT_INTERVAL,
      reconnectionDelayMax: RECONNECT_INTERVAL * 2,
    });

    socket.on('connect', () => {
      console.log(`[${Date.now() - startTime}ms] Connected: ${socket.id}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[${Date.now() - startTime}ms] Disconnected: ${reason}`);
      if (reason === 'io client disconnect' || reason === 'io server disconnect') {
        if (reconnectCount < MAX_RECONNECTS) {
          reconnectCount++;
          console.log(`[${Date.now() - startTime}ms] Reconnecting... (attempt ${reconnectCount})`);
        }
      }
    });

    socket.on('connect_error', (err) => {
      connectionErrors++;
      console.log(`[${Date.now() - startTime}ms] Connection error: ${err.message}`);
      if (connectionErrors > MAX_RECONNECTS) {
        socket.disconnect();
        reject(new Error(`Too many connection errors: ${connectionErrors}`));
      }
    });

    // Simulate periodic message sends
    const sendInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping', { timestamp: Date.now() });
      }
    }, 5000);

    // Check elapsed time and tear down
    const timeoutId = setTimeout(() => {
      clearInterval(sendInterval);
      socket.disconnect();
      
      const elapsed = Date.now() - startTime;
      console.log(`\n=== SOAK TEST RESULTS ===`);
      console.log(`Duration: ${elapsed}ms`);
      console.log(`Reconnects: ${reconnectCount}`);
      console.log(`Connection errors: ${connectionErrors}`);
      
      if (connectionErrors > MAX_RECONNECTS) {
        reject(new Error('Soak test failed: too many errors'));
      } else {
        resolve();
      }
    }, DURATION_MS);

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  });
}

soakTest()
  .then(() => {
    console.log('Soak test PASSED');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Soak test FAILED:', err.message);
    process.exit(1);
  });
