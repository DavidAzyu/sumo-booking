
export default async function handler(req, res) {
  const BOT_TOKEN = '8966431953:AAEdSBiT3GEosQQUq1C2AV8n5VuAWEUi2Yk';
  const CHAT_ID = '5279066849';
  try {
    const { name, phone, seats, total, bookingId, utr, route, date } = req.body;
    const seatStr = Array.isArray(seats) ? seats.join(',') : seats;
    const text = `🚨 NEW SUMO BOOKING 🚨
🆔 ID: ${bookingId}
📍 Route: ${route}
📅 Date: ${date}
💺 Seats: ${seatStr}
💰 Total: Rs.${total}
👤 Name: ${name}
📱 Phone: ${phone}
🏦 UTR: ${utr}
✅ Action: Please confirm booking!
Sumo Booking System`;
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' })
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(200).json({ ok: true, error: e.message });
  }
}
