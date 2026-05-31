const nodemailer = require('nodemailer');
const User = require('../models/User');

const BRAND = {
  name: 'ByJojo',
  tagline: 'Premium table linen',
  ivory: '#FAF7EF',
  beige: '#E8DDCB',
  sand: '#D8C8AE',
  sage: '#8A9A73',
  olive: '#4F5B3A',
  charcoal: '#2F3028',
  gold: '#B99A5B',
  white: '#FFFFFF',
};

function createTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.EMAIL_ALLOW_SELF_SIGNED !== 'true',
    },
  });
}

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const money = (value = 0) => `${Number(value || 0).toLocaleString()} EGP`;

const orderStatusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  'out-for-delivery': 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const paymentStatusLabels = {
  pending: 'Pending',
  'awaiting-confirmation': 'Awaiting confirmation',
  paid: 'Paid',
};

function readableStatus(status, labels = {}) {
  return labels[status] || String(status || '-')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || '-';
}

function formatDate(value) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function buttonHtml(text, url) {
  if (!text || !url) return '';

  return `
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:26px;">
      <tr>
        <td style="border-radius:999px;background:${BRAND.olive};">
          <a href="${escapeHtml(url)}" style="display:inline-block;padding:14px 22px;color:${BRAND.white};text-decoration:none;font-size:13px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase;border-radius:999px;">
            ${escapeHtml(text)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function emailShell({
  title,
  preview = 'ByJojo store update',
  body,
  buttonText,
  buttonUrl,
  footerNote,
}) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(title)}</title>
      </head>
      <body style="margin:0;padding:0;background:${BRAND.ivory};font-family:Arial,Helvetica,sans-serif;color:${BRAND.charcoal};">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
          ${escapeHtml(preview)}
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BRAND.ivory};padding:34px 14px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:680px;">
                <tr>
                  <td style="padding:0 0 16px 0;text-align:center;">
                    <div style="display:inline-block;border:1px solid ${BRAND.sand};background:${BRAND.white};border-radius:999px;padding:8px 16px;color:${BRAND.olive};font-size:11px;font-weight:800;letter-spacing:2.4px;text-transform:uppercase;">
                      ${BRAND.tagline}
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="border:1px solid ${BRAND.sand};border-radius:32px;overflow:hidden;background:${BRAND.white};box-shadow:0 24px 80px rgba(79,91,58,0.12);">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="background:${BRAND.olive};padding:34px 32px;color:${BRAND.white};">
                          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td>
                                <div style="font-family:Georgia,'Times New Roman',serif;font-size:40px;line-height:1;color:${BRAND.white};">
                                  ${BRAND.name}
                                </div>
                                <div style="margin-top:10px;color:${BRAND.beige};font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;">
                                  Warm homes · beautiful tables
                                </div>
                              </td>
                              <td align="right" style="vertical-align:top;">
                                <div style="display:inline-block;border:1px solid rgba(255,255,255,0.28);border-radius:999px;padding:8px 12px;color:${BRAND.beige};font-size:11px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;">
                                  Store update
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:34px 32px 30px 32px;">
                          <div style="color:${BRAND.gold};font-size:12px;font-weight:800;letter-spacing:2.4px;text-transform:uppercase;margin-bottom:12px;">
                            ${escapeHtml(preview)}
                          </div>

                          <h1 style="margin:0 0 18px 0;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.13;color:${BRAND.charcoal};font-weight:400;">
                            ${escapeHtml(title)}
                          </h1>

                          <div style="font-size:15px;line-height:1.8;color:#4b4b42;">
                            ${body}
                          </div>

                          ${buttonHtml(buttonText, buttonUrl)}
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:0 32px 30px 32px;">
                          <div style="border-top:1px solid ${BRAND.beige};padding-top:18px;color:#777060;font-size:12px;line-height:1.7;">
                            ${footerNote || 'This email was sent automatically from the ByJojo store system.'}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:18px 8px 0 8px;text-align:center;color:#8c806c;font-size:12px;line-height:1.7;">
                    © ${new Date().getFullYear()} ${BRAND.name}. Made for warm homes and beautiful tables.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function pill(text, color = BRAND.olive, background = '#F4EEE2') {
  return `
    <span style="display:inline-block;border-radius:999px;background:${background};color:${color};padding:7px 11px;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">
      ${escapeHtml(text)}
    </span>
  `;
}

function section(title, body, options = {}) {
  const { muted = false } = options;

  return `
    <div style="margin-top:20px;border:1px solid ${BRAND.beige};background:${muted ? BRAND.ivory : '#FFFFFF'};border-radius:22px;padding:20px;">
      <h2 style="margin:0 0 14px 0;font-family:Georgia,'Times New Roman',serif;color:${BRAND.charcoal};font-size:22px;line-height:1.2;font-weight:400;">
        ${escapeHtml(title)}
      </h2>
      ${body}
    </div>
  `;
}

function infoRows(rows) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
      ${rows.map(([label, value]) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid ${BRAND.beige};color:#777060;font-size:13px;width:42%;vertical-align:top;">
            ${escapeHtml(label)}
          </td>
          <td style="padding:12px 0;border-bottom:1px solid ${BRAND.beige};color:${BRAND.charcoal};font-size:14px;font-weight:700;text-align:right;vertical-align:top;">
            ${escapeHtml(value || '-')}
          </td>
        </tr>
      `).join('')}
    </table>
  `;
}

function orderItemsHtml(items = []) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
      ${items.map((item) => {
        const hasOffer = item.offerPrice && item.originalPrice && Number(item.offerPrice) < Number(item.originalPrice);
        const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
        const originalLineTotal = Number(item.originalPrice || 0) * Number(item.quantity || 0);

        return `
          <tr>
            <td style="padding:14px 0;border-bottom:1px solid ${BRAND.beige};vertical-align:top;">
              <div style="font-weight:800;color:${BRAND.charcoal};font-size:15px;">
                ${escapeHtml(item.name)}
              </div>
              <div style="margin-top:5px;color:#777060;font-size:13px;">
                Quantity: ${escapeHtml(item.quantity)}
              </div>
              ${hasOffer ? `
                <div style="margin-top:8px;">
                  ${pill(item.activeOffer?.title || 'Special offer', BRAND.gold, 'rgba(185,154,91,0.12)')}
                </div>
              ` : ''}
            </td>
            <td style="padding:14px 0;border-bottom:1px solid ${BRAND.beige};text-align:right;vertical-align:top;">
              <div style="font-weight:900;color:${BRAND.olive};font-size:15px;">
                ${money(lineTotal)}
              </div>
              ${hasOffer ? `
                <div style="margin-top:5px;color:#9b9282;font-size:12px;text-decoration:line-through;">
                  ${money(originalLineTotal)}
                </div>
              ` : ''}
            </td>
          </tr>
        `;
      }).join('')}
    </table>
  `;
}

