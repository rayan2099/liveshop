/**
 * Email service — uses Resend when RESEND_API_KEY is set,
 * falls back to console logging in development.
 */

interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

async function sendEmail(payload: EmailPayload): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        // Dev fallback — log to console
        console.log('\n📧 [EMAIL — dev mode, not sent]');
        console.log(`  To:      ${payload.to}`);
        console.log(`  Subject: ${payload.subject}`);
        console.log(`  Body:    ${payload.html.replace(/<[^>]+>/g, ' ').slice(0, 200)}...\n`);
        return;
    }

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: process.env.FROM_EMAIL || 'noreply@liveshop.io',
            to: [payload.to],
            subject: payload.subject,
            html: payload.html,
        }),
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Resend API error: ${res.status} — ${error}`);
    }
}

// ─────────────────────────────────────────────
// Transactional email templates
// ─────────────────────────────────────────────

export async function sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetToken: string
): Promise<void> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    await sendEmail({
        to: email,
        subject: 'Reset your LiveShop password',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="color: #8b5cf6;">LiveShop</h2>
        <h3>Hi ${firstName || 'there'},</h3>
        <p>We received a request to reset your password. Click the button below to choose a new one:</p>
        <a href="${resetUrl}"
           style="display:inline-block; background:#8b5cf6; color:#fff; padding:12px 28px;
                  border-radius:8px; text-decoration:none; font-weight:bold; margin:16px 0;">
          Reset Password
        </a>
        <p style="color:#666; font-size:13px;">
          This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
        </p>
        <p style="color:#666; font-size:12px;">
          Or copy and paste this URL: <br/>
          <a href="${resetUrl}" style="color:#8b5cf6;">${resetUrl}</a>
        </p>
      </div>
    `,
    });
}

export async function sendOrderConfirmationEmail(
    email: string,
    firstName: string,
    order: {
        orderNumber: string;
        totalAmount: number;
        currency: string;
        items: Array<{ name: string; quantity: number; total: number }>;
    }
): Promise<void> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const orderUrl = `${appUrl}/orders`;

    const itemsHtml = order.items
        .map(
            (item) =>
                `<tr>
          <td style="padding:8px 0; border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:8px 0; border-bottom:1px solid #eee; text-align:center;">×${item.quantity}</td>
          <td style="padding:8px 0; border-bottom:1px solid #eee; text-align:right;">${order.currency} ${Number(item.total).toFixed(2)}</td>
        </tr>`
        )
        .join('');

    await sendEmail({
        to: email,
        subject: `Order confirmed — ${order.orderNumber}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="color: #8b5cf6;">LiveShop</h2>
        <h3>Hi ${firstName || 'there'}, your order is confirmed! 🎉</h3>
        <p>Order <strong>${order.orderNumber}</strong> has been placed successfully.</p>
        <table style="width:100%; border-collapse:collapse; margin:16px 0;">
          <thead>
            <tr style="background:#f9f9f9;">
              <th style="padding:8px 0; text-align:left;">Item</th>
              <th style="padding:8px 0; text-align:center;">Qty</th>
              <th style="padding:8px 0; text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding-top:12px; font-weight:bold;">Total</td>
              <td style="padding-top:12px; font-weight:bold; text-align:right;">
                ${order.currency} ${Number(order.totalAmount).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
        <a href="${orderUrl}"
           style="display:inline-block; background:#8b5cf6; color:#fff; padding:12px 28px;
                  border-radius:8px; text-decoration:none; font-weight:bold; margin-top:8px;">
          View Your Order
        </a>
      </div>
    `,
    });
}

export async function sendOrderStatusEmail(
    email: string,
    firstName: string,
    orderNumber: string,
    status: string
): Promise<void> {
    const statusMessages: Record<string, string> = {
        confirmed: 'Your order has been confirmed by the store.',
        preparing: 'The store is now preparing your order.',
        ready_for_pickup: 'Your order is ready and a driver is on the way.',
        delivered: 'Your order has been delivered. Enjoy!',
        cancelled: 'Your order has been cancelled.',
    };

    const message = statusMessages[status] || `Your order status has changed to: ${status}`;

    await sendEmail({
        to: email,
        subject: `Order ${orderNumber} — ${status.replace(/_/g, ' ')}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="color: #8b5cf6;">LiveShop</h2>
        <h3>Hi ${firstName || 'there'},</h3>
        <p>${message}</p>
        <p style="color:#666;">Order: <strong>${orderNumber}</strong></p>
      </div>
    `,
    });
}
