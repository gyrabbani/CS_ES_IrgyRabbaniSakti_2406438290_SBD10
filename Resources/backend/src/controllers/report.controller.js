const db = require('../config/database');

class ReportController {
  // TODO: Implementasi endpoint laporan dengan query SQL kompleks
  static async getTopUsers(req, res, next) {
    // GET /reports/top-users?limit=10
    // Query: ranking pengguna berdasarkan total pengeluaran (gunakan window function RANK())
    try {
      const limit = parseInt(req.query.limit) || 10;
      const query = `
        SELECT
          u.id,
          u.name,
          u.username,
          COALESCE(SUM(t.total), 0) AS total_spent,
          RANK() OVER (ORDER BY COALESCE(SUM(t.total), 0) DESC) as rank
        FROM users u
        LEFT JOIN transactions t ON u.id = t.user_id
        GROUP BY u.id, u.name, u.username
        ORDER BY rank
        LIMIT $1
      `;
      const result = await db.query(query, [limit]);

      res.status(200).json({
        success: true,
        message: 'Top users retrieved successfully',
        payload: result.rows,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getItemsSold(req, res, next) {
    // GET /reports/items-sold
    // Query: total quantity terjual dan total pendapatan per item (gunakan JOIN dan SUM)
    try {
      const query = `
        SELECT
          i.id,
          i.name,
          COALESCE(SUM(t.quantity), 0) as total_quantity_sold,
          COALESCE(SUM(t.total), 0) as total_revenue
        FROM items i
        LEFT JOIN transactions t ON i.id = t.item_id
        GROUP BY i.id, i.name
        ORDER BY total_revenue DESC
      `;
      const result = await db.query(query);

      res.status(200).json({
        success: true,
        message: 'Items sold report retrieved successfully',
        payload: result.rows,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMonthlySales(req, res, next) {
    // GET /reports/monthly-sales?year=2026
    // Query: ringkasan penjualan bulanan (gunakan date_trunc dan GROUP BY)
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const query = `
        SELECT
          DATE_TRUNC('month', created_at) as month,
          COALESCE(SUM(total), 0) as total_sales,
          COALESCE(SUM(quantity), 0) as total_items_sold
        FROM transactions
        WHERE EXTRACT(YEAR FROM created_at) = $1
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month
      `;
      const result = await db.query(query, [year]);

      res.status(200).json({
        success: true,
        message: 'Monthly sales report retrieved successfully',
        payload: result.rows,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReportController;