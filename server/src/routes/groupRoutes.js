const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', groupController.getAll);
router.get('/:id', groupController.getById);
router.get('/pool/:poolId', groupController.getByPoolId);
router.post('/', authMiddleware, roleMiddleware('admin'), groupController.create);
router.patch('/:id', authMiddleware, roleMiddleware('admin'), groupController.update);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), groupController.deleteGroup);

module.exports = router;