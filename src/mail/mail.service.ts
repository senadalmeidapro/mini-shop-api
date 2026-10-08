import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile } from 'node:fs/promises';
import 'reflect-metadata';
import 'dotenv/config';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; path?: string; content?: Buffer }>;
}

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_ACCOUNT_URL = 'https://api.brevo.com/v3/account';
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 2;

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  // --- Existing templates ---

  async sendResetPasswordEmail(to: string, resetUrl: string) {
    const appName = this.config.get<string>('APP_NAME') ?? 'mini-shop';
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
        <h2 style="color:#1f2937;margin:0 0 16px">Reset your ${appName} password</h2>
        <p style="color:#374151;line-height:1.6;margin:0 0 24px">
          You requested a password reset. Click the button below to choose a new password.
          This link is valid for <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
          Reset password
        </a>
        <p style="color:#6b7280;font-size:13px;margin:24px 0 0">
          If you did not request this, you can safely ignore this email.<br/>
          <a href="${frontendUrl}" style="color:#2563eb">${frontendUrl}</a>
        </p>
      </div>
    `;

    return this.sendMail({ to, subject: `${appName} - Password reset request`, html });
  }

  async sendWelcomeEmail(to: string, name?: string) {
    const appName = this.config.get<string>('APP_NAME') ?? 'mini-shop';

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
        <h2 style="color:#1f2937;margin:0 0 16px">Welcome to ${appName}${name ? `, ${name}` : ''}!</h2>
        <p style="color:#374151;line-height:1.6;margin:0 0 24px">
          Your account has been created successfully. You can now log in and start shopping.
        </p>
      </div>
    `;

    return this.sendMail({ to, subject: `Welcome to ${appName}`, html });
  }

  async sendVerificationEmail(to: string, name: string | undefined, verificationUrl: string) {
    const appName = this.config.get<string>('APP_NAME') ?? 'mini-shop';
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
        <h2 style="color:#1f2937;margin:0 0 16px">Verify your email</h2>
        <p style="color:#374151;line-height:1.6;margin:0 0 8px">Hi ${name ?? 'there'},</p>
        <p style="color:#374151;line-height:1.6;margin:0 0 24px">
          Welcome to ${appName}! Please confirm your email address to activate your account
          and be able to log in. This link is valid for <strong>1 hour</strong>.
        </p>
        <a href="${verificationUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
          Verify my email
        </a>
        <p style="color:#6b7280;font-size:13px;margin:24px 0 0">
          If you did not create this account, you can safely ignore this email.<br/>
          <a href="${frontendUrl}" style="color:#2563eb">${frontendUrl}</a>
        </p>
      </div>
    `;

    return this.sendMail({ to, subject: `${appName} - Please verify your email`, html });
  }

  // --- Order / supplier emails ---

  async sendNewOrderToSupplier(
    to: string,
    supplierName: string,
    data: {
      orderNumber: string;
      customerName: string;
      itemsHtml: string;
      total: string;
      createdAt: string;
    },
  ) {
    const appName = this.config.get<string>('APP_NAME') ?? 'mini-shop';
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
        <h2 style="color:#059669;margin:0 0 16px">New order received!</h2>
        <p style="color:#374151;line-height:1.6;margin:0 0 8px">Hi ${supplierName},</p>
        <p style="color:#374151;line-height:1.6;margin:0 0 24px">
          You have a new order <strong>#${data.orderNumber}</strong> from <strong>${data.customerName}</strong> on ${data.createdAt}.
        </p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <thead>
            <tr style="background:#f3f4f6">
              <th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb">Product</th>
              <th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb">Qty</th>
              <th style="text-align:right;padding:8px;border-bottom:1px solid #e5e7eb">Subtotal</th>
            </tr>
          </thead>
          <tbody>${data.itemsHtml}</tbody>
        </table>
        <p style="font-size:18px;font-weight:700;color:#1f2937;text-align:right;margin:0 0 24px">
          Total: ${data.total} FCFA
        </p>
        <a href="${frontendUrl}/dashboard/orders/${data.orderNumber}"
           style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
          View order
        </a>
      </div>
    `;

    return this.sendMail({
      to,
      subject: `${appName} - New order #${data.orderNumber}`,
      html,
    });
  }

  async sendOrderConfirmationToCustomer(
    to: string,
    data: {
      orderNumber: string;
      customerName: string;
      itemsHtml: string;
      total: string;
      shippingAddress?: Record<string, string>;
      estimatedDelivery?: string;
      attachmentPath?: string;
    },
  ) {
    const appName = this.config.get<string>('APP_NAME') ?? 'mini-shop';
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';

    const shippingHtml = data.shippingAddress
      ? `
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0 24px">
          <h3 style="color:#374151;font-size:14px;margin:0 0 8px">Delivery address</h3>
          <p style="color:#6b7280;margin:0;line-height:1.5;font-size:14px">
            ${data.shippingAddress.fullName ?? ''}<br/>
            ${data.shippingAddress.street ?? ''}<br/>
            ${data.shippingAddress.zip ?? ''} ${data.shippingAddress.city ?? ''}<br/>
            ${data.shippingAddress.country ?? ''}
          </p>
        </div>
      `
      : '';

    const deliveryHtml = data.estimatedDelivery
      ? `<p style="color:#6b7280;font-size:14px;margin:0 0 8px">
           Estimated delivery: <strong>${data.estimatedDelivery}</strong>
         </p>`
      : '';

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
        <h2 style="color:#2563eb;margin:0 0 16px">Order confirmed!</h2>
        <p style="color:#374151;line-height:1.6;margin:0 0 8px">Hi ${data.customerName},</p>
        <p style="color:#374151;line-height:1.6;margin:0 0 24px">
          Your order <strong>#${data.orderNumber}</strong> has been confirmed. You will find the invoice attached to this email.
        </p>
        ${shippingHtml}
        ${deliveryHtml}
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <thead>
            <tr style="background:#f3f4f6">
              <th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb">Product</th>
              <th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb">Qty</th>
              <th style="text-align:right;padding:8px;border-bottom:1px solid #e5e7eb">Subtotal</th>
            </tr>
          </thead>
          <tbody>${data.itemsHtml}</tbody>
        </table>
        <p style="font-size:18px;font-weight:700;color:#1f2937;text-align:right;margin:0 0 24px">
          Total: ${data.total} FCFA
        </p>
        <a href="${frontendUrl}/orders/${data.orderNumber}"
           style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
          View order
        </a>
        <p style="color:#9ca3af;font-size:12px;margin:24px 0 0">
          Your invoice is attached to this email. You can also download it from your account.
        </p>
      </div>
    `;

    const attachments = data.attachmentPath
      ? [{ filename: `invoice-${data.orderNumber}.pdf`, path: data.attachmentPath }]
      : [];

    return this.sendMail({
      to,
      subject: `${appName} - Order #${data.orderNumber} confirmed`,
      html,
      attachments,
    });
  }

  async sendOrderShippedToCustomer(
    to: string,
    data: {
      orderNumber: string;
      customerName: string;
      trackingNumber: string;
    },
  ) {
    const appName = this.config.get<string>('APP_NAME') ?? 'mini-shop';
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
        <h2 style="color:#059669;margin:0 0 16px">Your order has been shipped!</h2>
        <p style="color:#374151;line-height:1.6;margin:0 0 8px">Hi ${data.customerName},</p>
        <p style="color:#374151;line-height:1.6;margin:0 0 24px">
          Your order <strong>#${data.orderNumber}</strong> is on its way!
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px">
          <p style="margin:0;color:#166534;font-size:14px">
            Tracking number: <strong>${data.trackingNumber}</strong>
          </p>
        </div>
        <a href="${frontendUrl}/orders/${data.orderNumber}"
           style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
          Track your order
        </a>
      </div>
    `;

    return this.sendMail({
      to,
      subject: `${appName} - Order #${data.orderNumber} shipped`,
      html,
    });
  }

  async sendOrderCancelledToCustomer(
    to: string,
    data: { orderNumber: string; customerName: string },
  ) {
    const appName = this.config.get<string>('APP_NAME') ?? 'mini-shop';

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
        <h2 style="color:#dc2626;margin:0 0 16px">Order cancelled</h2>
        <p style="color:#374151;line-height:1.6;margin:0 0 8px">Hi ${data.customerName},</p>
        <p style="color:#374151;line-height:1.6;margin:0 0 24px">
          Your order <strong>#${data.orderNumber}</strong> has been cancelled. If you believe this is a mistake, please contact support.
        </p>
      </div>
    `;

    return this.sendMail({
      to,
      subject: `${appName} - Order #${data.orderNumber} cancelled`,
      html,
    });
  }

  async verifyConnection() {
    const apiKey = this.config.get<string>('BREVO_API_KEY');
    if (!apiKey) {
      this.logger.error('BREVO_API_KEY is not set — emails cannot be sent');
      return false;
    }
    try {
      const res = await fetch(BREVO_ACCOUNT_URL, {
        headers: { 'accept': 'application/json', 'api-key': apiKey },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!res.ok) {
        throw new Error(`Brevo API responded ${res.status}: ${await res.text()}`);
      }
      this.logger.log('Brevo API connection verified');
      return true;
    } catch (error) {
      this.logger.error(`Brevo API verification failed: ${(error as Error).message}`);
      return false;
    }
  }

  private async sendMail({ to, subject, html, attachments }: SendMailOptions) {
    try {
      await this.postEmail({ to, subject, html, attachments });
      this.logger.log(`Email sent to ${to} (${subject})`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${(error as Error).message}`);
      throw error;
    }
  }

  private async postEmail({ to, subject, html, attachments }: SendMailOptions) {
    const apiKey = this.config.get<string>('BREVO_API_KEY');
    if (!apiKey) {
      throw new Error('BREVO_API_KEY is not set');
    }
    const senderEmail = this.config.get<string>('SMTP_FROM');
    if (!senderEmail) {
      throw new Error('SMTP_FROM is not set');
    }

    const payload = {
      sender: {
        name: this.config.get<string>('SMTP_FROM_NAME') ?? 'mini-shop',
        email: senderEmail,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: html
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
      attachment: await this.encodeAttachments(attachments),
    };

    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const res = await fetch(BREVO_API_URL, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'api-key': apiKey,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (res.ok) return;
        lastError = new Error(`Brevo API responded ${res.status}: ${await res.text()}`);
        if (res.status < 500) break;
      } catch (error) {
        lastError = error as Error;
      }
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
    throw lastError ?? new Error('Brevo API request failed');
  }

  private async encodeAttachments(attachments?: SendMailOptions['attachments']) {
    if (!attachments?.length) return undefined;
    return Promise.all(
      attachments.map(async (attachment) => {
        const buffer =
          attachment.content ?? (attachment.path ? await readFile(attachment.path) : undefined);
        if (!buffer) {
          throw new Error(`Attachment "${attachment.filename}" has no content or path`);
        }
        return { name: attachment.filename, content: buffer.toString('base64') };
      }),
    );
  }
}
