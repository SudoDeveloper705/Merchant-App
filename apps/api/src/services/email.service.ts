/**
 * Email Service
 * 
 * Stub implementation for sending emails.
 * In production, integrate with an email provider (SendGrid, AWS SES, etc.)
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email
 * 
 * This is a stub implementation. In production, replace with actual email provider.
 * 
 * @param options - Email options
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  // Stub implementation - just log the email
  console.log('📧 Email would be sent:', {
    to: options.to,
    subject: options.subject,
    html: options.html.substring(0, 100) + '...',
  });

  // In production, integrate with email provider:
  // - SendGrid: https://github.com/sendgrid/sendgrid-nodejs
  // - AWS SES: https://github.com/aws/aws-sdk-js-v3
  // - Nodemailer: https://nodemailer.com/
  
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: options.to,
  //   from: process.env.FROM_EMAIL,
  //   subject: options.subject,
  //   html: options.html,
  //   text: options.text,
  // });
}

/**
 * Send invitation email to partner staff
 * 
 * @param email - Staff member's email
 * @param name - Staff member's name
 * @param token - Password reset token
 * @param inviterName - Name of the person who invited them
 */
export async function sendInvitationEmail(
  email: string,
  name: string,
  token: string,
  inviterName: string
): Promise<void> {
  const resetUrl = `${process.env.WEB_ORIGIN || 'http://localhost:3000'}/partner/set-password?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Partner Staff Invitation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">You've been invited to join as Partner Staff</h2>
          <p>Hi ${name},</p>
          <p>${inviterName} has invited you to join as a Partner Staff member.</p>
          <p>Click the button below to set your password and activate your account:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
              Set Password
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This link will expire in 7 days. If you didn't request this invitation, please ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
Hi ${name},

${inviterName} has invited you to join as a Partner Staff member.

Set your password by visiting: ${resetUrl}

This link will expire in 7 days. If you didn't request this invitation, please ignore this email.
  `;

  await sendEmail({
    to: email,
    subject: 'Partner Staff Invitation',
    html,
    text,
  });
}

