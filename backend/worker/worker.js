/*
 Standalone worker to process sync jobs.
 Run separately in production (recommended).
 */
require('dotenv').config();
const { Worker } = require('bullmq');
const { initLogger } = require('../middleware/logger');
const { initRedis } = require('../middleware/cacheMiddleware');

const logger = initLogger();
const redisClient = initRedis();
const connection = redisClient ? { connection: redisClient } : { connection: { host: process.env.REDIS_HOST || '127.0.0.1', port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379 } };

const worker = new Worker('external-sync', async job => {
  const { processSync } = require('../worker/processSync');
  const inserted = await processSync(job.data.source || 'all');
  logger.info('Processed job %s, inserted %d articles', job.id, inserted.length || 0);
  return inserted.length;
}, connection);

worker.on('completed', job => logger.info('Job %s completed', job.id));
worker.on('failed', (job, err) => logger.error('Job %s failed: %s', job.id, err.message));