function totalsHtml(order) {
  const discountAmount = Number(order.discountAmount || 0);

  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
      <tr>
        <td style="padding:10px 0;color:#777060;font-size:14px;">Subtotal</td>
        <td style="padding:10px 0;text-align:right;color:${BRAND.charcoal};font-size:14px;font-weight:800;">${money(order.subtotal)}</td>
      </tr>

      ${discountAmount > 0 ? `
        <tr>
          <td style="padding:10px 0;color:${BRAND.olive};font-size:14px;">Discount${order.discountCode ? ` (${escapeHtml(order.discountCode)})` : ''}</td>
          <td style="padding:10px 0;text-align:right;color:${BRAND.olive};font-size:14px;font-weight:900;">-${money(discountAmount)}</td>
        </tr>
      ` : ''}

      <tr>
        <td style="padding:10px 0;color:#777060;font-size:14px;">Delivery</td>
        <td style="padding:10px 0;text-align:right;color:${BRAND.charcoal};font-size:14px;font-weight:800;">${money(order.deliveryFee)}</td>
      </tr>

      <tr>
        <td style="padding:16px 0 0 0;border-top:1px solid ${BRAND.sand};color:${BRAND.charcoal};font-size:18px;font-weight:900;">Total</td>
        <td style="padding:16px 0 0 0;border-top:1px solid ${BRAND.sand};text-align:right;color:${BRAND.olive};font-size:20px;font-weight:900;">${money(order.total)}</td>
      </tr>
    </table>
  `;
}

function paymentDetailsHtml(order) {
  const paymentDetails = order.paymentDetails || {};
  const paymentLabel = order.paymentMethod === 'instapay' ? 'Instapay' : 'Cash on delivery';
  const paymentTiming = paymentDetails.timing === 'pay-now'
    ? 'Customer paid / will send proof now'
    : paymentDetails.timing === 'pay-later'
      ? 'Customer will pay on delivery'
      : '-';

  return infoRows([
    ['Payment method', paymentLabel],
    ['Payment status', readableStatus(order.paymentStatus, paymentStatusLabels)],
    ['Instapay timing', order.paymentMethod === 'instapay' ? paymentTiming : '-'],
    ['Payment reference', order.paymentMethod === 'instapay' ? paymentDetails.reference : '-'],
    ['Proof sent via', order.paymentMethod === 'instapay' ? paymentDetails.proofSentVia : '-'],
    ['Payment note', order.paymentMethod === 'instapay' ? paymentDetails.note : '-'],
  ]);
}

function orderEmailBody(order, { admin = false } = {}) {
  const customerName = order.customer?.fullName || 'Customer';

  return `
    <p style="margin:0 0 16px 0;">
      ${
        admin
          ? `A new ByJojo order was placed by <strong>${escapeHtml(customerName)}</strong>. Review the payment details and prepare the next confirmation step.`
          : `Thank you, <strong>${escapeHtml(customerName)}</strong>. Your order was received, and the ByJojo team will contact you soon to confirm the details.`
      }
    </p>

    <div style="margin-top:18px;">
      ${pill(admin ? 'Admin notification' : 'Order received', BRAND.olive, 'rgba(138,154,115,0.14)')}
      ${order.paymentMethod === 'instapay' ? pill('Instapay', BRAND.gold, 'rgba(185,154,91,0.14)') : pill('Cash on delivery', BRAND.olive, 'rgba(138,154,115,0.14)')}
      ${order.discountAmount ? pill('Discount applied', BRAND.gold, 'rgba(185,154,91,0.14)') : ''}
    </div>

    ${section('Customer details', infoRows([
      ['Name', order.customer?.fullName],
      ['Phone', order.customer?.phone],
      ['Email', order.customer?.email],
      ['City / area', order.customer?.city],
      ['Address', order.customer?.address],
      ['Notes', order.customer?.notes],
    ]), { muted: true })}

    ${section('Order pieces', orderItemsHtml(order.items))}

    ${section('Payment details', paymentDetailsHtml(order), { muted: true })}

    ${section('Order total', totalsHtml(order))}

    <div style="margin-top:20px;border-left:4px solid ${BRAND.gold};background:${BRAND.ivory};padding:17px 18px;border-radius:16px;color:#5d5a4d;font-size:14px;line-height:1.8;">
      ${
        admin
          ? 'Next step: confirm payment if needed, then update the order status from the admin dashboard so the order stays easy to track.'
          : order.paymentMethod === 'instapay'
            ? 'For Instapay orders, please send your transfer proof through the channel you selected during checkout so the team can verify it quickly.'
            : 'For cash on delivery, the team will contact you to confirm delivery details before sending the order.'
      }
    </div>
  `;
}

async function sendEmail({ to, subject, html }) {
  const transporter = createTransporter();
  const cleanTo = String(to || '').trim();

  if (!transporter || !cleanTo) {
    console.log('EMAIL SKIPPED:', {
      subject,
      to: cleanTo || null,
      hasEmailUser: Boolean(process.env.EMAIL_USER),
      hasEmailPass: Boolean(process.env.EMAIL_PASS),
    });
    return null;
  }

  try {
    const info = await transporter.sendMail({
      from: `"ByJojo" <${process.env.EMAIL_USER}>`,
      replyTo: process.env.OWNER_EMAIL || process.env.EMAIL_USER,
      to: cleanTo,
      subject,
      html,
    });

    console.log('EMAIL SENT:', {
      subject,
      to: cleanTo,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });

    return info;
  } catch (error) {
    console.error('EMAIL FAILED:', {
      subject,
      to: cleanTo,
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });

    throw error;
  }
}

async function notifyAdmin(subject, html) {
  await sendEmail({
    to: process.env.OWNER_EMAIL,
    subject,
    html: emailShell({
      title: subject,
      preview: 'Admin notification',
      body: html,
      buttonText: 'Open dashboard',
      buttonUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/admin`,
    }),
  });
}

