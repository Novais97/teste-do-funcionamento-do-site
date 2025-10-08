require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024, files: 12 } });

app.use(cors());
// Opcional: servir arquivos estáticos do diretório atual
app.use(express.static('.'));

function buildTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    throw new Error('Define SMTP_USER and SMTP_PASS in .env');
  }
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

function ensureRequired(body) {
  const missing = [];
  const required = ['name', 'phone', 'jobTitle', 'details'];
  for (const k of required) if (!body[k] || !String(body[k]).trim()) missing.push(k);
  // endereço: precisa de addressText OU lat+lng
  const hasAddressText = body.addressText && String(body.addressText).trim().length > 0;
  const hasCoords = body.lat && body.lng;
  if (!hasAddressText && !hasCoords) missing.push('addressText_or_map');
  return missing;
}

app.post('/api/send-quote', upload.array('images', 12), async (req, res) => {
  try {
    const missing = ensureRequired(req.body || {});
    if (missing.length) return res.status(400).json({ ok: false, error: 'missing_fields', fields: missing });

    const toEmail = process.env.TO_EMAIL || 'novais.marcos.usa@gmail.com';
    const { name, phone, jobTitle, details, addressText = '', city = '', area = '', lat = '', lng = '', radiusMeters = '' } = req.body;

    const mapLink = (lat && lng) ? `https://www.openstreetmap.org/?mlat=${encodeURIComponent(lat)}&mlon=${encodeURIComponent(lng)}#map=16/${encodeURIComponent(lat)}/${encodeURIComponent(lng)}` : '';

    const plainLines = [
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Job: ${jobTitle}`,
      `Details: ${details}`,
      `Address (typed): ${addressText || '(not provided)'}`,
      `City: ${city || '(n/a)'}  |  Neighbourhood/Area: ${area || '(n/a)'}`,
      `Coordinates: ${lat && lng ? lat + ', ' + lng : '(not provided)'}`,
      `Proximity radius: ${radiusMeters ? radiusMeters + ' m' : '(n/a)'} ${mapLink ? '\nMap: ' + mapLink : ''}`
    ];

    const html = `
      <h2>New quote request</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}<br/>
      <strong>Phone:</strong> ${escapeHtml(phone)}<br/>
      <strong>Job:</strong> ${escapeHtml(jobTitle)}</p>
      <p><strong>Details:</strong><br/>${escapeHtml(details).replace(/\n/g, '<br/>')}</p>
      <p><strong>Address (typed):</strong> ${escapeHtml(addressText || '(not provided)')}</p>
      <p><strong>City:</strong> ${escapeHtml(city || '(n/a)')} &nbsp; | &nbsp; <strong>Neighbourhood/Area:</strong> ${escapeHtml(area || '(n/a)')}</p>
      <p><strong>Coordinates:</strong> ${lat && lng ? `${lat}, ${lng}` : '(not provided)'}<br/>
      <strong>Proximity radius:</strong> ${radiusMeters ? `${radiusMeters} m` : '(n/a)'}</p>
      ${mapLink ? `<p><a href="${mapLink}" target="_blank" rel="noopener">View on map</a></p>` : ''}
    `;

    const transporter = buildTransporter();
    const attachments = (req.files || []).map(f => ({ filename: f.originalname, content: f.buffer }));

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: toEmail,
      subject: `Quote: ${jobTitle} - ${name}`,
      text: plainLines.join('\n'),
      html,
      attachments
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Error sending email:', err.message);
    res.status(500).json({ ok: false, error: 'send_failed' });
  }
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}
