export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'POST only'});
  const {name, phone, seats, total, bookingId, utr} = req.body;
  const adminPhone = "919362600601";
  const apiKey = "HETAH I APIKEY DAH RAWH"; // <-- Step 2 ah i hmu ang
  
  const message = `NEW BOOKING%0AName:${name}%0APhone:${phone}%0ASeats:${seats}%0AAmount:Rs.${total}%0ABooking:${bookingId}%0AUTR:${utr}`;

  try {
    await fetch(`https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${message}&apikey=${apiKey}`);
    res.json({ok:true});
  } catch(e){
    res.json({ok:false});
  }
}