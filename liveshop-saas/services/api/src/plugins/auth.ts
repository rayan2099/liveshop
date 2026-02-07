import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export const authPlugin = fp(async (app: FastifyInstance) => {
  // JWT authentication decorator
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const decoded = await request.jwtVerify<{ userId: string; email: string; role: string; tenantId: string }>();
      
      // Verify user still exists and is active
      const user = await app.prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true, tenantId: true, status: true },
      });

      if (!user) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'User not found' },
        });
      }

      if (user.status !== 'active') {
        return reply.status(401).send({
          success: false,
          error: { code: 'ACCOUNT_DISABLED', message: 'Account is not active' },
        });
      }

      request.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      };
    } catch (err) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
      });
    }
  });
});

// Role-based authorization helper
export function requireRole(...allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
      });
    }
  };
}

// Optional authentication (for public routes that can also work for logged-in users)
export async function optionalAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return;
    }

    const decoded = await request.jwtVerify<{ userId: string; email: string; role: string; tenantId: string }>();
    
    const user = await request.server.prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, tenantId: true, status: true },
    });

    if (user && user.status === 'active') {
      request.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      };
    }
  } catch {
    // Silently ignore auth errors for optional auth
  }
}
