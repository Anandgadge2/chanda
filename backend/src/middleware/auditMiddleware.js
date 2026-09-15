import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Log an audit trail entry in the database.
 * Designed for compliance with Section 65B of the Indian Evidence Act & GIGW 3.0.
 *
 * @param {Object} params
 * @param {string|null} params.userId - User ID performing the action
 * @param {string} params.action - E.g. 'USER_LOGIN', 'CREATE_PARCEL', 'MARK_SHASAN_JAMA'
 * @param {string} params.entityType - E.g. 'User', 'LandParcel', 'ForwardEnforcementCase'
 * @param {string|null} params.entityId - Primary key of affected entity
 * @param {Object|null} params.previousData - Previous state snapshot
 * @param {Object|null} params.newData - New state snapshot
 * @param {Object} [params.req] - Express request object (to extract IP & user-agent)
 */
export async function logAudit({
  userId = null,
  action,
  entityType,
  entityId = null,
  previousData = null,
  newData = null,
  req = null,
}) {
  try {
    const ipAddress =
      req?.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req?.socket?.remoteAddress ||
      'unknown';
    const userAgent = req?.headers['user-agent'] || 'unknown';

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        previousData: previousData ? JSON.parse(JSON.stringify(previousData)) : undefined,
        newData: newData ? JSON.parse(JSON.stringify(newData)) : undefined,
        ipAddress: ipAddress.slice(0, 64),
        userAgent: userAgent.slice(0, 512),
      },
    });
  } catch (error) {
    console.error('⚠️ Failed to write audit log entry:', error.message);
  }
}
