const express = require('express');
const router = express.Router();
const Match = require('../models/Match');

router.get('/', async (req, res, next) => {
  try {
    const matches = await Match.findActiveMatches(req.user.sub);
    res.json({
      success: true,
      data: matches
    });
  } catch (err) {
    next(err);
  }
});

// Additional match routes...

module.exports = router; 