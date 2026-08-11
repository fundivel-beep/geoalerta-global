import webpush from 'web-push';
import { query, queryOne } from '../db/pool.js';

// Configure VAPID
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@fundivel.org';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

interface AlertPayload {
  evento_id: string;
  magnitud: number;
  zona_riesgo: string;
  eta_ondas_s_seg: number;
  accion_recomendada: string;
}

/**
 * Multi-channel notification system.
 * Cascade: Web Push → SMS (10s) → WhatsApp/Telegram (15s more)
 */
export async function sendAlertToUser(userId: string, payload: AlertPayload): Promise<string> {
  // Try Web Push first
  const pushSent = await sendWebPush(userId, payload);
  if (pushSent) {
    await updateAlertDelivery(payload.evento_id, userId, 'push', 'enviada');
    return 'push';
  }

  // Fallback to SMS after 10s (via worker queue)
  // In production this would be queued with delay
  const smsSent = await sendSMS(userId, payload);
  if (smsSent) {
    await updateAlertDelivery(payload.evento_id, userId, 'sms', 'enviada');
    return 'sms';
  }

  // Fallback to WhatsApp/Telegram
  const msgSent = await sendMessaging(userId, payload);
  if (msgSent) {
    await updateAlertDelivery(payload.evento_id, userId, 'whatsapp', 'enviada');
    return 'whatsapp';
  }

  // All channels failed
  await updateAlertDelivery(payload.evento_id, userId, 'push', 'fallida');
  return 'failed';
}

async function sendWebPush(userId: string, payload: AlertPayload): Promise<boolean> {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return false;

  // TODO: Get push subscription from user profile
  // For now, return false to trigger fallback
  try {
    const title = `⚠️ ALERTA SÍSMICA M${payload.magnitud.toFixed(1)}`;
    const body = `Zona ${payload.zona_riesgo.toUpperCase()}. Ondas S en ~${payload.eta_ondas_s_seg}s. ${payload.accion_recomendada}`;

    // Would send via webpush.sendNotification(subscription, JSON.stringify({...}))
    console.log(`📲 Push notification for ${userId}: ${title}`);
    return false; // No subscriptions stored yet
  } catch {
    return false;
  }
}

async function sendSMS(userId: string, payload: AlertPayload): Promise<boolean> {
  const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

  if (!TWILIO_SID || !TWILIO_TOKEN) return false;

  // TODO: Get user phone number from profile
  try {
    const message = `⚠️ ALERTA SÍSMICA M${payload.magnitud.toFixed(1)} - Zona ${payload.zona_riesgo}. Ondas S en ${payload.eta_ondas_s_seg}s. PROTÉGETE AHORA.`;
    console.log(`📱 SMS for ${userId}: ${message}`);
    // Would send via Twilio client
    return false; // No phone numbers stored yet
  } catch {
    return false;
  }
}

async function sendMessaging(userId: string, payload: AlertPayload): Promise<boolean> {
  // TODO: WhatsApp Business API or Telegram Bot
  console.log(`💬 Messaging fallback for ${userId}`);
  return false;
}

async function updateAlertDelivery(
  eventoId: string,
  userId: string,
  canal: string,
  estado: string,
) {
  await query(
    `UPDATE alertas SET canal_entrega = $1, estado_entrega = $2, timestamp_envio = NOW()
     WHERE evento_id = $3 AND usuario_id = $4`,
    [canal, estado, eventoId, userId],
  );
}
