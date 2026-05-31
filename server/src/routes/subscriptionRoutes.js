const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', subscriptionController.getAllPasses);
router.get('/:id', subscriptionController.getPassById);
router.post('/', authMiddleware, roleMiddleware('admin'), subscriptionController.createPass);
router.put('/:id', authMiddleware, roleMiddleware('admin'), subscriptionController.updatePass);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), subscriptionController.deletePass);

router.get('/my', authMiddleware, subscriptionController.getMySubscriptions);
router.post('/buy', authMiddleware, subscriptionController.buySubscription);

module.exports = router;