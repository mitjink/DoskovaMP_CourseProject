const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coachController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', coachController.getAll);
router.get('/:id', coachController.getById);
router.get('/pool/:poolId', coachController.getByPoolId);
router.post('/', authMiddleware, roleMiddleware('admin'), coachController.create);
router.patch('/:id', authMiddleware, roleMiddleware('admin'), coachController.update);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), coachController.deleteCoach);

module.exports = router;