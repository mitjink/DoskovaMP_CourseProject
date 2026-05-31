const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/coaches-by-pool', reportController.getCoachesByPool);
router.get('/profit-by-coach', reportController.getProfitByCoach);
router.get('/coaches-with-beginners', reportController.getCoachesWithBeginners);
router.get('/visitors-by-coach/:coachId', reportController.getVisitorsByCoach);
router.get('/groups-by-day', reportController.getGroupsByDay);
router.get('/pool-with-max-revenue', reportController.getPoolWithMaxRevenue);

module.exports = router;