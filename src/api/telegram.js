
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  const BOT_TOKEN = '8966431953:AAEdSBiT3GEosQQUq1C2AV8n5VuAWEUi2Yk';
  const CHAT_ID = '5279066849';

  try {
    const { name, phone, seats, total, bookingId, utr, route, date } = req.body;

    const message = `🚨 *NEW SUMO BOOKING* 🚨

🆔 *ID:* ${bookingId}
📍 *Route:* ${route || 'Saiha ↔ Aizawl'}
📅 *Date:* ${date || new Date().toLocaleDateString()}
💺 *Seats:* ${seats ? seats.join(', ') : ''}
💰 *Total:* Rs.${total}
👤 *Name:* ${name}
📱 *Phone:* ${phone}
💳 *UTR:* ${utr || 'Not provided'}

✅ *Action:* Please confirm booking!

_Sumo Booking System_
`;

    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const result = await response.json();
    
    if (result.ok) {
      return res.status(200).json({ ok: true, telegram: true });
    } else {
      console.error('Telegram error:', result);
      return res.status(200).json({ ok: true, telegram: false, error: result });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(200).json({ ok: true, error: error.message });
  }
}
