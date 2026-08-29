import { useState } from 'react';
import './App.css';

export default function App() {
  const [route, setRoute] = useState('Saiha → Aizawl');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [utr, setUtr] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  const seats = Array.from({length: 10}, (_, i) => i+1);
  const pricePerSeat = 1500;
  const total = selectedSeats.length * pricePerSeat;
  const phoneNumber = '919362600601'; // I WhatsApp

  const toggleSeat = (s: number) => {
    setSelectedSeats(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s]);
  };

  const handleBooking = async () => {
    if (!name || !phone || selectedSeats.length===0) {
      alert('Name, Phone leh Seat fill rawh!');
      return;
    }
    if (!utr) {
      alert('UTR dah rawh!');
      return;
    }
    const bookingId = 'SUMO' + Math.floor(100000 + Math.random()*900000);

    const bookingData = {
      bookingId,
      name, phone,
      seats: selectedSeats.join(', '),
      total,
      utr, route, date
    };

    // 1. TELEGRAM 100% AUTO
    try {
      await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
    } catch(e){}

    // 2. WHATSAPP - 1 CLICK
    const msg = `🚨 NEW SUMO BOOKING 🚨%0A🆔 ID: ${bookingId}%0A📍 Route: ${route}%0A📅 Date: ${date}%0A💺 Seats: ${selectedSeats.join(', ')}%0A💰 Total: Rs.${total}%0A👤 Name: ${name}%0A📱 Phone: ${phone}%0A🏦 UTR: ${utr}%0A✅ Confirm Booking!`;
    const waUrl = `https://wa.me/${phoneNumber}?text=${msg}`;
    window.open(waUrl, '_blank');

    alert(`✅ Booking Sent!\nID: ${bookingId}\nTelegram AUTO + WhatsApp`);
    setSelectedSeats([]);
    setShowPayment(false);
    setUtr('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 mt-6">
        <h1 className="text-2xl font-bold text-center mb-2">🚐 Saiha Sumo Booking</h1>
        <p className="text-center text-gray-500 mb-6">Saiha ↔ Aizawl Daily Service</p>

        <label className="font-semibold">Route</label>
        <select value={route} onChange={e=>setRoute(e.target.value)} className="w-full p-3 border rounded-xl mt-1 mb-4">
          <option>Saiha → Aizawl</option>
          <option>Aizawl → Saiha</option>
        </select>

        <label className="font-semibold">Date</label>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full p-3 border rounded-xl mt-1 mb-4" />

        <label className="font-semibold">Select Seats (Rs.1500 each)</label>
        <div className="grid grid-cols-5 gap-3 my-3">
          {seats.map(s=>(
            <button key={s} onClick={()=>toggleSeat(s)} className={`p-3 rounded-xl font-bold border-2 ${selectedSeats.includes(s) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 border-gray-200'}`}>{s}</button>
          ))}
        </div>

        <div className="bg-blue-50 p-3 rounded-xl mb-4 text-center">
          Selected: {selectedSeats.join(', ') || 'None'} | Total: <b>Rs.{total}</b>
        </div>

        <input placeholder="Your Name" value={name} onChange={e=>setName(e.target.value)} className="w-full p-3 border rounded-xl mb-3" />
        <input placeholder="Phone Number" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full p-3 border rounded-xl mb-4" />

        {!showPayment ? (
          <button onClick={()=>{ if(selectedSeats.length&&name&&phone) setShowPayment(true); else alert('Fill all!'); }} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-lg">Proceed to Pay Rs.{total}</button>
        ) : (
          <div className="border-2 border-dashed border-blue-300 p-4 rounded-xl">
            <h3 className="font-bold text-center mb-3">💳 UPI Payment - Rs.{total}</h3>
            <div className="bg-yellow-50 p-3 rounded-xl text-center mb-3 text-sm">
              UPI ID: <b>9362600601@ybl</b><br/>Name: Hlimi Mami<br/>GPay / PhonePe ah pe rawh
            </div>
            <input placeholder="UTR / Transaction ID dah rawh" value={utr} onChange={e=>setUtr(e.target.value)} className="w-full p-3 border rounded-xl mb-3" />
            <button onClick={handleBooking} className="w-full bg-green-600 text-white p-4 rounded-xl font-bold">✅ Payment Done - Send Booking</button>
            <button onClick={()=>setShowPayment(false)} className="w-full mt-2 text-gray-500">Back</button>
            <p className="text-xs text-center mt-2 text-gray-500">Payment Done hmeh rualin: Telegram AUTO + WhatsApp Open</p>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState } from 'react';

export default function App() {
  const [route, setRoute] = useState('Saiha → Aizawl');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [utr, setUtr] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [showDemoBanner, setShowDemoBanner] = useState(true);

  const fillDemo = () => {
    setIsDemo(true);
    setName('Demo Client');
    setPhone('9876543210');
    setSelectedSeats([2,3]);
    setUtr('123456789012');
    setRoute('Saiha → Aizawl');
  };
  const clearDemo = () => {
    setIsDemo(false);
    setName(''); setPhone(''); setSelectedSeats([]); setUtr('');
  };

  const pricePerSeat = 1500;
  const total = selectedSeats.length * pricePerSeat;
  const phoneNumber = '919362600601';

  const toggleSeat = (s: number) => {
    setSelectedSeats(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s]);
  };

  const handleBooking = async () => {
    if (!name || !phone || selectedSeats.length===0) { alert('Name, Phone leh Seat fill rawh!'); return; }
    if (!utr) { alert('UTR dah rawh!'); return; }
    const bookingId = 'SUMO' + Math.floor(100000 + Math.random()*900000);
    const bookingData = { bookingId, name, phone, seats: selectedSeats.join(', '), total, utr, route, date };
    try {
      await fetch('/api/telegram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bookingData) });
    } catch(e){}
    const msg = `🚨 NEW SUMO BOOKING 🚨%0A🆔 ID: ${bookingId}%0A📍 Route: ${route}%0A📅 Date: ${date}%0A💺 Seats: ${selectedSeats.join(', ')}%0A💰 Total: Rs.${total}%0A👤 Name: ${name}%0A📱 Phone: ${phone}%0A🏦 UTR: ${utr}%0A✅ Confirm!`;
    window.open(`https://wa.me/${phoneNumber}?text=${msg}`, '_blank');
    alert(`✅ Booking Sent! ID: ${bookingId}`);
    setSelectedSeats([]); setShowPayment(false); setUtr('');
  };

  const copyUPI = () => {
    navigator.clipboard.writeText('9362600601@ybl');
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] font-sans">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap'); *{font-family:'Plus Jakarta Sans',sans-serif}`}</style>
      
      {/* HEADER */}
      <div className="bg-[#0a0e1f] text-white sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-5 py-4 flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl">🚐</div>
            <div><p className="font-extrabold leading-none">SIAHA SUMO</p><p className="text-[10px] tracking-[0.2em] text-blue-300">ONE STOP SOLUTION</p></div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={()=>{ if(isDemo) clearDemo(); else fillDemo(); }} className={`px-4 py-1.5 rounded-full text-xs font-extrabold border transition-all ${isDemo ? 'bg-yellow-400 text-black border-yellow-400 animate-pulse' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}>
              {isDemo ? '● DEMO ON' : '○ DEMO MODE'}
            </button>
            <div className="hidden md:flex items-center gap-2 text-[11px]"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>LIVE</div>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="relative bg-[#0a0e1f] pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 opacity-90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]"></div>
        <div className="relative max-w-5xl mx-auto px-5 pt-10 pb-6">
          <div className="flex gap-2 mb-4"><span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs text-white border border-white/20">✓ Trusted by 2000+ travellers</span><span className="bg-green-400 text-black px-3 py-1 rounded-full text-xs font-bold">4.9 ★</span></div>
          <h1 className="text-[32px] md:text-[44px] font-extrabold text-white leading-[0.9]">Saiha <span className="text-blue-200">↔</span> Aizawl<br/><span className="text-white/60 text-[22px] font-medium">Comfortable • Safe • On Time</span></h1>
          <div className="flex gap-3 mt-5 text-white/80 text-xs"><span>⏰ 6AM & 1PM Departure</span><span>•</span><span>🛣️ 6-7 Hours</span><span>•</span><span>📍 Counter: Siaha Bazar</span></div>
        </div>
      </div>

      {showDemoBanner && (
        <div className="max-w-5xl mx-auto px-5 -mt-12 relative z-20">
          <div className="bg-gradient-to-r from-amber-400 to-yellow-400 rounded-2xl p-3 px-5 flex justify-between items-center shadow-lg">
            <p className="text-sm font-bold text-black">👁️ Client Preview Mode • Demo data hmangin en theih • Booking tak tak a thleng lo</p>
            <button onClick={()=>setShowDemoBanner(false)} className="text-black/60 font-bold">✕</button>
          </div>
        </div>
      )}
      <div className="max-w-5xl mx-auto px-5 -mt-6 relative z-10 grid md:grid-cols-[1.2fr_0.8fr] gap-5 pt-6">
        {/* LEFT CARD */}
        <div className="bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-6 md:p-7">
          
          {/* ROUTE TOGGLE */}
          <p className="text-[11px] font-bold tracking-widest text-gray-400 mb-3">SELECT ROUTE</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {['Saiha → Aizawl','Aizawl → Saiha'].map(r=>(
              <button key={r} onClick={()=>setRoute(r)} className={`p-4 rounded-2xl border-2 text-left transition-all ${route===r ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                <p className="text-xs text-gray-500">{r.split('→')[0].trim()} TO</p>
                <p className={`font-extrabold ${route===r ? 'text-blue-600' : 'text-gray-800'}`}>{r.split('→')[1].trim()}</p>
                <p className="text-[11px] mt-1 text-gray-400">Dep: 6:00 AM</p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div><p className="text-[11px] font-bold tracking-widest text-gray-400 mb-2">JOURNEY DATE</p><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full p-3.5 rounded-2xl bg-gray-50 border border-gray-100 font-bold"/></div>
            <div><p className="text-[11px] font-bold tracking-widest text-gray-400 mb-2">FARE</p><div className="w-full p-3.5 rounded-2xl bg-[#0a0e1f] text-white font-bold flex justify-between"><span>Per Seat</span><span>₹1500</span></div></div>
          </div>

          {/* SUMO LAYOUT - BEAUTIFUL */}
          <p className="text-[11px] font-bold tracking-widest text-gray-400 mb-3">CHOOSE YOUR SEATS • {selectedSeats.length} SELECTED</p>
          <div className="bg-[#f8f9fc] rounded-[20px] p-5 border border-gray-100">
            <div className="flex justify-between items-center mb-4 text-[10px] text-gray-400"><span>FRONT</span><span className="flex gap-3"><span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-200 rounded"></span>Free</span><span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-600 rounded"></span>Selected</span><span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-800 rounded"></span>Driver</span></span></div>
            
            {/* Driver Row */}
            <div className="flex gap-3 mb-3">
              <div className="w-14 h-12 rounded-xl bg-gray-800 text-white flex items-center justify-center text-[10px] font-bold">DRIVER</div>
              <button onClick={()=>toggleSeat(1)} className={`flex-1 h-12 rounded-xl font-extrabold transition-all ${selectedSeats.includes(1) ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]' : 'bg-white border border-gray-200'}`}>1</button>
              <button onClick={()=>toggleSeat(2)} className={`flex-1 h-12 rounded-xl font-extrabold transition-all ${selectedSeats.includes(2) ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]' : 'bg-white border border-gray-200'}`}>2</button>
            </div>
            {/* Middle */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              {[3,4,5].map(n=>(
                <button key={n} onClick={()=>toggleSeat(n)} className={`h-12 rounded-xl font-extrabold transition-all ${selectedSeats.includes(n) ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]' : 'bg-white border border-gray-200'}`}>{n}</button>
              ))}
            </div>
            {/* Back */}
            <div className="grid grid-cols-4 gap-3">
              {[6,7,8,9].map(n=>(
                <button key={n} onClick={()=>toggleSeat(n)} className={`h-12 rounded-xl font-extrabold transition-all ${selectedSeats.includes(n) ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]' : 'bg-white border border-gray-200'}`}>{n}</button>
              ))}
              <button onClick={()=>toggleSeat(10)} className={`h-12 rounded-xl font-extrabold transition-all ${selectedSeats.includes(10) ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]' : 'bg-white border border-gray-200'}`}>10</button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-4 tracking-widest">REAR • BACK DOOR</p>
          </div>

          {selectedSeats.length>0 && (
            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
              <div><p className="text-xs opacity-80">Seats {selectedSeats.join(', ')} • {selectedSeats.length} person</p><p className="font-extrabold text-lg">Total Payable</p></div>
              <p className="text-2xl font-extrabold">₹{total}</p>
            </div>
          )}

          <div className="mt-7 space-y-4">
            <div><p className="text-[11px] font-bold tracking-widest text-gray-400 mb-2">PASSENGER DETAILS</p>
              <div className="grid gap-3">
                <div className="relative"><span className="absolute left-4 top-3.5 text-gray-400">👤</span><input placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} className="w-full pl-11 p-3.5 rounded-2xl bg-gray-50 border border-gray-100 font-medium"/></div>
                <div className="relative"><span className="absolute left-4 top-3.5 text-gray-400">📱</span><input placeholder="WhatsApp Number" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full pl-11 p-3.5 rounded-2xl bg-gray-50 border border-gray-100 font-medium"/></div>
              </div>
            </div>
            {!showPayment ? (
              <button disabled={selectedSeats.length===0||!name||!phone} onClick={()=>setShowPayment(true)} className={`w-full p-4 rounded-2xl font-extrabold text-[15px] transition-all ${selectedSeats.length&&name&&phone ? 'bg-[#0a0e1f] text-white shadow-xl hover:scale-[1.01]' : 'bg-gray-100 text-gray-400'}`}>Continue to Payment → ₹{total||0}</button>
            ) : (
              <div className="rounded-[20px] border-2 border-blue-100 bg-blue-50/50 p-5">
                <div className="flex justify-between items-center mb-4"><h3 className="font-extrabold">💳 UPI Payment</h3><span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Secure</span></div>
                <div className="bg-white rounded-2xl p-4 flex gap-4 items-center border border-blue-100">
                  <div className="w-20 h-20 bg-[#0a0e1f] rounded-xl flex items-center justify-center text-white text-[8px] text-center p-1">QR CODE<br/>GPay<br/>PhonePe<br/>Paytm</div>
                  <div className="flex-1"><p className="text-xs text-gray-500">UPI ID</p><div className="flex items-center gap-2"><p className="font-extrabold">9362600601@ybl</p><button onClick={copyUPI} className="text-xs bg-gray-900 text-white px-2 py-1 rounded-full">{copied ? 'Copied!' : 'Copy'}</button></div><p className="text-xs text-gray-500 mt-1">Name: Hlimi Mami • Amount: <b className="text-black">₹{total}</b></p></div>
                </div>
                <div className="mt-4"><p className="text-[11px] font-bold tracking-widest text-gray-400 mb-2">ENTER UTR / TRANSACTION ID</p><input placeholder="12-digit UTR dah rawh" value={utr} onChange={e=>setUtr(e.target.value)} className="w-full p-3.5 rounded-2xl bg-white border border-gray-200 font-bold tracking-widest"/></div>
                <button onClick={handleBooking} className="w-full mt-4 p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-extrabold shadow-lg shadow-green-200">✅ Payment Done - Confirm Booking</button>
                <button onClick={()=>setShowPayment(false)} className="w-full mt-2 text-sm text-gray-500">← Back to details</button>
                <p className="text-[11px] text-center mt-3 text-gray-500">Pay hmeh rualin Telegram ah AUTO + WhatsApp ah a lut nghal ang</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT TRUST CARD */}
        <div className="space-y-4">
          <div className="bg-white rounded-[24px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            <h3 className="font-extrabold mb-4">Why Siaha Sumo?</h3>
            <div className="space-y-3 text-sm"><div className="flex gap-3"><span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">🛡️</span><div><p className="font-bold">100% Safe & Verified</p><p className="text-xs text-gray-500">Licensed drivers, 10+ years exp</p></div></div>
            <div className="flex gap-3"><span className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">⚡</span><div><p className="font-bold">Instant Confirmation</p><p className="text-xs text-gray-500">Telegram + WhatsApp AUTO</p></div></div>
            <div className="flex gap-3"><span className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">📍</span><div><p className="font-bold">Siaha Counter</p><p className="text-xs text-gray-500">Bazar, Near Traffic Point<br/>Ph: 9362600601</p></div></div></div>
          </div>
          <div className="bg-[#0a0e1f] rounded-[24px] p-6 text-white">
            <p className="text-xs tracking-widest text-white/50 mb-3">TODAY'S SCHEDULE</p>
            <div className="space-y-2 text-sm"><div className="flex justify-between bg-white/10 p-3 rounded-xl"><span>Saiha → Aizawl</span><span className="font-bold">6:00 AM, 1:00 PM</span></div><div className="flex justify-between bg-white/10 p-3 rounded-xl"><span>Aizawl → Saiha</span><span className="font-bold">6:30 AM, 12:30 PM</span></div></div>
          </div>
        </div>
      </div>
      <div className="text-center py-10 text-xs text-gray-400">© 2026 Siaha One Stop Solution • Made with ❤️ for Mizoram</div>
    </div>
  );
}
