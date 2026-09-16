import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { logAudit } from '../middleware/auditMiddleware.js';

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

    // Prepare user payload
    const userPayload = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      taluka: user.taluka,
      designation: user.designation,
      consentGiven: user.consentGiven,
      consentAt: user.consentAt,
      consentVersion: user.consentVersion,
    };

    // Return instant success response to client immediately
    res.json({
      success: true,
      token,
      user: userPayload,
    });

    // Save session in DB & audit log asynchronously in background
    const ipAddress =
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    Promise.allSettled([
      prisma.session.create({
        data: {
          userId: user.id,
          token,
          ipAddress: ipAddress.slice(0, 64),
          userAgent: userAgent.slice(0, 512),
          expiresAt,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }),
      logAudit({
        userId: user.id,
        action: 'USER_LOGIN',
        entityType: 'User',
        entityId: user.id,
        newData: { email: user.email, role: user.role },
        req,
      }),
    ]).catch((err) => {
      console.warn('Background login tracking warning:', err?.message);
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
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    // Return immediate success so logout is 100% instant
    res.json({
      success: true,
      message: 'सत्र यशस्वीरित्या समाप्त झाले. (Logged out successfully)',
    });

    const tasks = [];
    if (token) {
      tasks.push(
        prisma.session.deleteMany({
          where: { token },
        })
      );
    }

    if (req.user) {
      tasks.push(
        logAudit({
          userId: req.user.id,
          action: 'USER_LOGOUT',
          entityType: 'User',
          entityId: req.user.id,
          req,
        })
      );
    }

    if (tasks.length > 0) {
      Promise.allSettled(tasks).catch((err) => {
        console.warn('Background logout task warning:', err?.message);
      });
    }
  } catch (error) {
    console.error('Error in logout:', error);
    if (!res.headersSent) {
      return res.json({ success: true });
    }
  }
};

/**
 * POST /api/auth/register
 * Admin or self-service user registration
 */
export const register = async (req, res) => {
  try {
    const { fullName, email, mobile, password, role = 'CITIZEN', taluka, designation, consentGiven } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'नाव, ईमेल आणि संकेतशब्द अनिवार्य आहेत. (Full name, email and password are required)',
      });
    }

    // DPDPA 2023 Sec 6: Explicit consent validation
    if (!consentGiven) {
      return res.status(400).json({
        success: false,
        error: 'गोपनीयता धोरण व डेटा संरक्षण संमती आवश्यक आहे. (Consent to privacy policy is mandatory under DPDPA 2023)',
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
        consentGiven: true,
        consentAt: new Date(),
        consentVersion: '1.0',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        role: true,
        taluka: true,
        designation: true,
        consentGiven: true,
        consentAt: true,
        consentVersion: true,
        createdAt: true,
      },
    });

    await logAudit({
      userId: req.user?.id || newUser.id,
      action: 'USER_REGISTER',
      entityType: 'User',
      entityId: newUser.id,
      newData: { email: newUser.email, role: newUser.role, consentVersion: '1.0' },
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

/**
 * GET /api/auth/dpdpa/export
 * DPDPA 2023 Sec 11 - Right to Information & Data Portability
 */
export const exportMyData = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        role: true,
        taluka: true,
        designation: true,
        consentGiven: true,
        consentAt: true,
        consentVersion: true,
        createdAt: true,
        updatedAt: true,
        sessions: {
          select: {
            id: true,
            ipAddress: true,
            userAgent: true,
            createdAt: true,
            expiresAt: true,
          },
        },
        auditLogs: {
          select: {
            id: true,
            action: true,
            entityType: true,
            entityId: true,
            createdAt: true,
          },
          take: 50,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    await logAudit({
      userId,
      action: 'DPDPA_DATA_EXPORT',
      entityType: 'User',
      entityId: userId,
      req,
    });

    return res.json({
      success: true,
      exportTimestamp: new Date().toISOString(),
      regulations: 'Digital Personal Data Protection Act, 2023 (DPDPA)',
      data: user,
    });
  } catch (error) {
    console.error('Error in exportMyData:', error);
    return res.status(500).json({
      success: false,
      error: 'डेटा निर्यात करताना त्रुटी. (Failed to export personal data)',
    });
  }
};

/**
 * POST /api/auth/dpdpa/erasure-request
 * DPDPA 2023 Sec 12 - Right to Correction and Erasure
 */
export const requestErasure = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reason } = req.body;

    await logAudit({
      userId,
      action: 'DPDPA_ERASURE_REQUESTED',
      entityType: 'User',
      entityId: userId,
      newData: { reason: reason || 'Data principal requested erasure under DPDPA Sec 12' },
      req,
    });

    return res.json({
      success: true,
      message: 'आपली डेटा हटविण्याची विनंती नोंदवली गेली आहे. डेटा संरक्षण अधिकाऱ्याद्वारे (DPO) ७२ तासांच्या आत कार्यवाही केली जाईल. (Erasure request logged. Under DPDPA 2023, the Data Protection Officer will review within 72 hours.)',
      requestId: `ER-${Date.now()}`,
    });
  } catch (error) {
    console.error('Error in requestErasure:', error);
    return res.status(500).json({
      success: false,
      error: 'विनंती नोंदवताना त्रुटी. (Failed to register erasure request)',
    });
  }
};

