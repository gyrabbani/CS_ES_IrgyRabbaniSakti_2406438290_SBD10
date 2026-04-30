const User = require('../models/user.model');
const { AppError } = require('../middleware/errorHandler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserService {
  static async register({ name, username, email, phone, password }) {
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      throw new AppError('User with this email already exists', 400);
    }
    // Note: username uniqueness is enforced by database constraint

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      username,
      email,
      phone,
      password: hashedPassword,
    });

    return user;
  }

  static async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // No JWT, just return user data
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { 
      user: { id: user.id, name: user.name, username: user.username, email: user.email, phone: user.phone, balance: user.balance },
      token
    };
  }

  static async updateProfile(id, updateData) {
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const updatedUser = await User.update(id, updateData);
    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }
    return updatedUser;
  }

  static async getTransactionHistory(userId) {
    // Simple query without JOIN (just return raw transactions)
    const transactions = await User.getTransactionHistory(userId);
    return transactions;
  }

  static async getTotalSpent(userId) {
    // Simple total without aggregate
    const total = await User.getTotalSpent(userId);
    return total;
  }

  static async getUserByEmail(email) {
    const user = await User.findByEmail(email);
    return user;
  }
}

module.exports = UserService;