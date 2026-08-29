export default async function handler(req, res) {
  const BOT_TOKEN = '8966431953:AAEdSBiT3GEosQQUq1C2AV8n5VuAWEUi2Yk';
  const CHAT_ID = '5279066849';
  try {
    const { name, phone, seats, total, bookingId, utr, route, date } = req.body;
    const message = `🚨 NEW BOOKING 🚨\nID:${bookingId}\nRoute:${route}\nDate:${date}\nSeats:${seats}\nTotal:Rs.${total}\nName:${name}\nPhone:${phone}\nUTR:${utr}`;
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message })
    });
    res.json({ ok: true });
  } catch(e){ res.json({ ok:true }); }
}