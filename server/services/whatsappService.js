const GRAPH_BASE_URL = 'https://graph.facebook.com';

function whatsappEnabled() {
  return process.env.WHATSAPP_ENABLED === 'true'
    && Boolean(process.env.WHATSAPP_ACCESS_TOKEN)
    && Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID)
    && Boolean(process.env.WHATSAPP_OWNER_PHONE);
}

function money(value = 0) {
  return `${Number(value || 0).toLocaleString()} EGP`;
}

function cleanPhone(phone = '') {
  return String(phone || '').replace(/\D/g, '');
}

function orderNumber(order) {
  return `#${String(order?._id || '').slice(-6).toUpperCase()}`;
}

function formatStatus(value = '') {
  return String(value || '-')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || '-';
}

function paymentMethodLabel(order) {
  return order?.paymentMethod === 'instapay' ? 'Instapay' : 'Cash on delivery';
}

function orderItemsText(order) {
  return (order.items || [])
    .map((item) => {
      const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
      return `• ${item.name || 'Product'} x${item.quantity || 0} — ${money(lineTotal)}`;
    })
    .join('\n');
}

async function sendWhatsAppText(to, body) {
  if (!whatsappEnabled()) {
    console.log('WHATSAPP SKIPPED:', {
      reason: 'Missing WhatsApp env variables or disabled',
      enabled: process.env.WHATSAPP_ENABLED,
      hasToken: Boolean(process.env.WHATSAPP_ACCESS_TOKEN),
      hasPhoneNumberId: Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID),
      hasOwnerPhone: Boolean(process.env.WHATSAPP_OWNER_PHONE),
    });
    return null;
  }

  const cleanTo = cleanPhone(to);

  if (!cleanTo) {
    console.log('WHATSAPP SKIPPED:', {
      reason: 'Missing recipient phone',
    });
    return null;
  }

  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v22.0';
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const url = `${GRAPH_BASE_URL}/${apiVersion}/${phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanTo,
        type: 'text',
        text: {
          preview_url: false,
          body,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('WHATSAPP FAILED:', {
        to: cleanTo,
        status: response.status,
        error: data?.error || data,
      });

      throw new Error(data?.error?.message || 'WhatsApp message failed');
    }

    console.log('WHATSAPP SENT:', {
      to: cleanTo,
      messageId: data?.messages?.[0]?.id,
    });

    return data;
  } catch (error) {
    console.error('WHATSAPP ERROR:', {
      to: cleanTo,
      message: error.message,
    });

    throw error;
  }
}

async function sendOwnerOrderWhatsApp(order) {
  const customer = order.customer || {};
  const paymentDetails = order.paymentDetails || {};

  const body = [
    '🧾 New ByJojo order',
    '',
    `Order: ${orderNumber(order)}`,
    `Customer: ${customer.fullName || '-'}`,
    `Phone: ${customer.phone || '-'}`,
    `Email: ${customer.email || '-'}`,
    `City: ${customer.city || '-'}`,
    `Address: ${customer.address || '-'}`,
    '',
    'Items:',
    orderItemsText(order) || '-',
    '',
    `Subtotal: ${money(order.subtotal)}`,
    `Discount: ${Number(order.discountAmount || 0) > 0 ? `-${money(order.discountAmount)}${order.discountCode ? ` (${order.discountCode})` : ''}` : '0 EGP'}`,
    `Delivery: ${money(order.deliveryFee)}`,
    `Total: ${money(order.total)}`,
    '',
    `Payment: ${paymentMethodLabel(order)}`,
    `Payment status: ${formatStatus(order.paymentStatus)}`,
    order.paymentMethod === 'instapay' && paymentDetails.timing ? `Instapay timing: ${formatStatus(paymentDetails.timing)}` : '',
    order.paymentMethod === 'instapay' && paymentDetails.reference ? `Reference: ${paymentDetails.reference}` : '',
    order.paymentMethod === 'instapay' && paymentDetails.proofSentVia ? `Proof via: ${paymentDetails.proofSentVia}` : '',
    customer.notes ? `Notes: ${customer.notes}` : '',
  ].filter(Boolean).join('\n');

  return sendWhatsAppText(process.env.WHATSAPP_OWNER_PHONE, body);
}

async function sendOwnerOrderStatusWhatsApp(order, previousStatus) {
  const customer = order.customer || {};

  const body = [
    '📦 ByJojo order status updated',
    '',
    `Order: ${orderNumber(order)}`,
    `Customer: ${customer.fullName || '-'}`,
    `Phone: ${customer.phone || '-'}`,
    '',
    `Previous status: ${formatStatus(previousStatus)}`,
    `New status: ${formatStatus(order.status)}`,
    `Total: ${money(order.total)}`,
  ].join('\n');

  return sendWhatsAppText(process.env.WHATSAPP_OWNER_PHONE, body);
}

async function sendOwnerPaymentStatusWhatsApp(order, previousPaymentStatus) {
  const customer = order.customer || {};

  const body = [
    '💳 ByJojo payment status updated',
    '',
    `Order: ${orderNumber(order)}`,
    `Customer: ${customer.fullName || '-'}`,
    `Phone: ${customer.phone || '-'}`,
    '',
    `Previous payment: ${formatStatus(previousPaymentStatus)}`,
    `New payment: ${formatStatus(order.paymentStatus)}`,
    `Payment method: ${paymentMethodLabel(order)}`,
    `Total: ${money(order.total)}`,
  ].join('\n');

  return sendWhatsAppText(process.env.WHATSAPP_OWNER_PHONE, body);
}

module.exports = {
  sendOwnerOrderWhatsApp,
  sendOwnerOrderStatusWhatsApp,
  sendOwnerPaymentStatusWhatsApp,
};
