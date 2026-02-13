// Simple smoke tests: check API /health and streaming socket.io connect
import { io } from 'socket.io-client';

// Use Node 20 global fetch

const API_HEALTH = process.env.API_HEALTH || 'http://localhost:3001/health';
const STREAM_URL = process.env.STREAM_URL || 'http://localhost:3002';

async function checkApi() {
  const res = await fetch(API_HEALTH, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`API health check failed: ${res.status}`);
  }
  const body = await res.json();
  console.log('API health:', body);
}

async function checkSocket() {
  return new Promise((resolve, reject) => {
    const socket = io(STREAM_URL, { timeout: 5000 });
    const timeout = setTimeout(() => {
      socket.close();
      reject(new Error('Socket connect timeout'));
    }, 8000);

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      clearTimeout(timeout);
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

(async () => {
  try {
    await checkApi();
    await checkSocket();
    console.log('Smoke tests passed');
    process.exit(0);
  } catch (err) {
    console.error('Smoke tests failed', err);
    process.exit(2);
  }
})();