async function sendAdminSignupEmail(user) {
  await notifyAdmin(
    'New ByJojo customer signup',
    `
      <p style="margin:0 0 16px 0;">
        A new customer created an account on the ByJojo website. Their details are below.
      </p>

      ${section('Customer profile', infoRows([
        ['Name', user.fullName],
        ['Email', user.email],
        ['Phone', user.phone],
        ['Joined at', formatDate(user.createdAt || Date.now())],
      ]), { muted: true })}

      <div style="margin-top:20px;border-left:4px solid ${BRAND.gold};background:${BRAND.ivory};padding:17px 18px;border-radius:16px;color:#5d5a4d;font-size:14px;line-height:1.8;">
        Tip: You can later send this customer discount codes or offers from the admin dashboard.
      </div>
    `,
  );
}

async function sendAdminOrderEmail(order) {
  const adminUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/orders`;

  await sendEmail({
    to: process.env.OWNER_EMAIL,
    subject: `New ByJojo order | ${money(order.total)}`,
    html: emailShell({
      title: 'New order received',
      preview: 'Admin order notification',
      body: orderEmailBody(order, { admin: true }),
      buttonText: 'Open orders',
      buttonUrl: adminUrl,
      footerNote: 'This notification was sent to the ByJojo owner email because a new customer order was placed.',
    }),
  });
}

async function sendCustomerOrderEmail(order) {
  if (!order.customer?.email) return;

  const successUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/order-success/${order._id}`;

  await sendEmail({
    to: order.customer.email,
    subject: 'Your ByJojo order was received',
    html: emailShell({
      title: 'Your order is now in progress',
      preview: 'Order confirmation',
      body: orderEmailBody(order),
      buttonText: 'View order',
      buttonUrl: successUrl,
      footerNote: 'You received this email because an order was placed using this email address on ByJojo.',
    }),
  });
}

