import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../../services/email/email.service';
import { JwtPayload } from '../../common/decorators';
import { RegisterDto, LoginDto, VerifyEmailDto, RefreshTokenDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private email: EmailService,
  ) {}

  // ── Register ─────────────────────────────────────────

  async register(dto: RegisterDto) {
    // Check if email already exists
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create org slug from orgName
    const slug = this.generateSlug(dto.orgName);

    // Transaction: create org + user + wallet + verification
    const result = await this.prisma.$transaction(async (tx) => {
      // Create organisation
      const org = await tx.organisation.create({
        data: {
          name: dto.orgName,
          slug,
          billingEmail: dto.email,
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          orgId: org.id,
          email: dto.email,
          passwordHash,
          name: dto.name,
          role: 'owner',
          authProvider: 'email',
        },
      });

      // Create MintWallet
      await tx.mintWallet.create({
        data: { orgId: org.id },
      });

      // Create email verification
      const code = this.generateVerificationCode();
      await tx.emailVerification.create({
        data: {
          email: dto.email,
          code,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
      });

      return { user, org, code };
    });

    // Send verification email (non-blocking)
    this.email.sendVerificationEmail(dto.email, result.code).catch((err) => {
      this.logger.error(`Failed to send verification email: ${err.message}`);
    });

    // Generate tokens
    const tokens = await this.generateTokens(result.user.id, result.user.email, result.org.id, result.user.role);

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        emailVerified: false,
      },
      organisation: {
        id: result.org.id,
        name: result.org.name,
        slug: result.org.slug,
        plan: result.org.plan,
      },
      ...tokens,
    };
  }

  // ── Login ────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
      include: { organisation: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.orgId, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        avatarUrl: user.avatarUrl,
      },
      organisation: {
        id: user.organisation.id,
        name: user.organisation.name,
        slug: user.organisation.slug,
        plan: user.organisation.plan,
      },
      ...tokens,
    };
  }

  // ── Verify Email ─────────────────────────────────────

  async verifyEmail(dto: VerifyEmailDto) {
    const verification = await this.prisma.emailVerification.findFirst({
      where: {
        email: dto.email,
        code: dto.code,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    await this.prisma.$transaction([
      this.prisma.emailVerification.update({
        where: { id: verification.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.updateMany({
        where: { email: dto.email, deletedAt: null },
        data: { emailVerified: true },
      }),
    ]);

    return { verified: true };
  }

  // ── Resend Verification ──────────────────────────────

  async resendVerification(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (!user) {
      // Don't reveal whether email exists
      return { sent: true };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const code = this.generateVerificationCode();
    await this.prisma.emailVerification.create({
      data: {
        email,
        code,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    await this.email.sendVerificationEmail(email, code);
    return { sent: true };
  }

  // ── Refresh Token ────────────────────────────────────

  async refreshTokens(dto: RefreshTokenDto) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: { user: { include: { organisation: true } } },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Delete used refresh token (rotation)
    await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const { user } = storedToken;
    const tokens = await this.generateTokens(user.id, user.email, user.orgId, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      ...tokens,
    };
  }

  // ── Logout ───────────────────────────────────────────

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
    return { loggedOut: true };
  }

  // ── Forgot Password ─────────────────────────────────

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { sent: true };
    }

    const token = uuid();
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    const frontendUrl = this.config.get<string>('frontendUrl');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    await this.email.sendPasswordResetEmail(email, resetUrl);

    return { sent: true };
  }

  // ── Reset Password ───────────────────────────────────

  async resetPassword(token: string, newPassword: string) {
    const resetRecord = await this.prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      // Invalidate all refresh tokens for this user
      this.prisma.refreshToken.deleteMany({
        where: { userId: resetRecord.userId },
      }),
    ]);

    return { reset: true };
  }

  // ── Google OAuth Callback ────────────────────────────

  async googleLogin(googleUser: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  }) {
    // Check if user exists by Google ID
    let user = await this.prisma.user.findFirst({
      where: { googleId: googleUser.googleId, deletedAt: null },
      include: { organisation: true },
    });

    if (!user) {
      // Check if email exists (link accounts)
      const existingUser = await this.prisma.user.findFirst({
        where: { email: googleUser.email, deletedAt: null },
        include: { organisation: true },
      });

      if (existingUser) {
        // Link Google ID to existing user
        user = await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            googleId: googleUser.googleId,
            avatarUrl: googleUser.avatarUrl || existingUser.avatarUrl,
            emailVerified: true,
          },
          include: { organisation: true },
        });
      } else {
        // Create new org + user
        const slug = this.generateSlug(googleUser.name || 'org');
        const org = await this.prisma.organisation.create({
          data: {
            name: googleUser.name || 'My Organisation',
            slug,
            billingEmail: googleUser.email,
          },
        });

        await this.prisma.mintWallet.create({ data: { orgId: org.id } });

        user = await this.prisma.user.create({
          data: {
            orgId: org.id,
            email: googleUser.email,
            name: googleUser.name,
            role: 'owner',
            authProvider: 'google',
            googleId: googleUser.googleId,
            avatarUrl: googleUser.avatarUrl,
            emailVerified: true,
          },
          include: { organisation: true },
        });
      }
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.orgId, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        avatarUrl: user.avatarUrl,
      },
      organisation: {
        id: user.organisation.id,
        name: user.organisation.name,
        slug: user.organisation.slug,
        plan: user.organisation.plan,
      },
      ...tokens,
    };
  }

  // ── Helpers ──────────────────────────────────────────

  private async generateTokens(userId: string, email: string, orgId: string, role: string) {
    const payload: JwtPayload = { sub: userId, email, orgId, role };

    const accessToken = this.jwt.sign(payload as any, {
      expiresIn: this.config.get<string>('jwt.accessExpiry', '15m') as any,
    });

    const refreshToken = uuid();
    const refreshExpiry = this.config.get<string>('jwt.refreshExpiry', '7d');
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + parseInt(refreshExpiry) || 7);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: refreshExpiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);

    const suffix = Math.random().toString(36).slice(2, 8);
    return `${base}-${suffix}`;
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
