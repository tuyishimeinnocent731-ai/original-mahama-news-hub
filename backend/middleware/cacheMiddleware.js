const Redis = require('ioredis');
let client = null;

function initRedis() {
  const url = process.env.REDIS_URL || (process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` : null);
  if (!url) return null;
  if (client) return client;
  client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 2 });
  client.on('error', (err) => console.error('Redis error', err));
  client.connect().catch(err => console.error('Redis connect error', err));
  return client;
}

async function cacheGetOrSet(key, ttlSeconds, fn) {
  if (!client) return fn();
  try {
    const cached = await client.get(key);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { /* ignore parse */ }
    }
    const result = await fn();
    try { await client.set(key, JSON.stringify(result), 'EX', ttlSeconds || 60); } catch (e) {}
    return result;
  } catch (err) {
    return fn();
  }
}

module.exports = { initRedis, cacheGetOrSet, _redisClient: () => client };