async function emailCustomers(subject, html) {
  const customers = await User.find({ role: 'user' }).select('email fullName');

  if (!customers.length) return;

  await Promise.all(customers.map((customer) => {
    const wrappedHtml = emailShell({
      title: subject,
      preview: 'ByJojo customer update',
      body: `
        <p style="margin:0 0 16px 0;">
          ${customer.fullName ? `Hello <strong>${escapeHtml(customer.fullName)}</strong>,` : 'Hello,'}
        </p>
        ${html}
      `,
      buttonText: 'Shop ByJojo',
      buttonUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/shop`,
      footerNote: 'You received this email because you have a registered account with ByJojo.',
    });

    return sendEmail({
      to: customer.email,
      subject,
      html: wrappedHtml,
    });
  }));
}

async function sendCustomerOrderStatusEmail(order, previousStatus) {
  if (!order.customer?.email) return;

  const statusCopy = {
    confirmed: {
      title: 'Your ByJojo order is confirmed',
      preview: 'Order confirmed',
      message: 'Good news — your order has been confirmed by the ByJojo team. The team will now prepare your pieces for the next step.',
      badge: 'Confirmed',
    },
    preparing: {
      title: 'Your ByJojo order is being prepared',
      preview: 'Order preparation started',
      message: 'Your ByJojo order is now being prepared. The team is getting your pieces ready with care.',
      badge: 'Preparing',
    },
    'out-for-delivery': {
      title: 'Your ByJojo order is out for delivery',
      preview: 'Out for delivery',
      message: 'Your ByJojo order is on its way. Please keep your phone available in case the delivery team needs to confirm details.',
      badge: 'Out for delivery',
    },
    delivered: {
      title: 'Your ByJojo order was delivered',
      preview: 'Order delivered',
      message: 'Your ByJojo order has been marked as delivered. We hope the pieces make your table feel beautifully complete.',
      badge: 'Delivered',
    },
    cancelled: {
      title: 'Your ByJojo order was cancelled',
      preview: 'Order cancelled',
      message: 'Your order has been cancelled. If this was unexpected, please contact ByJojo through WhatsApp or Instagram.',
      badge: 'Cancelled',
    },
  };

  const copy = statusCopy[order.status];
  if (!copy) return;

  const orderUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/order-success/${order._id}`;

  await sendEmail({
    to: order.customer.email,
    subject: copy.title,
    html: emailShell({
      title: copy.title,
      preview: copy.preview,
      body: `
        <p style="margin:0 0 16px 0;">
          Hello <strong>${escapeHtml(order.customer.fullName || 'there')}</strong>,
        </p>

        <p style="margin:0 0 18px 0;">
          ${copy.message}
        </p>

        <div style="margin-top:18px;">
          ${pill(copy.badge, BRAND.olive, 'rgba(138,154,115,0.14)')}
        </div>

        ${section('Status update', infoRows([
          ['Order number', `#${String(order._id).slice(-6).toUpperCase()}`],
          ['Previous status', readableStatus(previousStatus, orderStatusLabels)],
          ['New status', readableStatus(order.status, orderStatusLabels)],
          ['Payment status', readableStatus(order.paymentStatus, paymentStatusLabels)],
          ['Updated at', formatDate(Date.now())],
        ]), { muted: true })}

        ${section('Customer details', infoRows([
          ['Name', order.customer?.fullName],
          ['Phone', order.customer?.phone],
          ['Email', order.customer?.email],
          ['City / area', order.customer?.city],
          ['Address', order.customer?.address],
          ['Notes', order.customer?.notes],
        ]), { muted: true })}

        ${section('Order pieces', orderItemsHtml(order.items))}

        ${section('Payment details', paymentDetailsHtml(order), { muted: true })}

        ${section('Order total', totalsHtml(order))}

        <div style="margin-top:20px;border-left:4px solid ${BRAND.gold};background:${BRAND.ivory};padding:17px 18px;border-radius:16px;color:#5d5a4d;font-size:14px;line-height:1.8;">
          For questions about delivery, payment, or styling, contact ByJojo through WhatsApp or Instagram.
        </div>
      `,
      buttonText: 'View order',
      buttonUrl: orderUrl,
      footerNote: 'You received this email because your ByJojo order status was updated.',
    }),
  });
}

async function sendCustomerPaymentStatusEmail(order, previousPaymentStatus) {
  if (!order.customer?.email) return;

  const paymentCopy = {
    pending: {
      title: 'Your ByJojo payment status was updated',
      preview: 'Payment status update',
      message: 'Your order payment status was updated. The ByJojo team will contact you if any extra payment details are needed.',
      badge: 'Payment pending',
    },
    'awaiting-confirmation': {
      title: 'Your ByJojo payment proof is being reviewed',
      preview: 'Payment proof review',
      message: 'Your Instapay payment proof is now marked as awaiting confirmation. The ByJojo team will review it and confirm as soon as possible.',
      badge: 'Awaiting confirmation',
    },
    paid: {
      title: 'Your ByJojo payment is confirmed',
      preview: 'Payment confirmed',
      message: 'Your payment has been confirmed. Thank you. The ByJojo team will continue preparing your order.',
      badge: 'Payment confirmed',
    },
  };

  const copy = paymentCopy[order.paymentStatus] || paymentCopy.pending;
  const orderUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/order-success/${order._id}`;

  await sendEmail({
    to: order.customer.email,
    subject: copy.title,
    html: emailShell({
      title: copy.title,
      preview: copy.preview,
      body: `
        <p style="margin:0 0 16px 0;">
          Hello <strong>${escapeHtml(order.customer.fullName || 'there')}</strong>,
        </p>

        <p style="margin:0 0 18px 0;">
          ${copy.message}
        </p>

        <div style="margin-top:18px;">
          ${pill(copy.badge, BRAND.gold, 'rgba(185,154,91,0.14)')}
        </div>

        ${section('Payment update', infoRows([
          ['Order number', `#${String(order._id).slice(-6).toUpperCase()}`],
          ['Previous payment status', readableStatus(previousPaymentStatus, paymentStatusLabels)],
          ['New payment status', readableStatus(order.paymentStatus, paymentStatusLabels)],
          ['Order status', readableStatus(order.status, orderStatusLabels)],
          ['Updated at', formatDate(Date.now())],
        ]), { muted: true })}

        ${section('Customer details', infoRows([
          ['Name', order.customer?.fullName],
          ['Phone', order.customer?.phone],
          ['Email', order.customer?.email],
          ['City / area', order.customer?.city],
          ['Address', order.customer?.address],
          ['Notes', order.customer?.notes],
        ]), { muted: true })}

        ${section('Order pieces', orderItemsHtml(order.items))}

        ${section('Payment details', paymentDetailsHtml(order), { muted: true })}

        ${section('Order total', totalsHtml(order))}

        <div style="margin-top:20px;border-left:4px solid ${BRAND.gold};background:${BRAND.ivory};padding:17px 18px;border-radius:16px;color:#5d5a4d;font-size:14px;line-height:1.8;">
          For Instapay questions, payment proof, delivery, or styling help, contact ByJojo through WhatsApp or Instagram.
        </div>
      `,
      buttonText: 'View order',
      buttonUrl: orderUrl,
      footerNote: 'You received this email because your ByJojo payment status was updated.',
    }),
  });
}

module.exports = {
  sendEmail,
  notifyAdmin,
  emailCustomers,
  emailShell,
  sendAdminSignupEmail,
  sendAdminOrderEmail,
  sendCustomerOrderEmail,
  sendCustomerOrderStatusEmail,
  sendCustomerPaymentStatusEmail,
};
