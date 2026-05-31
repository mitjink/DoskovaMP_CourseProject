const express = require('express');
const router = express.Router();
const poolController = require('../controllers/poolController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', poolController.getAll);
router.get('/:id', poolController.getById);
router.post('/', authMiddleware, roleMiddleware('admin'), poolController.create);
router.patch('/:id', authMiddleware, roleMiddleware('admin'), poolController.update);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), poolController.delete);

module.exports = router;