import { useState, useEffect } from 'react';

type Sumo = {
  id: string;
  route: string;
  date: string;
  time: string;
  driver: string;
  price: number;
  totalSeats: number;
  bookedSeats: number[];
};



export default function App() {
  const [view, setView] = useState<'user'|'admin'>('user');
  const [adminPass, setAdminPass] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [sumos, setSumos] = useState<Sumo[]>(()=>{
    const saved = localStorage.getItem('sumos');
    if(saved) return JSON.parse(saved);
    return [
      {id:'SUMO001', route:'Saiha → Aizawl', date:new Date().toISOString().split('T')[0], time:'6:00 AM', driver:'Hlimi - MZ01-1234', price:1500, totalSeats:10, bookedSeats:[]},
      {id:'SUMO002', route:'Aizawl → Saiha', date:new Date().toISOString().split('T')[0], time:'1:00 PM', driver:'Zuala - MZ01-5678', price:1500, totalSeats:10, bookedSeats:[1,2]},
    ];
  });
  const [selectedSumoId, setSelectedSumoId] = useState<string>(sumos[0]?.id || '');
  const selectedSumo = sumos.find(s=>s.id===selectedSumoId) || sumos[0];

  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [utr, setUtr] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  // Admin form
  const [newSumo, setNewSumo] = useState({route:'Saiha → Aizawl', date:new Date().toISOString().split('T')[0], time:'6:00 AM', driver:'', price:1500, totalSeats:10});

  useEffect(()=>{ localStorage.setItem('sumos', JSON.stringify(sumos)); }, [sumos]);

  const toggleSeat = (s:number) => {
    if(selectedSumo.bookedSeats.includes(s)) return;
    setSelectedSeats(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s]);
  };

  const getSeatLabel = (n:number) => {
    if(n<=2) return `Front ${n}`;
    if(n<=5) return `Middle ${n}`;
    return `Back ${n}`;
  };

  const handleBooking = async () => {
    if (!name || !phone || selectedSeats.length===0) { alert('Name, Phone leh Seat fill rawh!'); return; }
    if (!utr) { alert('UTR dah rawh!'); return; }
    const bookingId = 'BK' + Math.floor(100000 + Math.random()*900000);
    const total = selectedSeats.length * selectedSumo.price;
    
    const seatDetails = selectedSeats.map(s=>`${s} (${getSeatLabel(s)})`).join(', ');
    const seatVisual = selectedSeats.map(s=>`[${s}]`).join(' ');

    const bookingData = {
      bookingId, name, phone,
      seats: seatDetails,
      seatVisual,
      total, utr,
      route: selectedSumo.route,
      date: selectedSumo.date,
      time: selectedSumo.time,
      sumoId: selectedSumo.id,
      driver: selectedSumo.driver
    };

    // Update booked seats
    setSumos(prev=>prev.map(s=> s.id===selectedSumo.id ? {...s, bookedSeats:[...s.bookedSeats, ...selectedSeats]} : s));

    try {
      await fetch('/api/telegram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bookingData) });
    } catch(e){}

    // Felfai WhatsApp message
    const seatLines = selectedSeats.map(s => `  • Seat No. ${s} - ${getSeatLabel(s)}`).join('%0A');
    const waMsg = `🚐 *SIAHA SUMO - BOOKING CONFIRMED*%0A%0A`+
`🆔 *Booking ID:* ${bookingId}%0A`+
`🚐 *Sumo ID:* ${selectedSumo.id} - ${selectedSumo.driver}%0A`+
`📍 *Route:* ${selectedSumo.route}%0A`+
`📅 *Date:* ${selectedSumo.date} | Time ${selectedSumo.time}%0A%0A`+
`💺 *SEAT DETAILS:*%0A`+
`${seatLines}%0A`+
`Visual: ${seatVisual}%0A%0A`+
`💰 *Total:* Rs.${total} (${selectedSeats.length} x ${selectedSumo.price})%0A%0A`+
`👤 *Passenger:* ${name}%0A`+
`📱 *Phone:* ${phone}%0A`+
`🏦 *UTR:* ${utr}%0A%0A`+
`✅ *Please confirm!*%0A`+
`Siaha One Stop Solution`;

    window.open(`https://wa.me/919362600601?text=${waMsg}`, '_blank');
    alert(`✅ Booking Sent! ID: ${bookingId}\nSeats: ${seatDetails}`);
    setSelectedSeats([]); setShowPayment(false); setUtr('');
  };

  const handleAdminLogin = () => {
    if(adminPass==='9362' || adminPass==='admin'){ setIsAdmin(true); setView('admin'); } else alert('Password dik lo! (9362)');
  };

  const addSumo = () => {
    if(!newSumo.driver){ alert('Driver name / Vehicle no dah rawh!'); return; }
    const id = 'SUMO' + Math.floor(100+Math.random()*900);
    setSumos([...sumos, {id, ...newSumo, bookedSeats:[]}]);
    setNewSumo({route:'Saiha → Aizawl', date:new Date().toISOString().split('T')[0], time:'6:00 AM', driver:'', price:1500, totalSeats:10});
    alert('Sumo Added!');
  };

  const deleteSumo = (id:string) => {
    if(confirm('Delete this Sumo?')) setSumos(sumos.filter(s=>s.id!==id));
  };

  const clearSeats = (id:string) => {
    if(confirm('Clear all booked seats?')) setSumos(sumos.map(s=> s.id===id ? {...s, bookedSeats:[]} : s));
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] font-sans">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap'); *{font-family:'Plus Jakarta Sans',sans-serif}`}</style>
      
      <div className="bg-[#0a0e1f] text-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-5 py-4 flex justify-between items-center">
          <div className="flex gap-3 items-center cursor-pointer" onClick={()=>setView('user')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl">🚐</div>
            <div><p className="font-extrabold leading-none">SIAHA SUMO</p><p className="text-[10px] tracking-[0.2em] text-blue-300">ONE STOP SOLUTION</p></div>
          </div>
          <div className="flex items-center gap-3">
            {view==='user' && <button onClick={()=>{ if(isDemo){ setIsDemo(false); setName(''); setPhone(''); setSelectedSeats([]);} else { setIsDemo(true); setName('Demo Client'); setPhone('9876543210'); setSelectedSeats([2,3]); setUtr('123456789012'); } }} className={`px-4 py-1.5 rounded-full text-xs font-extrabold border ${isDemo ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-white/10 text-white border-white/20'}`}>{isDemo ? '● DEMO ON' : '○ DEMO'}</button>}
            <button onClick={()=> setView(view==='admin'?'user':'admin')} className="px-4 py-1.5 rounded-full text-xs font-bold bg-blue-600 text-white">{view==='admin'?'👁️ User View':'🔧 Admin'}</button>
          </div>
        </div>
      </div>

      {view==='user' ? (
        <>
          <div className="relative bg-[#0a0e1f] pb-24">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 opacity-90"></div>
            <div className="relative max-w-6xl mx-auto px-5 pt-10 pb-6">
              <h1 className="text-[32px] md:text-[44px] font-extrabold text-white leading-[0.9]">Saiha <span className="text-blue-200">↔</span> Aizawl<br/><span className="text-white/60 text-[20px] font-medium">Select Sumo • Choose Seat • Pay</span></h1>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-5 -mt-16 relative z-10 grid md:grid-cols-[1.3fr_0.7fr] gap-5">
            <div className="bg-white rounded-[24px] shadow-xl p-6 md:p-7">
              <p className="text-[11px] font-bold tracking-widest text-gray-400 mb-3">SELECT SUMO (Available)</p>
              <div className="space-y-3 mb-6">
                {sumos.map(s=>(
                  <button key={s.id} onClick={()=>{ setSelectedSumoId(s.id); setSelectedSeats([]); }} className={`w-full p-4 rounded-2xl border-2 text-left flex justify-between items-center ${selectedSumoId===s.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                    <div><p className="font-extrabold text-sm">{s.route} • {s.time}</p><p className="text-xs text-gray-500">{s.id} | {s.driver} | {s.date}</p></div>
                    <div className="text-right"><p className={`text-xs px-2 py-1 rounded-full font-bold ${s.totalSeats - s.bookedSeats.length <=2 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{s.totalSeats - s.bookedSeats.length} seats left</p><p className="text-[11px] mt-1">₹{s.price}</p></div>
                  </button>
                ))}
              </div>

              <p className="text-[11px] font-bold tracking-widest text-gray-400 mb-3">SEAT MAP - {selectedSumo.id} {selectedSumo.driver}</p>
              <div className="bg-[#f8f9fc] rounded-[20px] p-5 border">
                <div className="flex justify-between text-[10px] text-gray-400 mb-3"><span>FRONT - Driver</span><span>{selectedSumo.bookedSeats.length}/{selectedSumo.totalSeats} Booked</span></div>
                <div className="flex gap-3 mb-3"><div className="w-14 h-12 rounded-xl bg-gray-800 text-white flex items-center justify-center text-[10px] font-bold">DRIVER</div>
                  {[1,2].map(n=>{ const booked = selectedSumo.bookedSeats.includes(n); return <button disabled={booked} key={n} onClick={()=>toggleSeat(n)} className={`flex-1 h-12 rounded-xl font-extrabold ${booked ? 'bg-red-100 text-red-300 border' : selectedSeats.includes(n) ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border'}`}>{booked ? 'X' : n}</button>})}
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[3,4,5].map(n=>{ const booked = selectedSumo.bookedSeats.includes(n); return <button disabled={booked} key={n} onClick={()=>toggleSeat(n)} className={`h-12 rounded-xl font-extrabold ${booked ? 'bg-red-100 text-red-300' : selectedSeats.includes(n) ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border'}`}>{booked ? 'X' : n}</button>})}
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {[6,7,8,9,10].map(n=>{ const booked = selectedSumo.bookedSeats.includes(n); return <button disabled={booked} key={n} onClick={()=>toggleSeat(n)} className={`h-12 rounded-xl font-extrabold ${booked ? 'bg-red-100 text-red-300' : selectedSeats.includes(n) ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border'}`}>{booked ? 'X' : n}</button>})}
                </div>
              </div>

              {selectedSeats.length>0 && (
                <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <p className="text-xs opacity-80">Selected: {selectedSeats.map(s=>`Seat ${s} (${getSeatLabel(s)})`).join(', ')}</p>
                  <div className="flex justify-between items-center mt-1"><p className="font-bold">Total {selectedSeats.length} seat</p><p className="text-2xl font-extrabold">₹{selectedSeats.length*selectedSumo.price}</p></div>
                </div>
              )}

              <div className="mt-6 grid gap-3">
                <input placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} className="w-full p-3.5 rounded-2xl bg-gray-50 border font-medium"/>
                <input placeholder="WhatsApp Number" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full p-3.5 rounded-2xl bg-gray-50 border font-medium"/>
                {!showPayment ? (
                  <button disabled={selectedSeats.length===0||!name||!phone} onClick={()=>setShowPayment(true)} className={`w-full p-4 rounded-2xl font-extrabold ${selectedSeats.length&&name&&phone ? 'bg-[#0a0e1f] text-white' : 'bg-gray-100 text-gray-400'}`}>Continue to Pay → ₹{selectedSeats.length*selectedSumo.price}</button>
                ) : (
                  <div className="rounded-[20px] border-2 border-blue-100 bg-blue-50/50 p-5">
                    <p className="font-extrabold mb-3">💳 UPI - ₹{selectedSeats.length*selectedSumo.price}</p>
                    <div className="bg-white rounded-2xl p-3 flex gap-3 items-center border"><div className="w-16 h-16 bg-black rounded-xl text-white text-[7px] flex items-center justify-center text-center">QR<br/>GPay PhonePe</div><div><p className="font-bold text-sm">9362600601@ybl <button onClick={()=>{ navigator.clipboard.writeText('9362600601@ybl'); setCopied(true); setTimeout(()=>setCopied(false),2000); }} className="ml-2 text-xs bg-black text-white px-2 py-0.5 rounded-full">{copied?'Copied!':'Copy'}</button></p><p className="text-xs">Hlimi Mami • Seats: {selectedSeats.join(', ')}</p></div></div>
                    <input placeholder="UTR / Transaction ID" value={utr} onChange={e=>setUtr(e.target.value)} className="w-full mt-3 p-3.5 rounded-2xl bg-white border font-bold"/>
                    <button onClick={handleBooking} className="w-full mt-3 p-4 rounded-2xl bg-green-600 text-white font-extrabold">✅ Confirm & Send to Admin</button>
                    <button onClick={()=>setShowPayment(false)} className="w-full mt-2 text-sm text-gray-500">Back</button>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-[24px] p-6 shadow"><h3 className="font-extrabold mb-3">Sumo Info</h3><p className="text-sm"><b>{selectedSumo.id}</b><br/>{selectedSumo.route}<br/>Date: {selectedSumo.date}<br/>Time: {selectedSumo.time}<br/>Driver: {selectedSumo.driver}</p></div>
              <div className="bg-[#0a0e1f] rounded-[24px] p-5 text-white text-sm"><p className="font-bold mb-2">📱 Contact</p><p>Siaha Bazar Counter<br/>9362600601 - Hlimi</p></div>
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-6xl mx-auto px-5 py-8">
          {!isAdmin ? (
            <div className="max-w-sm mx-auto bg-white rounded-[24px] p-8 shadow-xl mt-10">
              <h2 className="text-2xl font-extrabold mb-2">🔐 Admin Login</h2><p className="text-sm text-gray-500 mb-5">Sumo add/delete na</p>
              <input type="password" placeholder="Password (9362)" value={adminPass} onChange={e=>setAdminPass(e.target.value)} className="w-full p-3.5 rounded-2xl bg-gray-50 border mb-3"/>
              <button onClick={handleAdminLogin} className="w-full p-4 rounded-2xl bg-[#0a0e1f] text-white font-bold">Login</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-[24px] p-6 shadow">
                <h3 className="font-extrabold text-lg mb-4">➕ Add New Sumo</h3>
                <div className="space-y-3">
                  <select value={newSumo.route} onChange={e=>setNewSumo({...newSumo, route:e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 border"><option>Saiha → Aizawl</option><option>Aizawl → Saiha</option></select>
                  <input type="date" value={newSumo.date} onChange={e=>setNewSumo({...newSumo, date:e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 border"/>
                  <input placeholder="Time - e.g. 6:00 AM" value={newSumo.time} onChange={e=>setNewSumo({...newSumo, time:e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 border"/>
                  <input placeholder="Driver Name & Vehicle No - e.g. Hlimi MZ01-9999" value={newSumo.driver} onChange={e=>setNewSumo({...newSumo, driver:e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 border"/>
                  <div className="grid grid-cols-2 gap-3"><input type="number" placeholder="Price" value={newSumo.price} onChange={e=>setNewSumo({...newSumo, price:parseInt(e.target.value)||0})} className="w-full p-3 rounded-xl bg-gray-50 border"/><input type="number" placeholder="Seats" value={newSumo.totalSeats} onChange={e=>setNewSumo({...newSumo, totalSeats:parseInt(e.target.value)||10})} className="w-full p-3 rounded-xl bg-gray-50 border"/></div>
                  <button onClick={addSumo} className="w-full p-4 rounded-2xl bg-blue-600 text-white font-extrabold">Add Sumo</button>
                </div>
              </div>
              <div className="bg-white rounded-[24px] p-6 shadow">
                <h3 className="font-extrabold text-lg mb-4">📋 All Sumos ({sumos.length})</h3>
                <div className="space-y-3 max-h-[600px] overflow-auto">
                  {sumos.map(s=>(
                    <div key={s.id} className="p-4 rounded-2xl bg-gray-50 border flex justify-between">
                      <div className="text-sm"><p className="font-bold">{s.id} - {s.route}</p><p className="text-xs text-gray-500">{s.date} | {s.time} | {s.driver}</p><p className="text-xs mt-1">Booked: {s.bookedSeats.length>0 ? s.bookedSeats.map(n=>`Seat ${n}`).join(', ') : 'None'} | ₹{s.price}</p></div>
                      <div className="flex flex-col gap-1"><button onClick={()=>clearSeats(s.id)} className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold">Clear Seats</button><button onClick={()=>deleteSumo(s.id)} className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">Delete</button></div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>{ setIsAdmin(false); setView('user'); }} className="w-full mt-4 p-3 rounded-xl bg-gray-900 text-white text-sm">Logout Admin</button>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="text-center py-10 text-xs text-gray-400">© Siaha One Stop Solution • Admin: password 9362</div>
    </div>
  );
}
