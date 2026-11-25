import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { logAudit } from '../middleware/auditMiddleware.js';
import { invalidateUserCache } from '../middleware/authMiddleware.js';
import {
  ensureRbacSeeded,
  loadUserWithRbac,
  buildUserAuthContext,
  userHasPermission,
} from '../services/rbacService.js';
import { LEGACY_ROLE_TO_SLUG } from '../config/permissions.js';

const JWT_SECRET = process.env.JWT_SECRET || 'chandrapur-collectorate-secure-jwt-secret-key-2026';

/**
 * POST /api/auth/login
 * Officer & Admin login with email and password
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

    await ensureRbacSeeded();

    const normalizedEmail = email.trim().toLowerCase();
    const dbUser = await loadUserWithRbac({ email: normalizedEmail });

    if (!dbUser) {
      return res.status(401).json({
        success: false,
        error: 'अवैध ईमेल किंवा संकेतशब्द. (Invalid credentials)',
      });
    }

    if (!dbUser.isActive || dbUser.roleRef?.isActive === false) {
      return res.status(403).json({
        success: false,
        error: 'हे खाते किंवा भूमिका निष्क्रिय करण्यात आली आहे. कृपया प्रशासकाशी संपर्क साधा. (Account or role is inactive)',
      });
    }

    const isMatch = await bcrypt.compare(password, dbUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'अवैध ईमेल किंवा संकेतशब्द. (Invalid credentials)',
      });
    }

    const userPayload = buildUserAuthContext(dbUser);

    // Determine expiry based on role
    const isOfficer = userPayload.roleSlug !== 'viewer' && dbUser.role !== 'CITIZEN';
    const expiresIn = isOfficer ? '8h' : '24h';
    const expiresAt = new Date(Date.now() + (isOfficer ? 8 : 24) * 60 * 60 * 1000);

    const token = jwt.sign(
      {
        id: userPayload.id,
        email: userPayload.email,
        role: userPayload.role,
        roleId: userPayload.roleId,
        roleSlug: userPayload.roleSlug,
        tokenVersion: userPayload.tokenVersion,
        fullName: userPayload.fullName,
        designation: userPayload.designation,
        taluka: userPayload.taluka,
      },
      JWT_SECRET,
      { expiresIn }
    );

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
          userId: dbUser.id,
          token,
          ipAddress: ipAddress.slice(0, 64),
          userAgent: userAgent.slice(0, 512),
          expiresAt,
        },
      }),
      prisma.user.update({
        where: { id: dbUser.id },
        data: { lastLoginAt: new Date() },
      }),
      logAudit({
        userId: dbUser.id,
        action: 'USER_LOGIN',
        entityType: 'User',
        entityId: dbUser.id,
        newData: { email: dbUser.email, role: dbUser.role, roleSlug: userPayload.roleSlug },
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
 * Return currently authenticated user profile with live role & permissions
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

    if (req.user?.id) {
      invalidateUserCache(req.user.id);
    }

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
 * Provision a new officer account (requires user.manage permission)
 */
export const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobile,
      password,
      role = 'TEHSILDAR',
      roleId,
      roleSlug,
      taluka,
      designation,
      consentGiven = true,
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'नाव, ईमेल आणि संकेतशब्द अनिवार्य आहेत. (Full name, email and password are required)',
      });
    }

    if (!consentGiven) {
      return res.status(400).json({
        success: false,
        error: 'गोपनीयता धोरण व डेटा संरक्षण संमती आवश्यक आहे. (Consent to privacy policy is mandatory under DPDPA 2023)',
      });
    }

    if (!req.user || !userHasPermission(req.user, 'user.manage')) {
      return res.status(403).json({
        success: false,
        error: 'हे पोर्टल केवळ अंतर्गत वापरासाठी आहे. नवीन खाते तयार करण्यासाठी user.manage अधिकार आवश्यक आहेत. (Requires user.manage permission)',
      });
    }

    await ensureRbacSeeded();

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

    // Resolve dynamic Role record
    let targetRole = null;
    if (roleId) {
      targetRole = await prisma.role.findUnique({ where: { id: roleId } });
    } else if (roleSlug) {
      targetRole = await prisma.role.findUnique({ where: { slug: roleSlug } });
    } else {
      const mappedSlug = LEGACY_ROLE_TO_SLUG[role] || String(role).toLowerCase();
      targetRole = await prisma.role.findUnique({ where: { slug: mappedSlug } });
    }

    if (!targetRole || !targetRole.isActive) {
      return res.status(400).json({
        success: false,
        error: 'अवैध किंवा निष्क्रिय भूमिका. (Invalid or inactive role)',
      });
    }

    if (!req.user.isWildcard && targetRole.hierarchyLevel >= req.user.hierarchyLevel) {
      return res.status(403).json({
        success: false,
        error: 'आपण आपल्यापेक्षा उच्च किंवा समकक्ष भूमिका असलेले खाते तयार करू शकत नाही. (Cannot provision account with equal or higher role hierarchy)',
      });
    }

    const legacyEnumMap = {
      superadmin: 'COLLECTOR',
      admin: 'SUB_COLLECTOR',
      officer: 'TEHSILDAR',
      data_operator: 'TALATHI',
      viewer: 'CITIZEN',
    };
    const validEnumRoles = [
      'SUPERADMIN',
      'COLLECTOR',
      'SUB_COLLECTOR',
      'SDO',
      'TEHSILDAR',
      'NAIB_TEHSILDAR',
      'CIRCLE_OFFICER',
      'TALATHI',
      'CITIZEN',
    ];
    const resolvedLegacyRole = validEnumRoles.includes(role)
      ? role
      : (legacyEnumMap[targetRole.slug] || 'TEHSILDAR');

    const passwordHash = await bcrypt.hash(password, 12);

    const created = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        mobile: mobile || null,
        passwordHash,
        role: resolvedLegacyRole,
        roleId: targetRole.id,
        taluka: taluka || null,
        designation: designation || targetRole.nameMr || targetRole.name,
        isActive: true,
        consentGiven: true,
        consentAt: new Date(),
        consentVersion: '1.0',
      },
    });

    const enrichedUser = buildUserAuthContext(await loadUserWithRbac({ id: created.id }));

    await logAudit({
      userId: req.user.id,
      action: 'USER_REGISTER',
      entityType: 'User',
      entityId: created.id,
      newData: { email: created.email, roleSlug: targetRole.slug, roleName: targetRole.name, taluka: created.taluka },
      req,
    });

    return res.status(201).json({
      success: true,
      user: enrichedUser,
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
        roleRef: {
          select: {
            slug: true,
            name: true,
            nameMr: true,
          },
        },
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

    await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    invalidateUserCache(userId);
    const updatedUser = buildUserAuthContext(await loadUserWithRbac({ id: userId }));

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

    invalidateUserCache(userId);

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
