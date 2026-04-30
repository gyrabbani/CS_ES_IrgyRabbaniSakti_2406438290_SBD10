const db = require('../config/database');

class User {
  static async create({ name, username, email, phone, password, balance }) {
    const result = await db.query(
      'INSERT INTO users (name, username, email, phone, password, balance) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, username, email, phone, balance, created_at',
      [name, username, email, phone, password, balance]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query('SELECT id, name, username, email, phone, balance, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async update(id, { name, username, email, phone, password, balance }) {
    const result = await db.query(
      `UPDATE users SET 
        name = COALESCE($1, name), 
        username = COALESCE($2, username), 
        email = COALESCE($3, email), 
        phone = COALESCE($4, phone), 
        password = COALESCE($5, password), 
        balance = COALESCE($6, balance) 
      WHERE id = $7 
      RETURNING id, name, username, email, phone, balance`,
      [name, username, email, phone, password, balance, id]
    );
    return result.rows[0];
  }

  static async getTransactions(userId) {
    const result = await db.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  // Keep old methods for compatibility but they will not be used
  static async getTransactionHistory(userId) {
    // Simple version without JOIN
    const result = await db.query(
      `SELECT t.*, i.name as item_name, i.price as item_price 
       FROM transactions t 
       JOIN items i ON t.item_id = i.id 
       WHERE t.user_id = $1 
       ORDER BY t.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async getTotalSpent(userId) {
    const result = await db.query(
      'SELECT SUM(total) as total_spent FROM transactions WHERE user_id = $1',
      [userId]
    );
    return result.rows[0].total_spent || 0;
  }

  static async updateBalance(id, newBalance) {
    const result = await db.query(
      'UPDATE users SET balance = $1 WHERE id = $2 RETURNING balance',
      [newBalance, id]
    );
    return result.rows[0].balance;
  }
}

module.exports = User;