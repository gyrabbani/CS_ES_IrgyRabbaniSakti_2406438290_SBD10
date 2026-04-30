const Transaction = require('../models/transaction.model');
const Item = require('../models/item.model');
const User = require('../models/user.model');
const { AppError } = require('../middleware/errorHandler');

class TransactionService {
  static async createTransaction({ user_id, item_id, quantity, description }) {
    // Get item price
    const item = await Item.findById(item_id);
    if (!item) {
      throw new AppError('Item not found', 404);
    }

    await Item.decreaseStock(item_id, quantity);

    // Check stock
    if (item.stock < quantity) {
      throw new AppError('Insufficient stock', 400);
    }

    const total = item.price * quantity;
    const transaction = await Transaction.create({ user_id, item_id, quantity, total, description });
    return transaction;
  }

  static async getTransactionById(id) {
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }
    return transaction;
  }

  static async payTransaction(transactionId, userId) {
    // Simple update status to paid, no balance check
    const result = await Transaction.pay(transactionId, userId);
    return result;
  }

  static async deleteTransaction(id) {
    const transaction = await Transaction.delete(id);
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }
    return transaction;
  }
}

module.exports = TransactionService;