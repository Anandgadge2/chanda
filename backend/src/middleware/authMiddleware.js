import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'chandrapur-collectorate-secure-jwt-secret-key-2026';

/**
 * Middleware: Verify JWT Bearer token and attach user to req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'अनधिकृत प्रवेश. कृपया लॉगिन करा. (Authentication required: Missing or invalid token)',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'प्रवेश टोकन आढळले नाही. (Token not provided)',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        role: true,
        taluka: true,
        designation: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'वापरकर्ता निष्क्रीय किंवा अस्तित्वात नाही. (User inactive or not found)',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'आपले सत्र संपले आहे. कृपया पुन्हा लॉगिन करा. (Session expired. Please login again)',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'अवैध टोकन. (Invalid authentication token)',
    });
  }
};

/**
 * Middleware: Role-based access control
 * @param  {...string} roles Allowed UserRoles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'अनधिकृत प्रवेश. (Authentication required)',
      });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `या कृतीसाठी आपणास अधिकार नाहीत. (Access forbidden: Requires one of [${roles.join(', ')}], current role is ${req.user.role})`,
      });
    }

    next();
  };
};
