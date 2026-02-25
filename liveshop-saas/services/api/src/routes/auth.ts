import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerSchema, loginSchema, verifyPassword, hashPassword, generateToken } from '@liveshop/shared';
import { z } from 'zod';
import { sendPasswordResetEmail } from '../services/email';

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export async function authRoutes(app: FastifyInstance) {
  // Register
  app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = registerSchema.parse(request.body);

      // Check if email already exists
      const existingUser = await app.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return reply.status(409).send({
          success: false,
          error: { code: 'EMAIL_EXISTS', message: 'Email already registered' },
        });
      }

      // Get or create default tenant
      let tenant = await app.prisma.tenant.findFirst({
        where: { slug: 'default' },
      });

      if (!tenant) {
        tenant = await app.prisma.tenant.create({
          data: {
            name: 'Default Tenant',
            slug: 'default',
            plan: 'free',
          },
        });
      }

      // Create user
      const user = await app.prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: data.email,
          password: hashPassword(data.password),
          phone: data.phone,
          role: data.role,
          profile: {
            firstName: data.firstName,
            lastName: data.lastName,
          },
        },
        select: {
          id: true,
          email: true,
          role: true,
          tenantId: true,
          profile: true,
          createdAt: true,
        },
      });

      // Generate tokens
      const accessToken = app.jwt.sign(
        { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
        { expiresIn: '15m' }
      );

      const refreshToken = generateToken();
      await app.prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      reply.status(201).send({
        success: true,
        data: {
          user,
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: 900, // 15 minutes
          },
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
        });
      }
      throw error;
    }
  });

  // Login
  app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = loginSchema.parse(request.body);

      // Find user
      const user = await app.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        return reply.status(401).send({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
        });
      }

      // Verify password
      const isValidPassword = verifyPassword(data.password, user.password);
      if (!isValidPassword) {
        return reply.status(401).send({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
        });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return reply.status(401).send({
          success: false,
          error: { code: 'ACCOUNT_DISABLED', message: 'Account is not active' },
        });
      }

      // Update last login
      await app.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate tokens
      const accessToken = app.jwt.sign(
        { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
        { expiresIn: '15m' }
      );

      const refreshToken = generateToken();
      await app.prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      reply.send({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            profile: user.profile,
          },
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: 900,
          },
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
        });
      }
      throw error;
    }
  });

  // Refresh token
  app.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { refreshToken } = refreshTokenSchema.parse(request.body);

      // Find refresh token
      const tokenRecord = await app.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
        return reply.status(401).send({
          success: false,
          error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' },
        });
      }

      const user = tokenRecord.user;

      // Generate new access token
      const accessToken = app.jwt.sign(
        { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
        { expiresIn: '15m' }
      );

      reply.send({
        success: true,
        data: {
          accessToken,
          expiresIn: 900,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
        });
      }
      throw error;
    }
  });

  // Logout
  app.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { refreshToken } = refreshTokenSchema.parse(request.body);

      // Revoke refresh token
      await app.prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revokedAt: new Date() },
      });

      reply.send({
        success: true,
        data: { message: 'Logged out successfully' },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
        });
      }
      throw error;
    }
  });

  // Get current user
  app.get('/me', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await app.prisma.user.findUnique({
      where: { id: request.user.id },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        profile: true,
        kycStatus: true,
        walletBalance: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return reply.status(404).send({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    reply.send({
      success: true,
      data: { user },
    });
  });

  // Forgot password
  app.post('/forgot-password', async (request: FastifyRequest, reply: FastifyReply) => {
    const schema = z.object({ email: z.string().email() });

    try {
      const { email } = schema.parse(request.body);

      const user = await app.prisma.user.findUnique({
        where: { email },
      });

      // Always return success to prevent email enumeration
      if (!user) {
        return reply.send({
          success: true,
          data: { message: 'If an account exists, a reset email has been sent' },
        });
      }

      // Generate reset token — expires in 1 hour
      const resetToken = generateToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await app.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpiresAt: expiresAt,
        } as any,
      });

      // Send reset email (non-blocking — failure won't affect response)
      const firstName = (user.profile as any)?.firstName || '';
      try {
        await sendPasswordResetEmail(email, firstName, resetToken);
      } catch (emailErr) {
        app.log.warn({ err: emailErr }, 'Failed to send password reset email');
      }

      reply.send({
        success: true,
        data: { message: 'If an account exists, a reset email has been sent' },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid email', details: error.errors },
        });
      }
      throw error;
    }
  });

  // Reset password (consume token)
  app.post('/reset-password', async (request: FastifyRequest, reply: FastifyReply) => {
    const schema = z.object({
      token: z.string().min(1),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    });

    try {
      const { token, password } = schema.parse(request.body);

      const user = await app.prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpiresAt: { gt: new Date() },
        } as any,
      });

      if (!user) {
        return reply.status(400).send({
          success: false,
          error: { code: 'INVALID_RESET_TOKEN', message: 'Reset link is invalid or has expired' },
        });
      }

      // Set the new password and clear the reset token
      await app.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashPassword(password),
          passwordResetToken: null,
          passwordResetExpiresAt: null,
        } as any,
      });

      // Revoke all existing refresh tokens for this user
      await app.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      reply.send({
        success: true,
        data: { message: 'Password reset successfully. Please log in with your new password.' },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
        });
      }
      throw error;
    }
  });
}
