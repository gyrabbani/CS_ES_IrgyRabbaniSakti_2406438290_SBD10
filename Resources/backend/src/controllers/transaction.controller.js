const TransactionService = require('../services/transaction.service');
const redisClient = require('../database/redis');

class TransactionController {
  static async createTransaction(req, res, next) {
    try {
      const { user_id, item_id, quantity, description } = req.body;
      const transaction = await TransactionService.createTransaction({ user_id, item_id, quantity, description });

      const streamId = await redisClient.xadd(
        'transaction-logs',
        '*',
        'userId', transaction.user_id,
        'itemId', transaction.item_id,
        'total', transaction.total
      );

      console.log(`Log transaksi terkirim ke Redis! Message ID: ${streamId}`);

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        payload: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionById(req, res, next) {
    try {
      const { id } = req.params;
      const transaction = await TransactionService.getTransactionById(id);
      res.status(200).json({
        success: true,
        message: 'Transaction retrieved successfully',
        payload: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  static async payTransaction(req, res, next) {
  try {
    const { id } = req.params;
    console.log("isi req.user:", req.user); 
    
    const userId = req.user?.id || req.user?.userId || req.body.user_id;
    console.log("userId yang kepilih:", userId);
    
    const result = await TransactionService.payTransaction(id, userId);
    res.status(200).json({
      success: true,
      message: 'Payment successful',
      payload: result,
    });
  } catch (error) {
    next(error);
  }
}

  static async deleteTransaction(req, res, next) {
    try {
      const { id } = req.params;
      await TransactionService.deleteTransaction(id);
      res.status(200).json({
        success: true,
        message: 'Transaction deleted successfully',
        payload: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TransactionController;