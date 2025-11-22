const { createClient } = require('redis');

const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});

(async () => {
  try {
    await client.connect();
    console.log('Connected to Redis successfully');
  } catch (e) {
    console.error('Failed to connect to Redis:', e);
  }
})();

module.exports = client;