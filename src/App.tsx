import React, { useState, useEffect, useRef } from "react";
import {
  Bus,
  QrCode,
  MessageCircle,
  Check,
  Smartphone,
  Copy,
  Settings,
  MapPin,
  Clock,
  Users,
  Zap,
  X,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Phone,
  User,
  Armchair,
  ScanLine,
  PartyPopper,
  Ticket,
  Edit3,
  Plus,
  Trash2,
  Navigation,
} from "lucide-react";

// Types
type Sumo = {
  id: string;
  time: string;
  from: string;
  to: string;
  driver: string;
  fare: number;
  occupied: number[]; // seat numbers
  status: "filling" | "full" | "departed";
};

type Booking = {
  id: string;
  sumoId: string;
  name: string;
  phone: string;
  seats: number[];
  total: number;
  time: string;
  utr: string;
};

// Initial Data
const INITIAL_SUMOS: Sumo[] = [
  { id: "SA-06-01", time: "06:00 AM", from: "Saiha", to: "Aizawl", driver: "K. Beihmo", fare: 700, occupied: [2, 5, 9], status: "filling" },
  { id: "SA-08-30", time: "08:30 AM", from: "Saiha", to: "Aizawl", driver: "Lalruata", fare: 700, occupied: [1, 2, 3, 4, 10], status: "filling" },
  { id: "SA-13-00", time: "01:00 PM", from: "Aizawl", to: "Saiha", driver: "Vanlala", fare: 700, occupied: [7], status: "filling" },
  { id: "SA-15-30", time: "03:30 PM", from: "Saiha", to: "Aizawl", driver: "Zoramthara", fare: 750, occupied: [1,2,3,4,5,6,7,8,9], status: "full" },
];

const SEAT_ROWS = [[1, 2], [3, 4, 5], [6, 7, 8], [9, 10]];

