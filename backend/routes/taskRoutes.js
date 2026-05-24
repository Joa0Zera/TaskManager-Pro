const express = require('express');
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', taskController.getAll);
router.post('/', taskController.create);
router.put('/:id', taskController.update);
router.delete('/:id', taskController.delete);

module.exports = router;
