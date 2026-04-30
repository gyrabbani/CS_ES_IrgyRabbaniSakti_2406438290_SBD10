const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/item.controller');

// Public routes
router.get('/', ItemController.getAllItems);
router.get('/:id', ItemController.getItemById);
router.post('/', ItemController.createItem);
router.put('/:id', ItemController.updateItem);

module.exports = router;