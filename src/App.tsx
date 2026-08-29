// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  Bus, QrCode, MessageCircle, Check, Smartphone, Copy, Settings,
  MapPin, Clock, Users, X, ShieldCheck, Sparkles, Phone, User,
  Armchair, Ticket, Edit3, Plus, Trash2
} from "lucide-react";

type Sumo = {
  id: string; time: string; from: string; to: string;
  driver: string; fare: number; occupied: number[]; status: "filling"|"full";
};
type Booking = {
  id: string; sumoId: string; name: string; phone: string;
  seats: number[]; total: number; time: string; utr: string;
};

const INITIAL_SUMOS: Sumo[] = [
  { id: "SA-06-01", time: "06:00 AM", from: "Saiha", to: "Aizawl", driver: "K. Beihmo", fare: 700, occupied: [2,5,9], status: "filling" },
  { id: "SA-08-30", time: "08:30 AM", from: "Saiha", to: "Aizawl", driver: "Lalruata", fare: 700, occupied: [1,2,3], status: "filling" },
  { id: "SA-13-00", time: "01:00 PM", from: "Aizawl", to: "Saiha", driver: "Vanlala", fare: 700, occupied: [7], status: "filling" },
];

export default function App() {
  const [upiId, setUpiId] = useState("doctorazyu@oksbi");
  const [whatsappNo, setWhatsappNo] = useState("919362600601");
  const [demoMode, setDemoMode] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sumos, setSumos] = useState<Sumo[]>(INITIAL_SUMOS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedSumo, setSelectedSumo] = useState<Sumo>(INITIAL_SUMOS[0]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"list"|"seats"|"details"|"pay"|"whatsapp"|"ticket">("list");
  const [payState, setPayState] = useState<"idle"|"scanning"|"paying"|"success">("idle");
  const [utr, setUtr] = useState("");
  const [currentBookingId, setCurrentBookingId] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(()=>{
    const check=()=>setIsMobile(window.innerWidth<768);
    check(); window.addEventListener("resize", check);
    return ()=>window.removeEventListener("resize", check);
  },[]);

  const total = selectedSeats.length * selectedSumo.fare;
  const upiLink = `upi://pay?pa=${upiId}&pn=SaihaSumo&am=${total}&cu=INR&tn=Booking-${selectedSumo.id}`;
  const waText = `NEW BOOKING%0A${selectedSumo.from}->${selectedSumo.to}%0ASeats:${selectedSeats.join(",")}%0AAmount:₹${total}%0AName:${name}%0APhone:${phone}%0ABooking:${currentBookingId}%0AUTR:${utr}`;

  const handleSeatToggle=(n:number)=>{
    if(selectedSumo.occupied.includes(n)) return;
    setSelectedSeats(prev=> prev.includes(n) ? prev.filter(s=>s!==n) : [...prev,n].slice(0,4));
  };

  const startDemoPay=()=>{
    if(!demoMode){ handleLiveConfirm(); return; }
    setPayState("scanning");
    setTimeout(()=>{
      setPayState("paying");
      setTimeout(()=>{
        const fakeUtr="42"+Math.floor(1000000000+Math.random()*9000000000).toString();
        setUtr(fakeUtr);
        setPayState("success");
        setTimeout(()=>{
          const newId="B-"+Math.floor(1000+Math.random()*9000);
          setCurrentBookingId(newId);
          const newBooking: Booking={ id:newId, sumoId:selectedSumo.id, name:name||"Demo User", phone:phone||"9362600601", seats:selectedSeats, total, time:selectedSumo.time, utr:fakeUtr };
          setBookings(b=>[newBooking,...b]);
          setSumos(prev=> prev.map(s=> s.id===selectedSumo.id ? {...s, occupied:[...s.occupied,...selectedSeats]} : s));
          setStep("whatsapp");
          setTimeout(()=>setStep("ticket"),2500);
        },1000);
      },1100);
    },1400);
  };

  const handleLiveConfirm=()=>{
    const newId="B-"+Math.floor(1000+Math.random()*9000);
    const fakeUtr="LIVE"+Math.floor(100000+Math.random()*900000);
    setCurrentBookingId(newId); setUtr(fakeUtr);
    const newBooking: Booking={ id:newId, sumoId:selectedSumo.id, name, phone, seats:selectedSeats, total, time:selectedSumo.time, utr:fakeUtr };
    setBookings(b=>[newBooking,...b]);
    setSumos(prev=> prev.map(s=> s.id===selectedSumo.id ? {...s, occupied:[...s.occupied,...selectedSeats]} : s));
    setStep("ticket");
  };

  const copyUpi=()=>{ navigator.clipboard.writeText(upiId); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const resetFlow=()=>{ setSelectedSeats([]); setName(""); setPhone(""); setStep("list"); setPayState("idle"); setUtr(""); setCurrentBookingId(""); };

  return (
    <div className="min-h-screen bg-[#0B1E3A] text-white" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap'); @keyframes scan{0%{top:0%}50%{top:100%}100%{top:0%}} .glass{background:rgba(255,255,255,0.08);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.12)} .glass-strong{background:rgba(255,255,255,0.11);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.16)}`}</style>

      <header className="sticky top-0 z-30 glass border-b border-white/10">
        <div className="mx-auto max-w-[1180px] px-4 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-[#0B1E3A] grid place-items-center font-black"><Bus className="w-5 h-5"/></div>
            <div><div className="font-black leading-none">SUMO BOOKING</div><div className="text-[10px] opacity-60">Saiha ↔ Aizawl</div></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setDemoMode(!demoMode)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${demoMode?"bg-yellow-400 text-black":"bg-white/15"}`}>{demoMode?"DEMO ON":"LIVE"}</button>
            <button onClick={()=>setShowConfig(true)} className="w-8 h-8 rounded-full bg-white/10 grid place-items-center"><Settings className="w-4 h-4"/></button>
          </div>
        </div>
        {demoMode && <div className="bg-yellow-400 text-black text-center text-[11px] py-1 font-bold">Demo: Select Seat -> Scan QR / GPay -> Auto WhatsApp -> Ticket • Phone ah QR scan ngai lo!</div>}
      </header>

      <main className="mx-auto max-w-[1180px] px-4 py-4 grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
        <div className="space-y-3">
          {step==="list" && sumos.map(sumo=>{
            const left=10-sumo.occupied.length;
            return (
              <div key={sumo.id} className="glass rounded-[20px] p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2"><span className="font-black text-lg">{sumo.time}</span><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sumo.status==="full"?"bg-red-500":"bg-emerald-400 text-black"}`}>{left} seats left</span></div>
                    <div className="flex items-center gap-2 text-sm opacity-80"><MapPin className="w-3 h-3"/>{sumo.from} -> {sumo.to} • {sumo.driver}</div>
                  </div>
                  <div className="text-right"><div className="font-black text-xl">₹{sumo.fare}</div><div className="text-[10px] opacity-60">per seat</div></div>
                </div>
                <div className="mt-3 flex gap-1">{Array.from({length:10}).map((_,i)=>{ const n=i+1; const occ=sumo.occupied.includes(n); return <div key={n} className={`w-6 h-6 rounded-md grid place-items-center text-[9px] font-bold ${occ?"bg-white/20 opacity-40":"bg-emerald-400 text-black"}`}>{n}</div>})}</div>
                <button disabled={left===0} onClick={()=>{setSelectedSumo(sumo); setStep("seats");}} className="mt-3 w-full h-11 rounded-full bg-white text-[#0B1E3A] font-black disabled:opacity-30">BOOK NOW -></button>
              </div>
            )
          })}

          {step==="seats" && (
            <div className="glass-strong rounded-[24px] p-5">
              <div className="flex items-center justify-between mb-4"><h2 className="font-black text-lg flex items-center gap-2"><Armchair className="w-5 h-5"/> Seat thlang rawh - {selectedSumo.id}</h2><button onClick={()=>setStep("list")} className="w-8 h-8 rounded-full bg-white/10 grid place-items-center"><X className="w-4 h-4"/></button></div>
              <div className="grid grid-cols-4 gap-3 max-w-[280px] mx-auto">
                <div className="col-span-4 flex justify-between text-[10px] opacity-60 mb-1"><span>DRIVER</span><span>FRONT</span></div>
                <div className="h-12 rounded-xl bg-white/20 grid place-items-center text-[10px]">DRIVER</div><button onClick={()=>handleSeatToggle(1)} className={`h-12 rounded-xl font-bold border-2 ${selectedSumo.occupied.includes(1)?"bg-white/10 border-white/10 opacity-40": selectedSeats.includes(1)?"bg-white text-[#0B1E3A] border-white":"glass border-white/20"}`}>1</button><div className="col-span-2"></div>
                {[2,3,4].map(n=><button key={n} onClick={()=>handleSeatToggle(n)} className={`h-12 rounded-xl font-bold border-2 ${selectedSumo.occupied.includes(n)?"bg-white/10 border-white/10 opacity-40": selectedSeats.includes(n)?"bg-white text-[#0B1E3A] border-white":"glass border-white/20"}`}>{n}</button>)}
                {[5,6,7].map(n=><button key={n} onClick={()=>handleSeatToggle(n)} className={`h-12 rounded-xl font-bold border-2 ${selectedSumo.occupied.includes(n)?"bg-white/10 border-white/10 opacity-40": selectedSeats.includes(n)?"bg-white text-[#0B1E3A] border-white":"glass border-white/20"}`}>{n}</button>)}
                {[8,9,10].map(n=><button key={n} onClick={()=>handleSeatToggle(n)} className={`h-12 rounded-xl font-bold border-2 ${selectedSumo.occupied.includes(n)?"bg-white/10 border-white/10 opacity-40": selectedSeats.includes(n)?"bg-white text-[#0B1E3A] border-white":"glass border-white/20"}`}>{n}</button>)}
              </div>
              <div className="mt-5 flex items-center justify-between">
                <div className="text-sm">Seats: <b>{selectedSeats.length? selectedSeats.join(","):"—"}</b> • Total: <b>₹{total}</b></div>
                <button disabled={!selectedSeats.length} onClick={()=>setStep("details")} className="px-6 h-11 rounded-full bg-white text-[#0B1E3A] font-black disabled:opacity-30">Next -></button>
              </div>
            </div>
          )}

          {step==="details" && (
            <div className="glass-strong rounded-[24px] p-5">
              <h2 className="font-black mb-4">Passenger Details</h2>
              <div className="space-y-3">
                <div className="flex gap-2"><div className="flex-1 glass rounded-xl px-3 h-12 flex items-center gap-2"><User className="w-4 h-4 opacity-60"/><input value={name} onChange={e=>setName(e.target.value)} placeholder="Hming / Name" className="bg-transparent outline-none w-full text-sm"/></div></div>
                <div className="glass rounded-xl px-3 h-12 flex items-center gap-2"><Phone className="w-4 h-4 opacity-60"/><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone 9362600601" className="bg-transparent outline-none w-full text-sm"/></div>
                <div className="glass rounded-xl p-3 text-sm">Sumo: {selectedSumo.id} • {selectedSumo.from}->{selectedSumo.to} • Seats: {selectedSeats.join(",")} • ₹{total}</div>
                <button disabled={!name || !phone} onClick={()=>setStep("pay")} className="w-full h-12 rounded-full bg-white text-[#0B1E3A] font-black disabled:opacity-30">Proceed to Pay ₹{total}</button>
              </div>
            </div>
          )}

          {step==="pay" && (
            <div className="glass-strong rounded-[24px] p-5">
              <h2 className="font-black mb-3 flex items-center gap-2"><QrCode className="w-5 h-5"/> {demoMode?"Demo Pay":"UPI Pay"} - ₹{total} to {upiId}</h2>
              
              {!isMobile ? (
                <div className="relative mx-auto w-[220px] h-[220px] bg-white rounded-[20px] p-3">
                  <div className="w-full h-full bg-[#0B1E3A] rounded-xl grid grid-cols-6 gap-1 p-2">
                    {Array.from({length:36}).map((_,i)=><div key={i} className={`rounded-sm ${Math.random()>0.5?"bg-white":""}`}/>)}
                  </div>
                  {payState==="scanning" && <div className="absolute left-3 right-3 h-1 bg-emerald-400 shadow-[0_0_10px_#22c55e]" style={{animation:"scan 1.2s linear infinite"}}/>}
                  {payState==="success" && <div className="absolute inset-0 bg-emerald-500/90 rounded-[20px] grid place-items-center"><Check className="w-16 h-16 text-white"/></div>}
                </div>
              ) : (
                <div className="space-y-2">
                  <a href={upiLink} className="flex h-14 rounded-full bg-white text-[#0B1E3A] font-black items-center justify-center gap-2"> <Smartphone className="w-5 h-5"/> Pay with GPay / PhonePe - ₹{total}</a>
                  <button onClick={copyUpi} className="w-full h-12 rounded-full glass font-bold flex items-center justify-center gap-2"><Copy className="w-4 h-4"/> Copy UPI: {upiId} {copied?"✓":""}</button>
                  <div className="text-[11px] opacity-60 text-center">Mahni phone atangin QR scan ngai lo - GPay button hmet rawh!</div>
                </div>
              )}

              <div className="mt-4 space-y-2 text-center">
                {payState==="idle" && <button onClick={startDemoPay} className="w-full h-12 rounded-full bg-yellow-400 text-black font-black">{demoMode?"SCAN & PAY (Demo)":"I have Paid - Confirm"}</button>}
                {payState==="scanning" && <div className="text-sm font-bold text-emerald-300">Scanning QR... UPI {upiId}</div>}
                {payState==="paying" && <div className="text-sm font-bold text-yellow-300">Paying ₹{total} to {upiId}...</div>}
                {payState==="success" && <div className="text-sm font-bold text-emerald-300">✓ Payment Success! UTR: {utr}</div>}
              </div>
            </div>
          )}

          {step==="whatsapp" && (
            <div className="glass-strong rounded-[24px] p-5">
              <h2 className="font-black mb-3 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-[#25D366]"/> WhatsApp ah booking lang nghal!</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-[16px] p-3 text-black text-[12px]"><div className="font-bold text-[10px] opacity-60 mb-1">Customer SMS</div>Your ticket {currentBookingId} confirmed! {selectedSumo.from}->{selectedSumo.to} Seats {selectedSeats.join(",")} ₹{total} • Kan lawm e!</div>
                <div className="bg-[#0B3320] rounded-[16px] p-3 text-[12px] border border-[#25D366]/30"><div className="font-bold text-[10px] text-[#25D366] mb-1">Admin WhatsApp {whatsappNo}</div>🔥 NEW BOOKING<br/>{name} • {phone}<br/>{selectedSumo.from}->{selectedSumo.to} • {selectedSumo.id}<br/>Seats:{selectedSeats.join(",")} ₹{total}<br/>UTR:{utr}<br/>UPI:{upiId}</div>
              </div>
              <div className="mt-3 text-[11px] opacity-70 text-center">Client te hriat thiamna tur - Scan chiah WhatsApp a lut nghal!</div>
            </div>
          )}

          {step==="ticket" && (
            <div className="glass-strong rounded-[24px] p-5 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-400 text-black grid place-items-center mb-3"><Check className="w-8 h-8"/></div>
              <h2 className="font-black text-xl">Ticket Confirmed!</h2>
              <div className="mt-3 glass rounded-xl p-3 text-left text-sm space-y-1">
                <div className="flex justify-between"><span>Booking ID</span><b>{currentBookingId}</b></div>
                <div className="flex justify-between"><span>Sumo</span><b>{selectedSumo.id} {selectedSumo.time}</b></div>
                <div className="flex justify-between"><span>Route</span><b>{selectedSumo.from}->{selectedSumo.to}</b></div>
                <div className="flex justify-between"><span>Seats</span><b>{selectedSeats.join(",")}</b></div>
                <div className="flex justify-between"><span>Total</span><b>₹{total}</b></div>
                <div className="flex justify-between"><span>UTR</span><b className="font-mono text-[12px]">{utr}</b></div>
                <div className="flex justify-between"><span>UPI</span><b>{upiId}</b></div>
              </div>
              <div className="mt-3 p-2 rounded-xl bg-[#25D366]/20 text-[11px]">WhatsApp ah thawn tawh: {whatsappNo} • Kan lawm e! Tluang takin!</div>
              <button onClick={resetFlow} className="mt-4 w-full h-12 rounded-full bg-white text-[#0B1E3A] font-black">Book Another</button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass rounded-[20px] p-4">
            <div className="flex items-center gap-2 font-black text-sm mb-2"><Ticket className="w-4 h-4"/> Booking Summary</div>
            <div className="text-[13px] space-y-1 opacity-80">
              <div>Sumo: {selectedSumo.id} {selectedSumo.time}</div>
              <div>Seats selected: {selectedSeats.join(",")||"—"}</div>
              <div>Total: ₹{total}</div>
              <div>UPI: {upiId}</div>
              <div>WhatsApp: {whatsappNo}</div>
            </div>
          </div>

          <div className="glass-strong rounded-[20px] p-4">
            <div className="flex items-center justify-between mb-2"><h3 className="font-bold text-sm flex items-center gap-2"><Settings className="w-4 h-4"/> Admin</h3><button onClick={()=>setShowAdmin(!showAdmin)} className="text-[11px] bg-white/10 px-3 py-1 rounded-full">{showAdmin?"Hide":"Show"}</button></div>
            {showAdmin && (
              <div className="space-y-3">
                <label className="block"><span className="text-[11px] opacity-60">UPI ID</span><input value={upiId} onChange={e=>setUpiId(e.target.value)} className="w-full mt-1 h-10 rounded-xl bg-white text-[#0B1E3A] px-3 font-bold text-[13px]"/></label>
                <label className="block"><span className="text-[11px] opacity-60">WhatsApp No</span><input value={whatsappNo} onChange={e=>setWhatsappNo(e.target.value)} className="w-full mt-1 h-10 rounded-xl bg-white text-[#0B1E3A] px-3 font-bold text-[13px]"/></label>
                <div className="space-y-2 max-h-[200px] overflow-auto">
                  {sumos.map(s=><div key={s.id} className="glass rounded-xl p-2 flex justify-between text-[11px]"><span>{s.id} {s.from}->{s.to} ₹{s.fare} {10-s.occupied.length} left</span><button onClick={()=>setSumos(sumos.filter(x=>x.id!==s.id))} className="text-red-300"><Trash2 className="w-3 h-3"/></button></div>)}
                </div>
                <button onClick={()=>{const id=`SA-${Math.floor(Math.random()*24).toString().padStart(2,"0")}-${Math.floor(Math.random()*60).toString().padStart(2,"0")}`; setSumos([...sumos,{id,time:"07:30 AM",from:"Saiha",to:"Aizawl",driver:"New Driver",fare:700,occupied:[],status:"filling"}])}} className="w-full h-9 rounded-full bg-white/10 font-bold text-[11px] flex items-center justify-center gap-1"><Plus className="w-3 h-3"/> Add Sumo</button>
                <div className="pt-2 border-t border-white/10 text-[11px]"><div className="font-bold mb-1">Bookings {bookings.length}</div>{bookings.map(b=><div key={b.id} className="glass rounded-lg p-2 mb-1"><div className="flex justify-between"><span>{b.id}</span><span>₹{b.total}</span></div><div className="opacity-60">{b.name} S{b.seats.join(",")} {b.phone}</div></div>)}</div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showConfig && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md grid place-items-center p-4" onClick={()=>setShowConfig(false)}>
          <div className="glass-strong rounded-[24px] p-6 w-full max-w-md" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between mb-4"><h3 className="font-black">Edit UPI & WhatsApp</h3><button onClick={()=>setShowConfig(false)} className="w-8 h-8 rounded-full bg-white/10 grid place-items-center"><X className="w-4 h-4"/></button></div>
            <div className="space-y-3">
              <input value={upiId} onChange={e=>setUpiId(e.target.value)} className="w-full h-12 rounded-xl bg-white text-[#0B1E3A] px-4 font-bold"/>
              <input value={whatsappNo} onChange={e=>setWhatsappNo(e.target.value)} className="w-full h-12 rounded-xl bg-white text-[#0B1E3A] px-4 font-bold"/>
              <button onClick={()=>setShowConfig(false)} className="w-full h-12 rounded-full bg-white text-[#0B1E3A] font-black">Save</button>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center text-[11px] opacity-40 py-6">Saiha ↔ Aizawl • UPI:{upiId} • WA:{whatsappNo} • Seat Map + Demo Pay + WhatsApp Auto</footer>
    </div>
  );
}
