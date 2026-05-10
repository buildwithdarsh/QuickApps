import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey: string;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('email.resendApiKey', '');
    this.fromEmail = this.config.get<string>('email.fromEmail', 'noreply@quickapps.in');
    this.fromName = this.config.get<string>('email.fromName', 'QuickApps');
  }

  async send(options: SendEmailOptions): Promise<boolean> {
    if (!this.apiKey) {
      this.logger.warn(`Email skipped (no API key): ${options.subject} → ${options.to}`);
      return false;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${this.fromName} <${this.fromEmail}>`,
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Email send failed: ${error}`);
        return false;
      }

      this.logger.log(`Email sent: ${options.subject} → ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Email send error: ${(error as Error).message}`);
      return false;
    }
  }

  async sendVerificationEmail(to: string, code: string): Promise<boolean> {
    return this.send({
      to,
      subject: 'Verify your QuickApps account',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Verify your email</h2>
          <p>Your verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 16px; background: #f5f5f5; text-align: center; border-radius: 8px; margin: 16px 0;">
            ${code}
          </div>
          <p>This code expires in 15 minutes.</p>
          <p style="color: #888; font-size: 12px;">If you didn't create an account on QuickApps, ignore this email.</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
    return this.send({
      to,
      subject: 'Reset your QuickApps password',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Reset your password</h2>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #F97316; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Reset Password
          </a>
          <p>This link expires in 1 hour.</p>
          <p style="color: #888; font-size: 12px;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });
  }

  async sendBuildCompleteEmail(to: string, appName: string, status: 'completed' | 'failed'): Promise<boolean> {
    const isSuccess = status === 'completed';
    return this.send({
      to,
      subject: `Build ${isSuccess ? 'complete' : 'failed'}: ${appName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>${isSuccess ? '✅' : '❌'} Build ${isSuccess ? 'Complete' : 'Failed'}</h2>
          <p>Your app <strong>${appName}</strong> build has ${isSuccess ? 'completed successfully' : 'failed'}.</p>
          <a href="https://app.quickapps.in/builds" style="display: inline-block; padding: 12px 24px; background: #F97316; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            ${isSuccess ? 'Download Your App' : 'View Error Details'}
          </a>
        </div>
      `,
    });
  }
}
