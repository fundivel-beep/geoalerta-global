import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

// SMS Worker
const smsWorker = new Worker(
  'sms-notifications',
  async (job) => {
    const { phoneNumber, message } = job.data;
    console.log(`📱 Sending SMS to ${phoneNumber}: ${message}`);
    // TODO: Twilio integration
  },
  { connection },
);

// Email Worker
const emailWorker = new Worker(
  'email-notifications',
  async (job) => {
    const { to, subject, html } = job.data;
    console.log(`📧 Sending email to ${to}: ${subject}`);
    // TODO: Resend/SendGrid integration
  },
  { connection },
);

// Report Generation Worker
const reportWorker = new Worker(
  'report-generation',
  async (job) => {
    const { eventoId, formato, filtros } = job.data;
    console.log(`📊 Generating ${formato} report for event ${eventoId}`);
    // TODO: Generate PDF/CSV report
  },
  { connection },
);

// Cleanup Worker (runs periodically)
const cleanupWorker = new Worker(
  'data-cleanup',
  async (job) => {
    console.log('🧹 Running data cleanup...');
    // TODO: Delete ubicaciones older than 90 days
    // TODO: Clean stale sessions
  },
  { connection },
);

console.log('🏭 Workers started: sms, email, report, cleanup');

// Graceful shutdown
process.on('SIGTERM', async () => {
  await smsWorker.close();
  await emailWorker.close();
  await reportWorker.close();
  await cleanupWorker.close();
  await connection.quit();
  process.exit(0);
});
