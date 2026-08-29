import { useState, useEffect } from 'react';

type Sumo = {
  id: string;
  route: string;
  date: string;
  time: string;
  driver: string;
  driverPhone: string;
  vehicle: string;
  price: number;
  totalSeats: number;
  bookedSeats: number[];
  amenities: string[];
  status: 'Available' | 'Full' | 'On Road';
};

type BookingRec = {
  id: string;
  sumoId: string;
  route: string;
  date: string;
  seats: number[];
  name: string;
  phone: string;
  total: number;
  time: string;
};

export default function App(){
  const [view, setView] = useState<'user'|'admin'>('user');
  const [adminPass, setAdminPass] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [step, setStep] = useState(1);

  const [sumos, setSumos] = useState<Sumo[]>(()=>{
    const saved = localStorage.getItem('sumos_v2');
    if(saved) return JSON.parse(saved);
    return [
      {id:'SUMO001', route:'Saiha → Aizawl', date:new Date().toISOString().split('T')[0], time:'06:00 AM', driver:'Hlimi Mami', driverPhone:'9362600601', vehicle:'MZ01 AB 1234 • White Bolero', price:1500, totalSeats:10, bookedSeats:[], amenities:['AC','Charging','Water','Blanket'], status:'Available'},
      {id:'SUMO002', route:'Saiha → Aizawl', date:new Date().toISOString().split('T')[0], time:'01:00 PM', driver:'Zuala', driverPhone:'9862345678', vehicle:'MZ01 CD 5678 • Black Sumo', price:1500, totalSeats:10, bookedSeats:[1,2], amenities:['AC','Charging'], status:'Available'},
      {id:'SUMO003', route:'Aizawl → Saiha', date:new Date(Date.now()+86400000).toISOString().split('T')[0], time:'06:30 AM', driver:'Ruatfela', driverPhone:'9862123456', vehicle:'MZ01 EF 9012 • Silver', price:1500, totalSeats:10, bookedSeats:[], amenities:['AC','Water'], status:'Available'},
    ];
  });
  const [bookings, setBookings] = useState<BookingRec[]>(()=>{
    const s = localStorage.getItem('bookings_v2');
    return s ? JSON.parse(s) : [];
  });

  const [selectedSumoId, setSelectedSumoId] = useState(sumos[0]?.id);
  const selectedSumo = sumos.find(s=>s.id===selectedSumoId) || sumos[0];
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [utr, setUtr] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [searchRoute, setSearchRoute] = useState('All');

  const [newSumo, setNewSumo] = useState({route:'Saiha → Aizawl', date:new Date().toISOString().split('T')[0], time:'6:00 AM', driver:'', driverPhone:'', vehicle:'', price:1500, totalSeats:10});

  useEffect(()=>{ localStorage.setItem('sumos_v2', JSON.stringify(sumos)); }, [sumos]);
  useEffect(()=>{ localStorage.setItem('bookings_v2', JSON.stringify(bookings)); }, [bookings]);

  const filteredSumos = sumos.filter(s=> searchRoute==='All' || s.route===searchRoute);

  const toggleSeat = (n:number) => {
    if(selectedSumo.bookedSeats.includes(n)) return;
    setSelectedSeats(p=> p.includes(n) ? p.filter(x=>x!==n) : [...p, n]);
  };
  const getSeatPos = (n:number) => n<=2 ? 'Front Window' : n<=5 ? 'Middle' : 'Rear';

  const total = selectedSeats.length * selectedSumo.price;

  const handleBooking = async () => {
    if(!name||!phone||selectedSeats.length===0){ alert('Fill all!'); return; }
    if(!utr){ alert('UTR dah rawh!'); return; }
    const bookingId = 'SIAHA'+Math.floor(100000+Math.random()*900000);
    const seatLines = selectedSeats.map(s=>`  • Seat ${s} - ${getSeatPos(s)}`).join('%0A');
    const seatVisual = selectedSeats.map(s=>`[${s}]`).join(' ');
    const data = {bookingId, name, phone, seats:selectedSeats.map(s=>`Seat ${s} (${getSeatPos(s)})`).join(', '), seatVisual, total, utr, route:selectedSumo.route, date:selectedSumo.date, time:selectedSumo.time, sumoId:selectedSumo.id, driver:selectedSumo.driver};

    setSumos(prev=>prev.map(s=> s.id===selectedSumo.id ? {...s, bookedSeats:[...s.bookedSeats, ...selectedSeats]} : s));
    setBookings(prev=>[{id:bookingId, sumoId:selectedSumo.id, route:selectedSumo.route, date:selectedSumo.date, seats:selectedSeats, name, phone, total, time:selectedSumo.time}, ...prev]);

    try{ await fetch('/api/telegram',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});}catch(e){}

    const waMsg = `🚐 *SIAHA SUMO - BOOKING CONFIRMED*%0A%0A🆔 *ID:* ${bookingId}%0A🚐 *Sumo:* ${selectedSumo.id} - ${selectedSumo.vehicle}%0A👨‍✈️ *Driver:* ${selectedSumo.driver} (${selectedSumo.driverPhone})%0A📍 *Route:* ${selectedSumo.route}%0A📅 *Date:* ${selectedSumo.date} | ⏰ ${selectedSumo.time}%0A%0A💺 *SEATS:*%0A${seatLines}%0A${seatVisual}%0A%0A💰 *Total:* Rs.${total} (${selectedSeats.length} seats)%0A👤 *Passenger:* ${name}%0A📱 *Phone:* ${phone}%0A🏦 *UTR:* ${utr}%0A%0A✅ Confirm please!%0ASiaha One Stop - 9362600601`;
    window.open(`https://wa.me/919362600601?text=${waMsg}`,'_blank');
    alert(`✅ Booked! ${bookingId} Seats: ${selectedSeats.join(', ')}`);
    setSelectedSeats([]); setShowPayment(false); setUtr(''); setStep(1);
  };

  const addSumo = () => {
    if(!newSumo.driver){ alert('Driver dah rawh'); return; }
    const id='SUMO'+Math.floor(100+Math.random()*900);
    setSumos([...sumos, {id, route:newSumo.route, date:newSumo.date, time:newSumo.time, driver:newSumo.driver, driverPhone:newSumo.driverPhone, vehicle:newSumo.vehicle, price:newSumo.price, totalSeats:newSumo.totalSeats, bookedSeats:[], amenities:['AC','Charging'], status:'Available'}]);
    alert('Added!');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[14px]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap'); *{font-family:'Plus Jakarta Sans',sans-serif} .display{font-family:'Space Grotesk',sans-serif}`}</style>

      {/* NAV */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b">
        <div className="max-w-7xl mx-auto px-5 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={()=>setView('user')}>
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-extrabold">S</div>
            <div><p className="display font-bold leading-none tracking-tight">SIAHA SUMO</p><p className="text-[9px] tracking-[0.25em] text-gray-400 font-bold">ONE STOP SOLUTION</p></div>
            <span className="ml-3 hidden md:flex items-center gap-1.5 text-[10px] bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-bold"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> LIVE TRACKING</span>
          </div>
          <div className="flex items-center gap-2">
            {view==='user' && <>
              <div className="hidden md:flex items-center gap-2 text-xs text-gray-500"><span>📍 Siaha Bazar</span><span>•</span><span>⏰ 6AM-1PM</span></div>
              <button onClick={()=>{ if(isDemo){ setIsDemo(false); setName(''); setPhone(''); setSelectedSeats([]);} else { setIsDemo(true); setName('Demo Client'); setPhone('9876543210'); setSelectedSeats([2,3]); setUtr('123456789012'); } }} className={`px-3.5 py-2 rounded-full text-xs font-bold border ${isDemo ? 'bg-black text-white' : 'bg-white border-gray-200'}`}>{isDemo ? 'DEMO ON' : 'DEMO'}</button>
            </>}
            <button onClick={()=>setView(view==='admin'?'user':'admin')} className="px-4 py-2 rounded-full bg-black text-white text-xs font-bold">{view==='admin'?'User View':'Admin • 9362'}</button>
          </div>
        </div>
      </div>

      {view==='user' ? (
        <>
          {/* HERO */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81]"></div>
            <div className="absolute inset-0 opacity-30" style={{backgroundImage:'radial-gradient(circle at 20% 30%, white 1px, transparent 1px)', backgroundSize:'32px 32px'}}></div>
            <div className="relative max-w-7xl mx-auto px-5 py-10 md:py-14 grid md:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
              <div>
                <div className="inline-flex gap-2 items-center bg-white/10 border border-white/20 rounded-full px-3 py-1 text-[11px] text-white mb-4">⭐ 4.9/5 • 2,847 Happy Travellers • Since 2018</div>
                <h1 className="display text-[38px] md:text-[56px] font-bold text-white leading-[0.9] tracking-tight">Saiha to Aizawl,<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-violet-300">comfort redefined.</span></h1>
                <p className="text-white/60 mt-4 text-[15px] max-w-lg">Premium Sumo service with live tracking, verified drivers, instant WhatsApp + Telegram confirmation. No agents, direct booking.</p>
                <div className="grid grid-cols-3 gap-3 mt-6 max-w-lg">
                  <div className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-3"><p className="text-white font-bold text-lg">6H</p><p className="text-white/50 text-xs">Avg Journey</p></div>
                  <div className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-3"><p className="text-white font-bold text-lg">100%</p><p className="text-white/50 text-xs">Safe Record</p></div>
                  <div className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-3"><p className="text-white font-bold text-lg">24/7</p><p className="text-white/50 text-xs">Support</p></div>
                </div>
              </div>
              <div className="bg-white rounded-[28px] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.4)]">
                <div className="flex justify-between items-center mb-4"><p className="font-bold">Quick Check</p><p className="text-xs bg-black text-white px-2.5 py-1 rounded-full">{filteredSumos.length} Sumo Available</p></div>
                <div className="flex gap-2 mb-4">{['All','Saiha → Aizawl','Aizawl → Saiha'].map(r=><button key={r} onClick={()=>setSearchRoute(r)} className={`px-3 py-2 rounded-full text-xs font-bold border ${searchRoute===r ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-200'}`}>{r}</button>)}</div>
                <div className="space-y-2.5 max-h-[300px] overflow-auto pr-1">
                  {filteredSumos.map(s=>{
                    const left = s.totalSeats - s.bookedSeats.length;
                    return (
                      <div key={s.id} onClick={()=>{ setSelectedSumoId(s.id); setSelectedSeats([]); setStep(2); }} className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${selectedSumoId===s.id ? 'border-black bg-gray-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                        <div className="flex justify-between"><div><p className="font-bold text-sm flex items-center gap-2">{s.route} <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.status==='Available'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{s.status}</span></p><p className="text-xs text-gray-500 mt-0.5">{s.time} • {s.vehicle} • {s.driver}</p></div><div className="text-right"><p className="font-extrabold">₹{s.price}</p><p className={`text-[11px] font-bold ${left<=2 ? 'text-red-600' : 'text-green-600'}`}>{left} left</p></div></div>
                        <div className="flex gap-1.5 mt-2">{s.amenities.map(a=><span key={a} className="text-[10px] bg-gray-900 text-white px-2 py-0.5 rounded-full">{a}</span>)}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* BOOKING FLOW */}
          <div className="max-w-7xl mx-auto px-5 py-8 grid lg:grid-cols-[1.2fr_0.8fr] gap-6 -mt-6 relative z-10">
            <div className="bg-white rounded-[28px] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border p-6 md:p-8">
              <div className="flex items-center gap-3 mb-7">
                {[
                  {n:1, t:'Sumo & Seat'},
                  {n:2, t:'Details'},
                  {n:3, t:'Pay & Confirm'}
                ].map(s=>(
                  <div key={s.n} className="flex items-center gap-2"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step>=s.n ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>{s.n}</div><p className={`text-xs font-bold ${step>=s.n ? 'text-black' : 'text-gray-400'}`}>{s.t}</p>{s.n!==3 && <div className="w-8 h-0.5 bg-gray-200 mx-1"></div>}</div>
                ))}
              </div>

              {step===1 && (
                <>
                  <h3 className="font-bold text-lg mb-1">Choose your Sumo & Seat</h3>
                  <p className="text-sm text-gray-500 mb-5">Selected: <b className="text-black">{selectedSumo.id}</b> • {selectedSumo.route} • {selectedSumo.time} • Driver {selectedSumo.driver}</p>
                  <div className="bg-[#f8fafc] border rounded-[22px] p-5">
                    <div className="flex justify-between text-[11px] font-bold tracking-widest text-gray-400 mb-4"><span>DRIVER CABIN</span><span>{selectedSumo.bookedSeats.length} BOOKED / {selectedSumo.totalSeats} TOTAL</span></div>
                    <div className="flex gap-3 mb-3"><div className="w-[64px] h-12 rounded-xl bg-black text-white flex flex-col items-center justify-center text-[9px] leading-none font-bold"><span>●</span><span>DRIVER</span></div>
                      {[1,2].map(n=>{ const b=selectedSumo.bookedSeats.includes(n); return <button disabled={b} key={n} onClick={()=>toggleSeat(n)} className={`flex-1 h-12 rounded-xl font-bold border-2 transition-all ${b ? 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed' : selectedSeats.includes(n) ? 'bg-black text-white border-black scale-[1.02] shadow-lg' : 'bg-white border-gray-200 hover:border-black'}`}>{b?'✕':n}<span className="block text-[8px] font-normal opacity-60">{getSeatPos(n)}</span></button>})}
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">{[3,4,5].map(n=>{ const b=selectedSumo.bookedSeats.includes(n); return <button disabled={b} key={n} onClick={()=>toggleSeat(n)} className={`h-[56px] rounded-xl font-bold border-2 ${b ? 'bg-gray-200 text-gray-400' : selectedSeats.includes(n) ? 'bg-black text-white border-black' : 'bg-white border-gray-200'}`}>{b?'✕':n}<span className="block text-[8px] font-normal">{getSeatPos(n)}</span></button>})}</div>
                    <div className="grid grid-cols-5 gap-3">{[6,7,8,9,10].map(n=>{ const b=selectedSumo.bookedSeats.includes(n); return <button disabled={b} key={n} onClick={()=>toggleSeat(n)} className={`h-[56px] rounded-xl font-bold border-2 ${b ? 'bg-gray-200 text-gray-400' : selectedSeats.includes(n) ? 'bg-black text-white border-black' : 'bg-white border-gray-200'}`}>{b?'✕':n}</button>})}</div>
                    <div className="flex gap-4 mt-5 text-[11px]"><span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-white border-2 border-gray-300 rounded"></span> Available</span><span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-black rounded"></span> Selected</span><span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gray-200 rounded"></span> Booked</span></div>
                  </div>
                  <button disabled={selectedSeats.length===0} onClick={()=>setStep(2)} className={`w-full mt-5 p-4 rounded-2xl font-bold ${selectedSeats.length ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>Continue with {selectedSeats.length} seat{selectedSeats.length>1?'s':''} →</button>
                </>
              )}

              {step===2 && (
                <>
                  <h3 className="font-bold text-lg">Passenger Details</h3>
                  <p className="text-sm text-gray-500 mb-5">Seats: {selectedSeats.map(s=>`${s} (${getSeatPos(s)})`).join(', ')} • Total ₹{total}</p>
                  <div className="grid gap-3">
                    <label className="text-xs font-bold tracking-widest text-gray-400">FULL NAME</label>
                    <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: H. Lalrindika" className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 font-medium"/>
                    <label className="text-xs font-bold tracking-widest text-gray-400 mt-2">WHATSAPP NUMBER</label>
                    <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="98765 43210" className="w-full p-4 rounded-2xl bg-gray-50 border font-medium"/>
                    <div className="flex gap-2 mt-4"><button onClick={()=>setStep(1)} className="flex-1 p-4 rounded-2xl bg-gray-100 font-bold">Back</button><button disabled={!name||!phone} onClick={()=>{ setStep(3); setShowPayment(true); }} className={`flex-1 p-4 rounded-2xl font-bold ${name&&phone ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>Proceed to Pay → ₹{total}</button></div>
                  </div>
                </>
              )}

              {step===3 && (
                <>
                  <h3 className="font-bold text-lg">Secure Payment</h3>
                  <p className="text-sm text-gray-500 mb-5">UPI • GPay • PhonePe • Paytm • 100% Safe</p>
                  <div className="rounded-[22px] border-2 border-black bg-white p-5">
                    <div className="flex gap-4">
                      <div className="w-[96px] h-[96px] rounded-2xl bg-black flex items-center justify-center text-white text-[10px] leading-tight text-center p-2 font-bold">QR CODE<br/><br/>GPay<br/>PhonePe<br/>Paytm</div>
                      <div className="flex-1"><p className="text-[11px] font-bold tracking-widest text-gray-400">UPI ID (Tap to Copy)</p><button onClick={()=>{ navigator.clipboard.writeText('9362600601@ybl'); setCopied(true); setTimeout(()=>setCopied(false),1500); }} className="mt-1 font-bold text-[16px] flex items-center gap-2">9362600601@ybl <span className="text-xs bg-black text-white px-2.5 py-1 rounded-full">{copied?'Copied!':'Copy'}</span></button><p className="text-xs text-gray-500 mt-2">Name: <b className="text-black">Hlimi Mami</b> • Amount: <b className="text-black">₹{total}</b></p><p className="text-[11px] mt-2 bg-yellow-50 border border-yellow-200 rounded-full px-2.5 py-1 inline-block">Seats: {selectedSeats.join(', ')} • {selectedSumo.route} • {selectedSumo.time}</p></div>
                    </div>
                    <div className="mt-5"><label className="text-xs font-bold tracking-widest text-gray-400">UTR / TRANSACTION ID (12 digits)</label><input value={utr} onChange={e=>setUtr(e.target.value)} placeholder="Enter UTR after payment" className="w-full mt-2 p-4 rounded-2xl border-2 border-gray-200 focus:border-black font-bold tracking-widest"/></div>
                    <button onClick={handleBooking} className="w-full mt-4 p-4 rounded-2xl bg-[#0f172a] text-white font-bold text-[15px]">✅ I Paid - Confirm Booking</button>
                    <div className="mt-3 text-[11px] text-gray-500 text-center">Payment Done → Telegram AUTO → WhatsApp with seat details: {selectedSeats.map(s=>`Seat ${s}`).join(', ')}</div>
                  </div>
                  <button onClick={()=>setStep(2)} className="w-full mt-3 text-sm text-gray-500">← Back to details</button>
                </>
              )}
            </div>

            <div className="space-y-5">
              <div className="bg-white rounded-[24px] border p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">🎫 Booking Summary</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Sumo</span><b>{selectedSumo.id}</b></div>
                  <div className="flex justify-between"><span className="text-gray-500">Route</span><b>{selectedSumo.route}</b></div>
                  <div className="flex justify-between"><span className="text-gray-500">Date & Time</span><b>{selectedSumo.date} • {selectedSumo.time}</b></div>
                  <div className="flex justify-between"><span className="text-gray-500">Driver</span><b>{selectedSumo.driver}</b></div>
                  <div className="flex justify-between"><span className="text-gray-500">Vehicle</span><b className="text-xs">{selectedSumo.vehicle}</b></div>
                  <div className="border-t pt-3 flex justify-between"><span className="text-gray-500">Seats</span><b>{selectedSeats.length ? selectedSeats.map(s=>`${s} (${getSeatPos(s)})`).join(', ') : 'Not selected'}</b></div>
                  <div className="flex justify-between text-[18px]"><span className="font-bold">Total</span><span className="font-extrabold">₹{total || 0}</span></div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2 text-[11px]">{['✓ Instant Confirmation','✓ No Extra Charge','✓ 24/7 Support','✓ Safe & Verified'].map(t=><div key={t} className="bg-gray-50 border rounded-full px-2.5 py-1.5 text-center font-bold">{t}</div>)}</div>
              </div>

              <div className="bg-[#0f172a] rounded-[24px] p-6 text-white">
                <h4 className="font-bold mb-3">📢 Why Travellers Love Us</h4>
                <div className="space-y-3 text-sm">
                  <div className="bg-white/10 rounded-2xl p-3"><p className="font-bold">“On time, driver polite, seat clean!”</p><p className="text-xs text-white/60 mt-1">— Lalmuanpuia • Saiha → Aizawl</p></div>
                  <div className="bg-white/10 rounded-2xl p-3"><p className="font-bold">“WhatsApp confirmation in 2 seconds!”</p><p className="text-xs text-white/60 mt-1">— Jenny • Aizawl → Saiha</p></div>
                </div>
              </div>

              <div className="bg-white rounded-[24px] border p-5">
                <h4 className="font-bold text-sm mb-3">📋 Recent Bookings (Your Device)</h4>
                <div className="space-y-2 max-h-[200px] overflow-auto">
                  {bookings.length===0 ? <p className="text-xs text-gray-400">No bookings yet</p> : bookings.slice(0,5).map(b=><div key={b.id} className="text-xs p-2.5 rounded-xl bg-gray-50 border flex justify-between"><span><b>{b.id}</b> • {b.route} • Seats {b.seats.join(',')}</span><span>₹{b.total}</span></div>)}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-5 py-6">
            <div className="bg-white rounded-[24px] border p-6 grid md:grid-cols-4 gap-6 text-sm">
              <div><p className="font-bold mb-2">📍 Counter Address</p><p className="text-gray-500">Siaha Bazar, Near Traffic Point, Saiha - 796901<br/>Aizawl Counter: Bawngkawn<br/>Ph: 9362600601</p></div>
              <div><p className="font-bold mb-2">⏰ Departure</p><p className="text-gray-500">Saiha → Aizawl: 6:00 AM, 1:00 PM<br/>Aizawl → Saiha: 6:30 AM, 12:30 PM<br/>Journey: 6-7 Hours</p></div>
              <div><p className="font-bold mb-2">💳 Payment</p><p className="text-gray-500">UPI: 9362600601@ybl<br/>GPay, PhonePe, Paytm<br/>Name: Hlimi Mami</p></div>
              <div><p className="font-bold mb-2">🛡️ Policy</p><p className="text-gray-500">Cancel 24h before: 90% refund<br/>No refund after departure<br/>Carry valid ID proof</p></div>
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-7xl mx-auto px-5 py-8">
          {!isAdmin ? (
            <div className="max-w-sm mx-auto bg-white rounded-[28px] p-8 shadow-xl border mt-12">
              <h2 className="display text-2xl font-bold mb-1">Admin Panel</h2><p className="text-sm text-gray-500 mb-6">Manage Sumos, Drivers, Bookings</p>
              <input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} placeholder="Password: 9362" className="w-full p-4 rounded-2xl bg-gray-50 border mb-3 font-bold"/>
              <button onClick={()=>{ if(adminPass==='9362'||adminPass==='admin'){ setIsAdmin(true);} else alert('Wrong!'); }} className="w-full p-4 rounded-2xl bg-black text-white font-bold">Login</button>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl border p-5"><p className="text-xs text-gray-400 font-bold tracking-widest">TOTAL SUMOS</p><p className="text-3xl font-extrabold mt-1">{sumos.length}</p></div>
                <div className="bg-white rounded-2xl border p-5"><p className="text-xs text-gray-400 font-bold tracking-widest">TOTAL SEATS BOOKED</p><p className="text-3xl font-extrabold mt-1">{sumos.reduce((a,s)=>a+s.bookedSeats.length,0)}</p></div>
                <div className="bg-white rounded-2xl border p-5"><p className="text-xs text-gray-400 font-bold tracking-widest">TOTAL EARNINGS</p><p className="text-3xl font-extrabold mt-1">₹{bookings.reduce((a,b)=>a+b.total,0)}</p></div>
                <div className="bg-white rounded-2xl border p-5"><p className="text-xs text-gray-400 font-bold tracking-widest">BOOKINGS</p><p className="text-3xl font-extrabold mt-1">{bookings.length}</p></div>
              </div>

              <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
                <div className="bg-white rounded-[24px] border p-6">
                  <h3 className="font-bold text-lg mb-4">➕ Add Sumo</h3>
                  <div className="space-y-3">
                    <select value={newSumo.route} onChange={e=>setNewSumo({...newSumo, route:e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border font-bold"><option>Saiha → Aizawl</option><option>Aizawl → Saiha</option></select>
                    <div className="grid grid-cols-2 gap-3"><input type="date" value={newSumo.date} onChange={e=>setNewSumo({...newSumo, date:e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border"/><input value={newSumo.time} onChange={e=>setNewSumo({...newSumo, time:e.target.value})} placeholder="6:00 AM" className="w-full p-3.5 rounded-xl bg-gray-50 border"/></div>
                    <input value={newSumo.driver} onChange={e=>setNewSumo({...newSumo, driver:e.target.value})} placeholder="Driver Name" className="w-full p-3.5 rounded-xl bg-gray-50 border"/>
                    <div className="grid grid-cols-2 gap-3"><input value={newSumo.driverPhone} onChange={e=>setNewSumo({...newSumo, driverPhone:e.target.value})} placeholder="Driver Phone" className="w-full p-3.5 rounded-xl bg-gray-50 border"/><input value={newSumo.vehicle} onChange={e=>setNewSumo({...newSumo, vehicle:e.target.value})} placeholder="Vehicle No • Color" className="w-full p-3.5 rounded-xl bg-gray-50 border"/></div>
                    <div className="grid grid-cols-2 gap-3"><input type="number" value={newSumo.price} onChange={e=>setNewSumo({...newSumo, price:parseInt(e.target.value)||0})} placeholder="Price" className="w-full p-3.5 rounded-xl bg-gray-50 border"/><input type="number" value={newSumo.totalSeats} onChange={e=>setNewSumo({...newSumo, totalSeats:parseInt(e.target.value)||10})} placeholder="Seats" className="w-full p-3.5 rounded-xl bg-gray-50 border"/></div>
                    <button onClick={addSumo} className="w-full p-4 rounded-2xl bg-black text-white font-bold">Add Sumo to List</button>
                  </div>

                  <h3 className="font-bold mt-8 mb-3">📋 Recent Bookings</h3>
                  <div className="space-y-2 max-h-[300px] overflow-auto">
                    {bookings.map(b=>(
                      <div key={b.id} className="p-3 rounded-xl bg-gray-50 border text-xs"><p className="font-bold">{b.id} • {b.route} • {b.date} {b.time}</p><p>Seats: {b.seats.map(s=>`Seat ${s}`).join(', ')} • {b.name} • {b.phone} • ₹{b.total}</p></div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[24px] border p-6">
                  <h3 className="font-bold text-lg mb-4">🚐 All Sumos ({sumos.length}) - Add/Delete/Edit</h3>
                  <div className="space-y-3 max-h-[800px] overflow-auto pr-1">
                    {sumos.map(s=>(
                      <div key={s.id} className="p-4 rounded-2xl bg-gray-50 border">
                        <div className="flex justify-between items-start"><div><p className="font-bold text-sm">{s.id} • {s.route} • {s.time}</p><p className="text-xs text-gray-500">{s.date} | {s.driver} {s.driverPhone} | {s.vehicle}</p><p className="text-xs mt-1 font-medium">Booked Seats: {s.bookedSeats.length ? s.bookedSeats.map(n=>`Seat No.${n} (${n<=2?'Front':n<=5?'Middle':'Back'})`).join(', ') : 'None'} • Left: {s.totalSeats - s.bookedSeats.length}</p></div><div className="flex flex-col gap-1.5 ml-3"><button onClick={()=>{ if(confirm('Clear seats?')) setSumos(sumos.map(x=> x.id===s.id ? {...x, bookedSeats:[]} : x)); }} className="text-[11px] bg-white border px-3 py-1 rounded-full font-bold">Clear</button><button onClick={()=>{ if(confirm('Delete?')) setSumos(sumos.filter(x=>x.id!==s.id)); }} className="text-[11px] bg-black text-white px-3 py-1 rounded-full font-bold">Delete</button></div></div>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>{ setIsAdmin(false); setView('user'); }} className="w-full mt-6 p-3.5 rounded-xl bg-gray-100 font-bold">Logout</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="text-center py-8 text-[11px] text-gray-400 tracking-widest">© 2026 SIAHA ONE STOP SOLUTION • BUILT FOR MIZORAM • 9362600601</div>
    </div>
  );
}
