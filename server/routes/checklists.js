const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/checklistController');

const router = express.Router();

const checklistValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  validate,
];

const itemValidation = [
  body('text').trim().notEmpty().withMessage('Item text is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  validate,
];

router.get('/', ctrl.getChecklists);
router.post('/', checklistValidation, ctrl.createChecklist);
router.get('/:id', ctrl.getChecklist);
router.put('/:id', ctrl.updateChecklist);
router.delete('/:id', ctrl.deleteChecklist);

router.post('/:id/items', itemValidation, ctrl.addItem);
router.put('/:id/items/:itemId', ctrl.updateItem);
router.delete('/:id/items/:itemId', ctrl.deleteItem);
router.patch('/:id/items/:itemId/toggle', ctrl.toggleItem);

module.exports = router;
