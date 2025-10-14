module.exports = (syncQueue) => {
  const express = require('express');
  const router = express.Router();
  const { protect, admin } = require('../middleware/authMiddleware');

  router.post('/sync', protect, admin, async (req, res, next) => {
    try {
      const { source } = req.body || {};
      const job = await syncQueue.add('sync', { source: source || 'all' }, { removeOnComplete: true, removeOnFail: true });
      res.json({ message: 'Sync enqueued', jobId: job.id });
    } catch (err) { next(err); }
  });

  router.post('/sync-now', protect, admin, async (req, res, next) => {
    try {
      const { processSync } = require('../worker/processSync');
      const inserted = await processSync(req.body?.source || 'all');
      res.json({ inserted: inserted.length });
    } catch (err) { next(err); }
  });

  return router;
};