/**
 * PUT /api/auth/profile
 * Update officer / user profile (fullName, mobile, email, designation)
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, mobile, email, designation } = req.body;

    const dataToUpdate = {};
    if (fullName && fullName.trim()) dataToUpdate.fullName = fullName.trim();
    if (mobile !== undefined) dataToUpdate.mobile = mobile.trim();
    if (designation && designation.trim()) dataToUpdate.designation = designation.trim();

    if (email && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== req.user.email) {
        // Check if email already in use
        const existing = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (existing && existing.id !== userId) {
          return res.status(400).json({
            success: false,
            error: 'हा ईमेल पत्ता आधीपासूनच दुसऱ्या खात्यासाठी वापरला गेला आहे. (Email is already registered)',
          });
        }
        dataToUpdate.email = normalizedEmail;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        role: true,
        taluka: true,
        designation: true,
        consentGiven: true,
        consentAt: true,
        consentVersion: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await logAudit({
      userId,
      action: 'USER_PROFILE_UPDATED',
      entityType: 'User',
      entityId: userId,
      previousData: { email: req.user.email, mobile: req.user.mobile, designation: req.user.designation },
      newData: dataToUpdate,
      req,
    });

    return res.json({
      success: true,
      message: 'प्रोफाइल माहिती यशस्वीरित्या अद्यतनित करण्यात आली. (Profile updated successfully)',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return res.status(500).json({
      success: false,
      error: 'प्रोफाइल अद्यतन करताना त्रुटी. (Failed to update profile)',
    });
  }
};

/**
 * POST /api/auth/change-password
 * Change officer password with current password verification
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'कृपया चालू संकेतशब्द आणि नवीन संकेतशब्द दोन्ही प्रविष्ट करा. (Both current and new passwords are required)',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'नवीन संकेतशब्द किमान ८ अक्षरांचा असावा. (Password must be at least 8 characters)',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'वापरकर्ता सापडला नाही. (User not found)',
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'चालू संकेतशब्द चुकीचा आहे. (Current password is incorrect)',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    await logAudit({
      userId,
      action: 'USER_PASSWORD_CHANGED',
      entityType: 'User',
      entityId: userId,
      req,
    });

    return res.json({
      success: true,
      message: 'संकेतशब्द यशस्वीरित्या बदलण्यात आला. (Password changed successfully)',
    });
  } catch (error) {
    console.error('Error in changePassword:', error);
    return res.status(500).json({
      success: false,
      error: 'संकेतशब्द बदलताना त्रुटी. (Failed to change password)',
    });
  }
};


