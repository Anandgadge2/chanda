import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logAudit } from '../middleware/auditMiddleware.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'chandrapur-collectorate-secure-jwt-secret-key-2026';

/**
 * POST /api/auth/login
 * Officer & Citizen login with email and password
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'कृपया ईमेल आणि संकेतशब्द प्रविष्ट करा. (Email and password are required)',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'अवैध ईमेल किंवा संकेतशब्द. (Invalid credentials)',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'हे खाते निष्क्रिय करण्यात आले आहे. कृपया प्रशासकाशी संपर्क साधा. (Account is inactive)',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'अवैध ईमेल किंवा संकेतशब्द. (Invalid credentials)',
      });
    }

    // Determine expiry based on role
    const isOfficer = user.role !== 'CITIZEN';
    const expiresIn = isOfficer ? '8h' : '24h';
    const expiresAt = new Date(Date.now() + (isOfficer ? 8 : 24) * 60 * 60 * 1000);

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        designation: user.designation,
        taluka: user.taluka,
      },
      JWT_SECRET,
      { expiresIn }
    );

    // Save session in DB
    const ipAddress =
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        ipAddress: ipAddress.slice(0, 64),
        userAgent: userAgent.slice(0, 512),
        expiresAt,
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Audit log
    await logAudit({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      newData: { email: user.email, role: user.role },
      req,
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        taluka: user.taluka,
        designation: user.designation,
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({
      success: false,
      error: 'लॉगिन करताना त्रुटी आली. कृपया नंतर पुन्हा प्रयत्न करा. (Internal server error during login)',
    });
  }
};

/**
 * GET /api/auth/me
 * Return currently authenticated user profile
 */
export const getMe = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    return res.status(500).json({
      success: false,
      error: 'माहिती लोड करताना त्रुटी. (Failed to load profile)',
    });
  }
};

/**
 * POST /api/auth/logout
 * Invalidate current session
 */
export const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      await prisma.session.deleteMany({
        where: { token },
      });
    }

    if (req.user) {
      await logAudit({
        userId: req.user.id,
        action: 'USER_LOGOUT',
        entityType: 'User',
        entityId: req.user.id,
        req,
      });
    }

    return res.json({
      success: true,
      message: 'सत्र यशस्वीरित्या समाप्त झाले. (Logged out successfully)',
    });
  } catch (error) {
    console.error('Error in logout:', error);
    return res.status(500).json({
      success: false,
      error: 'लॉगआउट करताना त्रुटी. (Failed to logout)',
    });
  }
};

/**
 * POST /api/auth/register
 * Admin or self-service user registration
 */
export const register = async (req, res) => {
  try {
    const { fullName, email, mobile, password, role = 'CITIZEN', taluka, designation } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'नाव, ईमेल आणि संकेतशब्द अनिवार्य आहेत. (Full name, email and password are required)',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'हा ईमेल आधीपासून नोंदणीकृत आहे. (Email already registered)',
      });
    }

    // Role restrictions: Only authenticated COLLECTOR can create officer roles
    const officerRoles = ['COLLECTOR', 'SDO', 'TEHSILDAR', 'NAIB_TEHSILDAR', 'TALATHI', 'CIRCLE_OFFICER'];
    if (officerRoles.includes(role)) {
      if (!req.user || req.user.role !== 'COLLECTOR') {
        return res.status(403).json({
          success: false,
          error: 'केवळ जिल्हाधिकारी नवीन महसूल अधिकाऱ्यांची नोंदणी करू शकतात. (Only Collector can register officers)',
        });
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email: normalizedEmail,
        mobile: mobile || null,
        passwordHash,
        role,
        taluka: taluka || null,
        designation: designation || null,
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        role: true,
        taluka: true,
        designation: true,
        createdAt: true,
      },
    });

    await logAudit({
      userId: req.user?.id || newUser.id,
      action: 'USER_REGISTER',
      entityType: 'User',
      entityId: newUser.id,
      newData: { email: newUser.email, role: newUser.role },
      req,
    });

    return res.status(201).json({
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.error('Error in register:', error);
    return res.status(500).json({
      success: false,
      error: 'नोंदणी करताना त्रुटी आली. (Registration failed)',
    });
  }
};