export default function App() {
  // Config - editable
  const [upiId, setUpiId] = useState("doctorazyu@oksbi");
  const [whatsappNo, setWhatsappNo] = useState("919362600601");
  const [demoMode, setDemoMode] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [copied, setCopied] = useState(false);

  // Data
  const [sumos, setSumos] = useState<Sumo[]>(INITIAL_SUMOS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedSumo, setSelectedSumo] = useState<Sumo>(INITIAL_SUMOS[0]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"list" | "seats" | "details" | "pay" | "whatsapp" | "ticket">("list");
  const [payState, setPayState] = useState<"idle" | "scanning" | "paying" | "success">("idle");
  const [utr, setUtr] = useState("");
  const [currentBookingId, setCurrentBookingId] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const payRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const total = selectedSeats.length * selectedSumo.fare;
  const upiLink = `upi://pay?pa=${upiId}&pn=SaihaSumo&am=${total}&cu=INR&tn=Booking-${selectedSumo.id}`;

  const handleSeatToggle = (n: number) => {
    if (selectedSumo.occupied.includes(n)) return;
    setSelectedSeats((prev) => (prev.includes(n) ? prev.filter((s) => s !== n) : [...prev, n].slice(0, 4)));
  };

  const startDemoPay = () => {
    if (!demoMode) return;
    setPayState("scanning");
    setTimeout(() => {
      setPayState("paying");
      setTimeout(() => {
        const fakeUtr = "42" + Math.floor(1000000000 + Math.random() * 9000000000).toString();
        setUtr(fakeUtr);
        setPayState("success");
        // auto whatsapp preview
        setTimeout(() => {
          const newId = "B-" + Math.floor(1000 + Math.random() * 9000);
          setCurrentBookingId(newId);
          const newBooking: Booking = {
            id: newId,
            sumoId: selectedSumo.id,
            name: name || "Lalruata",
            phone: phone || "9362600601",
            seats: selectedSeats,
            total,
            time: selectedSumo.time,
            utr: fakeUtr,
          };
          setBookings((b) => [newBooking, ...b]);
          setStep("whatsapp");
          setTimeout(() => setStep("ticket"), 2800);
        }, 1200);
      }, 1100);
    }, 1500);
  };

  const handleLiveConfirm = () => {
    const newId = "B-" + Math.floor(1000 + Math.random() * 9000);
    const fakeUtr = "LIVE" + Math.floor(100000 + Math.random() * 900000);
    setCurrentBookingId(newId);
    setUtr(fakeUtr);
    const newBooking: Booking = {
      id: newId,
      sumoId: selectedSumo.id,
      name,
      phone,
      seats: selectedSeats,
      total,
      time: selectedSumo.time,
      utr: fakeUtr,
    };
    setBookings((b) => [newBooking, ...b]);
    setStep("ticket");
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reset flow
  const resetFlow = () => {
    setSelectedSeats([]);
    setName("");
    setPhone("");
    setStep("list");
    setPayState("idle");
    setUtr("");
    setCurrentBookingId("");
  };

  return (
    <div className="min-h-screen w-full bg-[#0B1E3A] text-white selection:bg-white/20" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes scan { 0% { top: 0% } 50% { top: 100% } 100% { top: 0% } }
        @keyframes beep { 0%,100% { opacity:0.3 } 50% { opacity:1 } }
        @keyframes float { 0%,100% { transform: translateY(0)} 50% { transform: translateY(-6px)} }
        @keyframes confettiFall { 0% { transform: translateY(-20vh) rotate(0deg) } 100% { transform: translateY(110vh) rotate(720deg) } }
        .glass { background: rgba(255,255,255,0.08); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.12); }
        .glass-strong { background: rgba(255,255,255,0.11); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.16); }
        .glass-white { background: rgba(255,255,255,0.92); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.8); color:#0B1E3A }
        .scan-line { animation: scan 2s ease-in-out infinite; }
        .beep-dot { animation: beep 0.6s ease-in-out infinite; }
      `}</style>

      {/* Top Demo Banner */}
      {demoMode && (
        <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#0B1E3A] px-3 py-2 flex items-center justify-center gap-2 text-[11px] md:text-xs font-bold tracking-wide">
          <Zap className="w-4 h-4" />
          <span className="uppercase">Demo Mode ON:</span>
          <span className="font-semibold">Scan QR → Auto WhatsApp → Ticket</span>
          <span className="hidden md:inline opacity-70">• Kan lawm e! Tluang takin!</span>
          <button onClick={() => setDemoMode(false)} className="ml-3 bg-[#0B1E3A] text-white px-2.5 py-1 rounded-full text-[10px]">Switch to Live</button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 md:top-0 z-40 border-b border-white/10 bg-[#0B1E3A]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1180px] px-4 md:px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-[#0B1E3A] flex items-center justify-center shadow-lg">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-[16px] leading-none tracking-tight">SAIHA ↔ AIZAWL</h1>
                <span className="hidden md:inline-flex items-center gap-1 bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full text-[10px] font-bold">SUMO BOOKING</span>
              </div>
              <p className="text-[11px] text-white/60 -mt-0.5">Chuan tur lo dah bawk rawh • Kan lawm e!</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 glass rounded-full px-3 py-1.5">
              <span className="text-[11px] text-white/70 font-medium">UPI:</span>
              <span className="text-[11px] font-mono font-bold">{upiId}</span>
              <button onClick={() => setShowConfig(true)} className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center"><Edit3 className="w-3 h-3" /></button>
            </div>

            <div className="flex items-center gap-2 glass rounded-full pl-2 pr-1 py-1">
              <span className={`text-[11px] font-bold ${demoMode ? "text-emerald-300" : "text-white/60"}`}>{demoMode ? "DEMO" : "LIVE"}</span>
              <button
                onClick={() => setDemoMode(!demoMode)}
                className={`relative w-[44px] h-[26px] rounded-full transition-all ${demoMode ? "bg-emerald-400" : "bg-white/20"}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${demoMode ? "left-[18px]" : "left-0.5"}`} />
              </button>
            </div>

            <button onClick={() => setShowAdmin(!showAdmin)} className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/15 transition">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-4 md:px-6 py-4 md:py-6 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-4 md:gap-6">
        {/* Left - Sumo List + Booking Flow */}
        <div className="space-y-4">
          {/* Config Modal Top (inline when needed) */}
          {showConfig && (
            <div className="glass-strong rounded-[18px] p-4 animate-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm flex items-center gap-2"><QrCode className="w-4 h-4" /> Edit UPI & WhatsApp</h3>
                <button onClick={() => setShowConfig(false)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-[11px] text-white/60 uppercase font-bold tracking-wider">UPI ID</span>
                  <input value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full h-11 rounded-xl bg-white text-[#0B1E3A] px-3 text-sm font-mono font-bold outline-none" />
                </label>
                <label className="space-y-1">
                  <span className="text-[11px] text-white/60 uppercase font-bold tracking-wider">WhatsApp Number (Admin)</span>
                  <input value={whatsappNo} onChange={(e) => setWhatsappNo(e.target.value)} className="w-full h-11 rounded-xl bg-white text-[#0B1E3A] px-3 text-sm font-mono font-bold outline-none" />
                </label>
              </div>
              <p className="mt-2 text-[11px] text-white/50">Hemi UPI ah hian pawisa a lut ang. WhatsApp-ah booking a lang nghal ang.</p>
            </div>
          )}

          {/* Sumo List */}
          {(step === "list" || step === "seats" || step === "details") && (
            <div className="glass-strong rounded-[22px] overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between border-b border-white/10">
                <h2 className="font-extrabold text-[15px] flex items-center gap-2"><Navigation className="w-4 h-4 text-cyan-300" /> Available Sumos Today</h2>
                <span className="text-[11px] bg-white/10 px-2.5 py-1 rounded-full">{sumos.filter(s=>s.status!=='departed').length} active</span>
              </div>

              <div className="p-3 space-y-2.5 max-h-[460px] overflow-auto">
                {sumos.map((s) => {
                  const free = 10 - s.occupied.length;
                  const isSelected = selectedSumo.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedSumo(s);
                        setSelectedSeats([]);
                        setStep("seats");
                      }}
                      className={`w-full text-left rounded-[16px] border px-4 py-3.5 flex items-center justify-between transition-all ${isSelected ? "bg-white text-[#0B1E3A] border-white shadow-xl scale-[1.01]" : "glass hover:bg-white/10 border-white/10"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? "bg-[#0B1E3A] text-white" : "bg-white/10"}`}>
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[14px]">{s.time}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${s.status==='full' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>{s.status}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[12px] opacity-80">
                            <MapPin className="w-3 h-3" /> {s.from} → {s.to} • {s.driver}
                          </div>
                          {/* seat dots */}
                          <div className="flex items-center gap-1 mt-1.5">
                            {Array.from({ length: 10 }).map((_, i) => {
                              const seatNo = i + 1;
                              const occ = s.occupied.includes(seatNo);
                              return <div key={i} className={`w-2.5 h-2.5 rounded-full ${occ ? "bg-red-400" : isSelected ? "bg-emerald-600" : "bg-emerald-400"} ${!occ ? "shadow-[0_0_6px_rgba(52,211,153,0.8)]" : ""}`} title={`Seat ${seatNo} ${occ ? "occupied" : "free"}`} />;
                            })}
                            <span className="ml-2 text-[11px] font-bold">{free} seats left</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-black text-[16px] ${isSelected ? "text-[#0B1E3A]" : "text-white"}`}>₹{s.fare}</div>
                        <div className={`text-[11px] flex items-center gap-1 ${isSelected ? "text-[#0B1E3A]/70" : "text-white/60"}`}><Users className="w-3 h-3" /> per seat</div>
                        <ChevronRight className={`w-4 h-4 mt-1 ml-auto ${isSelected ? "text-[#0B1E3A]" : "text-white/40"}`} />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="px-5 py-3 bg-white/[0.04] border-t border-white/10 flex items-center gap-2 text-[11px] text-white/60">
                <ShieldCheck className="w-4 h-4 text-emerald-300" /> Kan sumo te hi a him a, tluang taka kal thin a ni. • Seat map 2+3+3+2
              </div>
            </div>
          )}

          {/* Booking Steps */}
          {step !== "list" && (
            <div className="glass-strong rounded-[22px] overflow-hidden">
              {/* progress */}
              <div className="px-5 py-3 flex items-center gap-2 border-b border-white/10">
                {[
                  { k: "seats", l: "Seats" },
                  { k: "details", l: "Details" },
                  { k: "pay", l: "Pay" },
                  { k: "whatsapp", l: "WhatsApp" },
                  { k: "ticket", l: "Ticket" },
                ].map((s, i) => {
                  const active = ["seats", "details", "pay", "whatsapp", "ticket"].indexOf(step) >= i;
                  return (
                    <div key={s.k} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${active ? "bg-white text-[#0B1E3A]" : "bg-white/15 text-white/50"}`}>{i + 1}</div>
                      <span className={`text-[11px] font-bold tracking-wide ${active ? "text-white" : "text-white/40"}`}>{s.l}</span>
                      {i < 4 && <div className={`w-6 h-px ${active ? "bg-white/50" : "bg-white/15"} mx-1 hidden md:block`} />}
                    </div>
                  );
                })}
                <button onClick={resetFlow} className="ml-auto text-[11px] bg-white/10 px-2.5 py-1 rounded-full hover:bg-white/15">Reset</button>
              </div>

              {/* Seats */}
              {step === "seats" && (
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[15px]">Select Seats - {selectedSumo.id} • {selectedSumo.time}</h3>
                    <span className="text-xs bg-emerald-400 text-[#0B1E3A] px-2.5 py-1 rounded-full font-bold">{selectedSeats.length} selected</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-5">
                    <div className="glass rounded-[18px] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold tracking-wider opacity-60 uppercase flex items-center gap-1.5"><Armchair className="w-3.5 h-3.5" /> Front (Driver)</span>
                        <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full">{10 - selectedSumo.occupied.length} free</span>
                      </div>
                      <div className="space-y-3">
                        {SEAT_ROWS.map((row, rIdx) => (
                          <div key={rIdx} className="flex items-center justify-between">
                            <span className="text-[10px] text-white/30 w-6">R{rIdx + 1}</span>
                            <div className="flex gap-2">
                              {row.map((seatNo) => {
                                const occ = selectedSumo.occupied.includes(seatNo);
                                const sel = selectedSeats.includes(seatNo);
                                return (
                                  <button
                                    key={seatNo}
                                    disabled={occ}
                                    onClick={() => handleSeatToggle(seatNo)}
                                    className={`w-11 h-11 rounded-xl border-2 text-[13px] font-black transition-all flex items-center justify-center
                                      ${occ ? "bg-red-500/20 border-red-500/30 text-red-300 cursor-not-allowed" : sel ? "bg-white text-[#0B1E3A] border-white shadow-lg scale-105" : "glass border-white/15 hover:border-white/30 hover:bg-white/10"}`}
                                  >
                                    {seatNo}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="w-6" />
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-3 text-[11px]">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-400" /> Free</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-white" /> Selected</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500/50" /> Occupied</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="glass rounded-[16px] p-4">
                        <div className="text-[11px] uppercase tracking-wider font-bold opacity-60 mb-2">Summary</div>
                        <div className="flex justify-between text-sm"><span>{selectedSumo.from} → {selectedSumo.to}</span><span className="font-bold">{selectedSumo.time}</span></div>
                        <div className="flex justify-between text-sm mt-1"><span>Seats</span><span className="font-bold">{selectedSeats.length ? selectedSeats.join(", ") : "—"}</span></div>
                        <div className="flex justify-between text-sm mt-1"><span>Fare × {selectedSeats.length}</span><span className="font-bold">₹{total}</span></div>
                        <div className="h-px bg-white/10 my-3" />
                        <div className="flex justify-between font-black"><span>Total</span><span className="text-emerald-300">₹{total || selectedSumo.fare}</span></div>
                      </div>
                      <button
                        disabled={!selectedSeats.length}
                        onClick={() => setStep("details")}
                        className="w-full h-12 rounded-xl bg-white text-[#0B1E3A] font-extrabold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-white/90 transition"
                      >
                        Continue <ChevronRight className="w-4 h-4" />
                      </button>
                      <p className="text-[11px] text-white/50 text-center">Chuan tur 2 tal thlan tur • Max 4 seats</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Details */}
              {step === "details" && (
                <div className="p-5">
                  <h3 className="font-bold text-[15px] mb-4">Passenger Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 flex items-center gap-1"><User className="w-3 h-3" /> Hming / Name</span>
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Lalruata" className="w-full h-12 rounded-xl bg-white text-[#0B1E3A] px-4 text-[14px] font-semibold outline-none placeholder:text-black/30" />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</span>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9362600601" className="w-full h-12 rounded-xl bg-white text-[#0B1E3A] px-4 text-[14px] font-mono font-bold outline-none placeholder:text-black/30" />
                    </label>
                  </div>
                  <div className="mt-4 glass rounded-xl p-3 flex items-center gap-2 text-[12px]">
                    <MessageCircle className="w-4 h-4 text-emerald-300" />
                    <span className="text-white/70">WhatsApp-ah ticket a rawn thleng ang: <b className="text-white">{whatsappNo}</b> atangin</span>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button onClick={() => setStep("seats")} className="h-12 px-5 rounded-xl glass font-bold">Back</button>
                    <button disabled={!name || !phone} onClick={() => setStep("pay")} className="flex-1 h-12 rounded-xl bg-white text-[#0B1E3A] font-extrabold disabled:opacity-30 flex items-center justify-center gap-2">
                      <QrCode className="w-4 h-4" /> Pay ₹{total} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Pay */}
              {step === "pay" && (
                <div ref={payRef} className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-extrabold text-[15px] flex items-center gap-2"><QrCode className="w-4 h-4 text-cyan-300" /> Payment • ₹{total} to {upiId}</h3>
                    <button onClick={copyUpi} className="text-[11px] bg-white/10 px-2.5 py-1 rounded-full flex items-center gap-1.5 hover:bg-white/15">
                      <Copy className="w-3 h-3" /> {copied ? "Copied!" : upiId} 
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4">
                    {/* QR / UPI Buttons */}
                    <div className="glass rounded-[18px] p-4 flex flex-col items-center">
                      {/* Desktop QR */}
                      <div className={`${isMobile ? "hidden" : "flex"} md:flex w-full flex-col items-center`}>
                        <div className="relative w-[220px] h-[220px] bg-white rounded-[16px] p-3 shadow-xl overflow-hidden">
                          {/* Fake QR pattern */}
                          <div className="w-full h-full grid grid-cols-12 grid-rows-12 gap-[2px]">
                            {Array.from({ length: 144 }).map((_, i) => {
                              const isBorder = i < 12 || i >= 132 || i % 12 === 0 || i % 12 === 11;
                              const rnd = (i * 37) % 7;
                              return <div key={i} className={`rounded-[2px] ${rnd < 2 || isBorder ? "bg-[#0B1E3A]" : "bg-white"}`} />;
                            })}
                          </div>
                          {/* center logo */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 bg-[#0B1E3A] rounded-lg flex items-center justify-center text-white shadow-lg"><Bus className="w-5 h-5" /></div>
                          </div>
                          {/* scanning line */}
                          {payState === "scanning" && (
                            <div className="absolute left-3 right-3 h-[3px] bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)] scan-line">
                              <div className="absolute -top-1 -left-1 w-2 h-2 bg-emerald-400 rounded-full beep-dot" />
                            </div>
                          )}
                          {/* success overlay */}
                          {payState === "success" && (
                            <div className="absolute inset-0 bg-emerald-500/90 flex flex-col items-center justify-center text-white">
                              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-emerald-600 mb-2"><Check className="w-8 h-8" /></div>
                              <span className="font-black text-sm">Paid!</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 text-center">
                          <p className="text-[12px] font-bold">Scan with any UPI app</p>
                          <p className="text-[11px] text-white/50">GPay • PhonePe • Paytm • BHIM</p>
                        </div>
                      </div>

                      {/* Mobile UPI buttons - same phone fix */}
                      <div className={`${isMobile ? "flex" : "hidden"} md:hidden w-full flex-col gap-2.5`}>
                        <div className="w-full glass-strong rounded-xl p-3 text-center">
                          <p className="text-[11px] uppercase font-bold tracking-wider text-white/50">Same phone? Tap to pay</p>
                          <p className="text-[13px] font-mono font-bold mt-1">₹{total} → {upiId}</p>
                        </div>
                        <a href={upiLink} className="w-full h-14 rounded-xl bg-[#4285F4] text-white font-extrabold flex items-center justify-center gap-2 shadow-lg">
                          <span className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-[#4285F4] font-black text-[12px]">G</span> Pay with GPay
                        </a>
                        <a href={upiLink} className="w-full h-14 rounded-xl bg-[#5F259F] text-white font-extrabold flex items-center justify-center gap-2 shadow-lg">
                          <span className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-[#5F259F] font-black text-[10px]">Pe</span> Pay with PhonePe
                        </a>
                        <a href={upiLink} className="w-full h-12 rounded-xl bg-white text-[#0B1E3A] font-bold flex items-center justify-center gap-2">
                          <QrCode className="w-4 h-4" /> Other UPI Apps
                        </a>
                      </div>

                      {/* Desktop UPI buttons too */}
                      <div className="hidden md:flex w-full flex-col gap-2 mt-4">
                        <a href={upiLink} className="w-full h-11 rounded-xl glass hover:bg-white/15 font-bold text-[13px] flex items-center justify-center gap-2"><Smartphone className="w-4 h-4" /> Open UPI App (Desktop)</a>
                      </div>
                    </div>

                    {/* Action side */}
                    <div className="space-y-3">
                      {demoMode ? (
                        <>
                          <div className="glass rounded-[16px] p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-emerald-400 text-[#0B1E3A] flex items-center justify-center"><Zap className="w-4 h-4" /></div>
                              <div>
                                <div className="font-bold text-[13px]">Demo Pay Flow</div>
                                <div className="text-[11px] text-white/60">Client te hriat thiamna tur</div>
                              </div>
                            </div>
                            <div className="space-y-2 text-[12px]">
                              <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${payState !== "idle" ? "bg-emerald-400" : "bg-white/20"}`} /> Scan QR</div>
                              <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${payState === "paying" || payState === "success" ? "bg-emerald-400" : "bg-white/20"}`} /> Pay to {upiId}</div>
                              <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${payState === "success" ? "bg-emerald-400" : "bg-white/20"}`} /> Auto WhatsApp + Ticket</div>
                            </div>
                          </div>

                          {payState === "idle" && (
                            <button onClick={startDemoPay} className="w-full h-[56px] rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#0B1E3A] font-black text-[14px] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:scale-[1.02] transition">
                              <ScanLine className="w-5 h-5" /> SCAN & PAY (Demo) ₹{total}
                            </button>
                          )}
                          {payState === "scanning" && (
                            <div className="w-full h-[56px] rounded-xl bg-white/10 border border-white/20 flex items-center justify-center gap-3">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span className="font-bold text-[13px]">Scanning QR...</span>
                            </div>
                          )}
                          {payState === "paying" && (
                            <div className="w-full h-[56px] rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center gap-3">
                              <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                              <span className="font-bold text-[13px]">Paying ₹{total} to {upiId}...</span>
                            </div>
                          )}
                          {payState === "success" && (
                            <div className="w-full rounded-xl bg-emerald-400 text-[#0B1E3A] p-3 text-center relative overflow-hidden">
                              <div className="font-black text-[14px] flex items-center justify-center gap-2"><Check className="w-5 h-5" /> Payment Success!</div>
                              <div className="text-[11px] font-mono font-bold mt-1">UTR: {utr}</div>
                              <div className="text-[11px] mt-1">Kan lawm e! Tluang takin le!</div>
                              {/* confetti */}
                              <div className="absolute inset-0 pointer-events-none">
                                {Array.from({ length: 18 }).map((_, i) => (
                                  <div key={i} className="absolute w-1.5 h-1.5 rounded-full" style={{ left: `${(i * 7) % 100}%`, background: i % 2 ? "#0B1E3A" : "#fff", animation: `confettiFall ${0.8 + Math.random()}s linear forwards`, animationDelay: `${Math.random() * 0.4}s` }} />
                                ))}
                              </div>
                            </div>
                          )}

                          <button onClick={() => setStep("details")} className="w-full h-11 rounded-xl glass text-[12px] font-bold">← Edit Details</button>
                        </>
                      ) : (
                        <>
                          <div className="glass rounded-[16px] p-4">
                            <h4 className="font-bold text-[13px] mb-2">Live Mode - Real Payment</h4>
                            <p className="text-[12px] text-white/70">Scan QR or tap UPI button. After payment, click confirm.</p>
                            <div className="mt-3 p-2.5 rounded-lg bg-white text-[#0B1E3A] font-mono text-[12px] font-bold flex items-center justify-between">
                              <span>{upiId}</span>
                              <button onClick={copyUpi} className="text-[10px] bg-[#0B1E3A] text-white px-2 py-1 rounded-full">{copied ? "Copied" : "Copy"}</button>
                            </div>
                          </div>
                          <button onClick={handleLiveConfirm} className="w-full h-14 rounded-xl bg-white text-[#0B1E3A] font-black flex items-center justify-center gap-2">
                            <Check className="w-5 h-5" /> I Have Paid ₹{total}
                          </button>
                          <a href={`https://wa.me/${whatsappNo}?text=Hi, I paid ₹${total} for ${selectedSeats.length} seats ${selectedSumo.id}`} target="_blank" rel="noopener" className="w-full h-11 rounded-xl bg-[#25D366] text-white font-bold flex items-center justify-center gap-2">
                            <MessageCircle className="w-4 h-4" /> Send Screenshot on WhatsApp
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* WhatsApp Preview */}
              {step === "whatsapp" && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageCircle className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-[14px]">Auto WhatsApp • Kan lawm e!</h3>
                    <span className="ml-auto text-[10px] bg-emerald-400 text-[#0B1E3A] px-2 py-0.5 rounded-full font-black animate-pulse">LIVE PREVIEW</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Customer Phone */}
                    <div className="rounded-[22px] bg-[#0a0a0a] border-[6px] border-[#1a1a1a] overflow-hidden shadow-2xl">
                      <div className="h-7 bg-[#1a1a1a] flex items-center justify-center text-[10px] text-white/40">Customer • {phone || "93626 00601"}</div>
                      <div className="bg-[#E5DDD5] p-3 space-y-3 min-h-[280px]">
                        <div className="text-center text-[10px] text-black/40 bg-white/60 rounded-full px-2 py-1 w-fit mx-auto">Today, {new Date().toLocaleTimeString()}</div>
                        <div className="bg-white rounded-[14px] rounded-tl-[2px] p-3 shadow text-black">
                          <div className="flex items-center gap-2 mb-1"><Ticket className="w-4 h-4" /><span className="font-bold text-[12px]">Saiha Sumo - Ticket Confirmed</span></div>
                          <div className="text-[11px] leading-relaxed">
                            <b>{currentBookingId}</b> • {selectedSumo.time}<br />
                            {name || "Lalruata"} - Seats {selectedSeats.join(", ")}<br />
                            {selectedSumo.from} → {selectedSumo.to}<br />
                            Paid ₹{total} • UTR {utr.slice(0, 10)}<br />
                            <span className="text-emerald-600 font-bold">Kan lawm e! Tluang takin le!</span>
                          </div>
                          <div className="text-[9px] text-black/40 text-right mt-1">10:42 AM ✓✓</div>
                        </div>
                        <div className="bg-[#DCF8C6] rounded-[14px] rounded-tr-[2px] p-2.5 shadow text-black ml-auto max-w-[85%]">
                          <div className="text-[11px]">Ka lawm e! Ka lo kal ang.</div>
                          <div className="text-[9px] text-black/40 text-right">10:43 AM ✓✓</div>
                        </div>
                      </div>
                    </div>

                    {/* Admin WhatsApp */}
                    <div className="rounded-[22px] bg-[#0a0a0a] border-[6px] border-[#1a1a1a] overflow-hidden shadow-2xl">
                      <div className="h-7 bg-[#1a1a1a] flex items-center justify-between px-3 text-[10px] text-white/60">
                        <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center font-bold text-[10px]">A</span> Admin Sumo</span>
                        <span className="text-emerald-400">online</span>
                      </div>
                      <div className="bg-[#E5DDD5] p-3 space-y-3 min-h-[280px]">
                        <div className="text-center text-[10px] text-black/40 bg-[#25D366]/20 rounded-full px-2 py-1 w-fit mx-auto">New booking notification</div>
                        <div className="bg-white rounded-[14px] rounded-tl-[2px] p-3 shadow text-black border-l-4 border-emerald-500">
                          <div className="font-black text-[11px] text-emerald-600 flex items-center gap-1"><Sparkles className="w-3 h-3" /> NEW BOOKING</div>
                          <div className="text-[11px] leading-relaxed mt-1">
                            <b>{name || "Lalruata"}</b> • {phone || "9362600601"}<br />
                            {selectedSeats.length} seats: {selectedSeats.join(", ")} • {selectedSumo.from}→{selectedSumo.to}<br />
                            ₹{total} • UPI Paid ✓ UTR {utr.slice(0, 8)}<br />
                            Sumo {selectedSumo.id} • {selectedSumo.time}<br />
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold">PAID</span>
                            <span className="text-[9px] bg-[#0B1E3A] text-white px-1.5 py-0.5 rounded-full">{currentBookingId}</span>
                            <span className="ml-auto text-[9px] text-black/40">10:42 AM ✓✓ Read</span>
                          </div>
                        </div>
                        <div className="bg-[#111] rounded-xl p-2 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white"><Phone className="w-4 h-4" /></div>
                          <div className="text-[10px] text-white"><div className="font-bold">Call Customer</div><div className="opacity-60">{phone || "9362600601"}</div></div>
                          <div className="ml-auto w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <div className="inline-flex items-center gap-2 text-[11px] text-white/60 bg-white/10 px-3 py-1.5 rounded-full">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" /> Auto sending to {whatsappNo} via WhatsApp API • Kan lawm e!
                    </div>
                  </div>
                </div>
              )}

              {/* Ticket */}
              {step === "ticket" && (
                <div className="p-5 flex flex-col items-center">
                  <div className="w-full max-w-[360px] bg-white text-[#0B1E3A] rounded-[20px] overflow-hidden shadow-2xl">
                    <div className="bg-[#123B6D] text-white p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2"><Bus className="w-5 h-5" /><span className="font-black text-[13px]">SAIHA SUMO</span></div>
                      <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full font-bold">{currentBookingId}</span>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[11px] opacity-60 uppercase font-bold tracking-wider">Passenger</div>
                          <div className="font-black text-[15px]">{name || "Lalruata"}</div>
                          <div className="text-[12px] font-mono">{phone || "9362600601"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] opacity-60 uppercase font-bold">Time</div>
                          <div className="font-black">{selectedSumo.time}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-[#F1F5F9] rounded-xl p-2.5">
                          <div className="text-[10px] opacity-60 uppercase font-bold">Route</div>
                          <div className="font-bold text-[13px]">{selectedSumo.from} → {selectedSumo.to}</div>
                          <div className="text-[11px]">{selectedSumo.id}</div>
                        </div>
                        <div className="bg-[#F1F5F9] rounded-xl p-2.5">
                          <div className="text-[10px] opacity-60 uppercase font-bold">Seats • ₹{total}</div>
                          <div className="font-black text-[18px]">{selectedSeats.join(", ")}</div>
                          <div className="text-[10px]">UTR {utr.slice(0, 12)}</div>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-center">
                        <div className="w-[140px] h-[140px] bg-[#0B1E3A] rounded-xl p-2 grid grid-cols-8 gap-[2px]">
                          {Array.from({ length: 64 }).map((_, i) => <div key={i} className={`${(i * 13) % 3 ? "bg-white" : "bg-[#0B1E3A]"} rounded-[1px]`} />)}
                        </div>
                      </div>
                      <div className="text-center mt-3">
                        <div className="font-black text-[13px]">Kan lawm e! Tluang takin le!</div>
                        <div className="text-[11px] opacity-60">Show this at boarding • Counter Saiha</div>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-[#F1F5F9] flex items-center justify-between text-[10px] font-bold">
                      <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Paid via {upiId}</span>
                      <span>✓ Verified</span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 w-full max-w-[360px]">
                    <a href={`https://wa.me/${whatsappNo}?text=Ticket%20${currentBookingId}%20Confirmed`} target="_blank" rel="noopener" className="flex-1 h-11 rounded-xl bg-[#25D366] text-white font-bold flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" /> WhatsApp Admin
                    </a>
                    <button onClick={resetFlow} className="flex-1 h-11 rounded-xl bg-white text-[#0B1E3A] font-bold">New Booking</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right - Info + Admin */}
        <div className="space-y-4">
          {/* Quick stats */}
          <div className="glass-strong rounded-[20px] p-4">
            <h3 className="font-bold text-[13px] mb-3 flex items-center gap-2"><PartyPopper className="w-4 h-4 text-amber-300" /> Demo Ready - 30 Sec Flow</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="glass rounded-xl p-2.5 text-center"><div className="text-[18px] font-black">{sumos.length}</div><div className="text-[10px] opacity-60">Sumos</div></div>
              <div className="glass rounded-xl p-2.5 text-center"><div className="text-[18px] font-black">{bookings.length}</div><div className="text-[10px] opacity-60">Bookings</div></div>
              <div className="glass rounded-xl p-2.5 text-center"><div className="text-[18px] font-black">₹{bookings.reduce((a,b)=>a+b.total,0) || 1400}</div><div className="text-[10px] opacity-60">Today</div></div>
            </div>
            <div className="mt-3 space-y-1.5 text-[11px] text-white/70">
              <div className="flex gap-2"><span className="w-5 h-5 rounded-full bg-white text-[#0B1E3A] flex items-center justify-center font-bold text-[10px]">1</span> Select seats → dots show availability</div>
              <div className="flex gap-2"><span className="w-5 h-5 rounded-full bg-white text-[#0B1E3A] flex items-center justify-center font-bold text-[10px]">2</span> Enter hming & phone</div>
              <div className="flex gap-2"><span className="w-5 h-5 rounded-full bg-white text-[#0B1E3A] flex items-center justify-center font-bold text-[10px]">3</span> Scan QR → UPI {upiId}</div>
              <div className="flex gap-2"><span className="w-5 h-5 rounded-full bg-emerald-400 text-[#0B1E3A] flex items-center justify-center font-bold text-[10px]">✓</span> Auto WhatsApp → Ticket</div>
            </div>
          </div>

          {/* Admin Panel */}
          {showAdmin && (
            <div className="glass-strong rounded-[20px] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[13px] flex items-center gap-2"><Settings className="w-4 h-4" /> Admin - Edit Config</h3>
                <button onClick={() => setShowAdmin(false)} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><X className="w-3 h-3" /></button>
              </div>

              <div className="space-y-3">
                <label className="block space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">UPI ID (pawisa luhna)</span>
                  <div className="flex gap-2">
                    <input value={upiId} onChange={(e) => setUpiId(e.target.value)} className="flex-1 h-10 rounded-xl bg-white text-[#0B1E3A] px-3 text-[13px] font-mono font-bold outline-none" />
                    <button onClick={copyUpi} className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center"><Copy className="w-4 h-4" /></button>
                  </div>
                </label>
                <label className="block space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">WhatsApp Admin No</span>
                  <input value={whatsappNo} onChange={(e) => setWhatsappNo(e.target.value)} className="flex-1 w-full h-10 rounded-xl bg-white text-[#0B1E3A] px-3 text-[13px] font-mono font-bold outline-none" />
                </label>

                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Manage Sumos</span>
                    <button onClick={() => {
                      const id = `SA-${Math.floor(Math.random()*24).toString().padStart(2,"0")}-${Math.floor(Math.random()*60).toString().padStart(2,"0")}`;
                      setSumos([...sumos, { id, time: "07:30 AM", from: "Saiha", to: "Aizawl", driver: "New Driver", fare: 700, occupied: [], status: "filling" }]);
                    }} className="text-[11px] bg-white text-[#0B1E3A] px-2.5 py-1 rounded-full font-bold flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-auto pr-1">
                    {sumos.map((s) => (
                      <div key={s.id} className="glass rounded-xl p-2.5 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[12px]">{s.id} • {s.time}</div>
                          <div className="text-[11px] opacity-60">₹{s.fare} • {s.driver} • {10 - s.occupied.length} free</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => {
                            const newFare = prompt("New fare?", s.fare.toString());
                            if (newFare) setSumos(sumos.map(x => x.id===s.id ? {...x, fare: parseInt(newFare)||x.fare} : x));
                          }} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center"><Edit3 className="w-3 h-3" /></button>
                          <button onClick={() => setSumos(sumos.filter(x=>x.id!==s.id))} className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <div className="text-[11px] font-bold uppercase tracking-wider mb-2">Recent Bookings</div>
                  <div className="space-y-2 max-h-[160px] overflow-auto">
                    {bookings.length ? bookings.map((b) => (
                      <div key={b.id} className="glass rounded-xl p-2.5 text-[11px]">
                        <div className="flex justify-between font-bold"><span>{b.id}</span><span className="text-emerald-300">₹{b.total}</span></div>
                        <div className="opacity-70">{b.name} • Seats {b.seats.join(", ")} • {b.phone}</div>
                      </div>
                    )) : <div className="text-[11px] opacity-50 text-center py-4">No bookings yet • Demo pay tur lo dah rawh</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Language & help */}
          <div className="glass rounded-[20px] p-4">
            <h4 className="font-bold text-[13px] mb-2">Mizo + English Guide</h4>
            <div className="space-y-2 text-[11px] leading-relaxed text-white/70">
              <p><b className="text-white">Chuan tur lo dah bawk rawh</b> = Please add your luggage too</p>
              <p><b className="text-white">Kan lawm e! Tluang takin!</b> = Thank you! Have a safe journey!</p>
              <p><b className="text-white">Scan chiah</b> = Just scan the QR</p>
              <p><b className="text-white">WhatsApp a booking lang nghal tur</b> = Booking will show instantly on WhatsApp</p>
            </div>
            <div className="mt-3 p-2.5 rounded-xl bg-[#25D366]/20 border border-[#25D366]/30 text-[11px]">
              <span className="font-bold text-[#25D366]">WhatsApp Flow:</span> Customer pay → Admin ({whatsappNo}) hmuh nghal → Ticket auto thawn
            </div>
          </div>
        </div>
      </main>

      <footer className="mx-auto max-w-[1180px] px-6 py-6 text-center text-[11px] text-white/40">
        Saiha ↔ Aizawl Sumo • UPI: {upiId} • WhatsApp: {whatsappNo} • Dark Blue #123B6D • Plus Jakarta Sans • Demo-ready for clients
      </footer>
    </div>
  );
}
