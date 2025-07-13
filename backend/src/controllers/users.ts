
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request, Response } from 'express';

const userController = {
  // Register new user
  async register(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role: role || 'user'
      });

      await user.save();

      // Generate token
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
      }
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: 'Server error', error: message });
      return;
    }
  },

  // Login user
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });
        if (!user) {
          res.status(400).json({ message: 'Invalid credentials' });
          return;
        }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          res.status(400).json({ message: 'Invalid credentials' });
          return;
        }

      // Generate token
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
      }
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
        return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: 'Server error', error: message });
        return;
    }
  },

  // Get user profile
  async getProfile(req: Request, res: Response) {
    try {
      const user = await User.findById(req.user?.userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
        return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: 'Server error', error: message });
        return;
    }
  },

  // Update user profile
  async updateProfile(req: Request, res: Response) {
    try {
      const { name, email, currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user?.userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update basic fields
      if (name) user.name = name;
      if (email) user.email = email;

      // Update password if provided
      if (currentPassword && newPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }
        
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
      }

      await user.save();

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
        return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: 'Server error', error: message });
        return;
    }
  },

  // Delete user profile
  async deleteProfile(req: Request, res: Response) {
    try {
      await User.findByIdAndDelete(req.user?.userId);
      res.json({ message: 'Profile deleted successfully' });
        return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: 'Server error', error: message });
        return;
    }
  },

  // Get all users (admin only)
  async getAllUsers(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const users = await User.find().select('-password');
      res.json(users);
        return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: 'Server error', error: message });
        return;
    }
  },

  // Get user by ID
  async getUserById(req: Request, res: Response) {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
        return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: 'Server error', error: message });
        return;
    }
  },

  // Update user (admin only)
  async updateUser(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User updated successfully', user });
        return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: 'Server error', error: message });
        return;
    }
  },

  // Delete user (admin only)
  async deleteUser(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
        return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: 'Server error', error: message });
        return;
    }
  },

  // Forgot password
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      (user as any).resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      (user as any).resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

      await user.save();

      // In a real app, you would send an email here
      res.json({ 
        message: 'Password reset token generated',
        resetToken // Remove this in production
      });
        return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: 'Server error', error: message });
        return;
    }
  },

  // Reset password
  async resetPassword(req: Request, res: Response) {
    try {
      const { password } = req.body;
      const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      (user as any).resetPasswordToken = undefined;
      (user as any).resetPasswordExpire = undefined;

      await user.save();

      res.json({ message: 'Password reset successfully' });
        return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: 'Server error', error: message });
        return;
    }
  }
};

export default userController;