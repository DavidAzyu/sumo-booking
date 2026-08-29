import { useState, useMemo, useEffect } from "react";
import {
  Bus,
  MapPin,
  Calendar,
  Users,
  Clock,
  ArrowLeftRight,
  Snowflake,
  Zap,
  Droplets,
  Armchair,
  Phone,
  Search,
  X,
  Plus,
  Trash2,
  Check,
  Route,
  ShieldCheck,
  Timer,
  Star,
  QrCode,
  MessageCircle,
} from "lucide-react";

const CONFIG = {
  UPI_ID: "doctorazyu@oksbi",
  WHATSAPP_NUMBER: "919362600601",
  YOUR_NAME: "Saiha Sumo Service",
};

type Amenity = "AC" | "Charging" | "Pushback" | "Water";

type Sumo = {
  id: string;
  name: string;
  number: string;
  from: string;
  to: string;
  departure: string;
  duration: string;
  arrival: string;
  seatsTotal: number;
  seatsLeft: number;
  fare: number;
  amenities: Amenity[];
  rating: number;
  operator: string;
};

type Booking = {
  id: string;
  sumoId: string;
  sumoName: string;
  from: string;
  to: string;
  date: string;
  departure: string;
  passengers: number;
  farePerSeat: number;
  totalFare: number;
  customerName: string;
  phone: string;
  bookedAt: string;
  status: "Confirmed";
};

const initialSumos: Sumo[] = [
  {
    id: "s1",
    name: "Saiha Express - Super Luxury",
    number: "MZ02 C 4821",
    from: "Saiha",
    to: "Aizawl",
    departure: "05:30 AM",
    duration: "10h 30m",
    arrival: "04:00 PM",
    seatsTotal: 10,
    seatsLeft: 4,
    fare: 700,
    amenities: ["AC", "Charging", "Pushback", "Water"],
    rating: 4.8,
    operator: "Siahatla Sumo Service",
  },
  {
    id: "s2",
    name: "Zochhuanpui Sumo Service",
    number: "MZ06 A 1192",
    from: "Saiha",
    to: "Aizawl",
    departure: "06:00 AM",
    duration: "11h 00m",
    arrival: "05:00 PM",
    seatsTotal: 10,
    seatsLeft: 7,
    fare: 750,
    amenities: ["AC", "Charging", "Pushback"],
    rating: 4.6,
    operator: "ZRS Travels",
  },
  {
    id: "s3",
    name: "Lai Autonomous Deluxe",
    number: "MZ02 B 8834",
    from: "Saiha",
    to: "Aizawl",
    departure: "05:00 AM",
    duration: "10h 15m",
    arrival: "03:15 PM",
    seatsTotal: 10,
    seatsLeft: 2,
    fare: 720,
    amenities: ["Charging", "Pushback", "Water"],
    rating: 4.7,
    operator: "LADC Approved",
  },
  {
    id: "s4",
    name: "Siahatla Night Rider",
    number: "MZ03 C 2011",
    from: "Aizawl",
    to: "Saiha",
    departure: "06:30 AM",
    duration: "10h 45m",
    arrival: "05:15 PM",
    seatsTotal: 10,
    seatsLeft: 6,
    fare: 700,
    amenities: ["AC", "Charging", "Water"],
    rating: 4.5,
    operator: "Siahatla Motors",
  },
];

const amenityMeta: Record<Amenity, { label: string; icon: any }> = {
  AC: { label: "AC", icon: Snowflake },
  Charging: { label: "Charging Point", icon: Zap },
  Pushback: { label: "Pushback", icon: Armchair },
  Water: { label: "Water Bottle", icon: Droplets },
};

export default function App() {
  const [view, setView] = useState<"home" | "bookings" | "admin">("home");
  const [sumos, setSumos] = useState<Sumo[]>(initialSumos);
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: "B-1001",
      sumoId: "s1",
      sumoName: "Saiha Express - Super Luxury",
      from: "Saiha",
      to: "Aizawl",
      date: new Date().toISOString().slice(0, 10),
      departure: "05:30 AM",
      passengers: 2,
      farePerSeat: 700,
      totalFare: 1400,
      customerName: "Demo Passenger",
      phone: "9862xxxxxx",
      bookedAt: new Date().toLocaleString(),
      status: "Confirmed",
    },
  ]);
  const [from, setFrom] = useState("Saiha");
  const [to, setTo] = useState("Aizawl");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [passengers, setPassengers] = useState(2);
  const [hasSearched, setHasSearched] = useState(true);
  const [selectedSumo, setSelectedSumo] = useState<Sumo | null>(null);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [showSuccess, setShowSuccess] = useState<Booking | null>(null);
  const [swapTick, setSwapTick] = useState(0);

  // CONFIG editable state
  const [upiId, setUpiId] = useState(CONFIG.UPI_ID);
  const [whatsappNumber, setWhatsappNumber] = useState(CONFIG.WHATSAPP_NUMBER);
  const [yourName, setYourName] = useState(CONFIG.YOUR_NAME);
  const [pendingBookingId, setPendingBookingId] = useState("");
  const [showQr, setShowQr] = useState(true);

  // admin add form
  const [newSumoName, setNewSumoName] = useState("");
  const [newSumoFare, setNewSumoFare] = useState("700");
  const [newSumoTime, setNewSumoTime] = useState("05:30 AM");
  const [newSumoFrom, setNewSumoFrom] = useState("Saiha");
  const [newSumoTo, setNewSumoTo] = useState("Aizawl");

  const filteredSumos = useMemo(() => {
    if (!hasSearched) return sumos;
    return sumos.filter((s) => {
      const routeMatch =
        (s.from === from && s.to === to) ||
        (s.from === to && s.to === from && from !== to);
      if (from === "Saiha" && to === "Aizawl") return s.from === "Saiha" && s.to === "Aizawl";
      if (from === "Aizawl" && to === "Saiha") return s.from === "Aizawl" && s.to === "Saiha";
      return routeMatch;
    });
  }, [sumos, hasSearched, from, to]);

  const handleSearch = () => {
    setHasSearched(true);
    setView("home");
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const swapPlaces = () => {
    const f = from;
    setFrom(to);
    setTo(f);
    setHasSearched(true);
    setSwapTick((t) => t + 1);
  };

  const handleHome = () => {
    setView("home");
    setHasSearched(false);
    setSelectedSumo(null);
    setShowSuccess(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalFarePreview = selectedSumo ? selectedSumo.fare * passengers : 0;

  // Generate pending booking id when modal opens
  useEffect(() => {
    if (selectedSumo) {
      const newId = `B-${Math.floor(1000 + Math.random() * 9000)}`;
      setPendingBookingId(newId);
      setShowQr(true);
    } else {
      setPendingBookingId("");
    }
  }, [selectedSumo]);

  const upiLink = useMemo(() => {
    if (!selectedSumo || !pendingBookingId) return "";
    const amount = selectedSumo.fare * passengers;
    const tn = `Sumo Booking ${pendingBookingId} ${from} to ${to}`;
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(yourName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(tn)}`;
  }, [selectedSumo, pendingBookingId, upiId, yourName, from, to, passengers]);

  const qrUrl = useMemo(() => {
    if (!upiLink) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
  }, [upiLink]);

  const confirmBooking = () => {
    if (!selectedSumo || !custName || custPhone.length < 8) return;
    const bookingId = pendingBookingId || `B-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      id: bookingId,
      sumoId: selectedSumo.id,
      sumoName: selectedSumo.name,
      from,
      to,
      date,
      departure: selectedSumo.departure,
      passengers,
      farePerSeat: selectedSumo.fare,
      totalFare: totalFarePreview,
      customerName: custName,
      phone: custPhone,
      bookedAt: new Date().toLocaleString(),
      status: "Confirmed",
    };
    setBookings((b) => [newBooking, ...b]);
    setSumos((prev) =>
      prev.map((s) =>
        s.id === selectedSumo.id ? { ...s, seatsLeft: Math.max(0, s.seatsLeft - passengers) } : s
      )
    );
    setSelectedSumo(null);
    setCustName("");
    setCustPhone("");
    setShowSuccess(newBooking);

    // Auto open WhatsApp with booking details + UPI info
    const waMessage = `*SUMO BOOKING - ${yourName}*\n\n*Booking ID:* ${newBooking.id}\n*Service:* ${newBooking.sumoName}\n*Route:* ${newBooking.from} → ${newBooking.to}\n*Date:* ${newBooking.date} | *Time:* ${newBooking.departure}\n*Passenger:* ${newBooking.customerName} (${newBooking.phone})\n*Seats:* ${newBooking.passengers} x ₹${newBooking.farePerSeat} = ₹${newBooking.totalFare}\n\n*Payment:* UPI Paid ₹${newBooking.totalFare} to ${upiId} (${yourName})\n*UPI Ref:* ${newBooking.id}\n*Status:* Paid & Confirmed - Please verify and confirm seat\n\nReporting: Siahatla Saiha Counter, 30 mins early.`;
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`;
    setTimeout(() => {
      window.open(waUrl, "_blank");
    }, 400);
  };

  const handlePaidOnWhatsApp = () => {
    confirmBooking();
  };

  const deleteSumo = (id: string) => {
    setSumos((s) => s.filter((x) => x.id !== id));
  };

  const addSumo = () => {
    if (!newSumoName) return;
    const ns: Sumo = {
      id: `s${Date.now()}`,
      name: newSumoName,
      number: `MZ0${Math.floor(2 + Math.random() * 4)} ${String.fromCharCode(65 + Math.floor(Math.random()*26))} ${Math.floor(1000+Math.random()*9000)}`,
      from: newSumoFrom,
      to: newSumoTo,
      departure: newSumoTime,
      duration: "10h 30m",
      arrival: "04:00 PM",
      seatsTotal: 10,
      seatsLeft: 10,
      fare: parseInt(newSumoFare) || 700,
      amenities: ["AC", "Charging", "Pushback"],
      rating: 4.5,
      operator: "Saiha Counter",
    };
    setSumos((p) => [ns, ...p]);
    setNewSumoName("");
    setNewSumoFare("700");
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-zinc-900 font-[Inter,system-ui,sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@700;800&display=swap');
        *{font-family: Inter, system-ui, sans-serif}
        h1,h2,.display{font-family: 'Plus Jakarta Sans', Inter, sans-serif}
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-zinc-100">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[#123B6D] flex items-center justify-center text-white">
              <Bus size={18} />
            </div>
            <div className="leading-none">
              <div className="font-extrabold tracking-tight text-[16px] text-[#123B6D]">SUMO BOOKING</div>
              <div className="text-[10px] font-semibold tracking-[0.18em] text-zinc-400 -mt-[1px]">SAIHA ↔ AIZAWL</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100 p-1 rounded-full">
            <button
              onClick={handleHome}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition ${view === "home" ? "bg-white shadow-sm text-[#123B6D]" : "text-zinc-500 hover:text-zinc-800"}`}
            >
              Home
            </button>
            <button
              onClick={() => setView("bookings")}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition flex items-center gap-1.5 ${view === "bookings" ? "bg-white shadow-sm text-[#123B6D]" : "text-zinc-500 hover:text-zinc-800"}`}
            >
              My Bookings {bookings.length > 0 && <span className="bg-[#123B6D] text-white text-[10px] px-1.5 py-0.5 rounded-full">{bookings.length}</span>}
            </button>
            <button
              onClick={() => setView("admin")}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition ${view === "admin" ? "bg-white shadow-sm text-[#123B6D]" : "text-zinc-500 hover:text-zinc-800"}`}
            >
              Admin
            </button>
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-[12px] font-medium text-zinc-600 bg-[#F5F7FA] px-3 py-1.5 rounded-full border border-zinc-100">
              <Phone size={14} className="text-[#123B6D]" /> Saiha: 9862-xxx-xxx
            </div>
            <button className="md:hidden px-3 py-2 rounded-full bg-zinc-100 text-sm font-semibold" onClick={() => setView(view === "bookings" ? "home" : "bookings")}>
              {view === "bookings" ? "Home" : `Bookings (${bookings.length})`}
            </button>
            <button className="md:hidden px-3 py-2 rounded-full bg-[#123B6D] text-white text-sm font-semibold" onClick={() => setView(view === "admin" ? "home" : "admin")}>
              Admin
            </button>
          </div>
        </div>
      </header>

      {view === "home" && (
        <>
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#123B6D] via-[#123B6D] to-[#0E2F58]" />
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: `radial-gradient(white 1px, transparent 1px)`, backgroundSize: "22px 22px" }} />
            <div className="relative mx-auto max-w-[1200px] px-4 md:px-6 pt-10 md:pt-16 pb-[120px] md:pb-[140px]">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                <div className="max-w-[620px]">
                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/90 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide backdrop-blur">
                    <ShieldCheck size={14} /> GOVT APPROVED • DAILY SERVICE • 365 DAYS
                  </div>
                  <h1 className="display mt-5 text-[34px] md:text-[54px] leading-[0.95] tracking-[-0.02em] font-[800] text-white">
                    Book Your <br />
                    <span className="text-white/90">Saiha — Aizawl</span> <br />
                    <span className="text-[#8EBFFF]">Sumo.</span>
                  </h1>
                  <p className="mt-4 text-[16px] md:text-[18px] leading-[1.5] text-white/70 max-w-[480px]">
                    Safe, Fast, Comfortable Journey across 378km. Trusted by thousands of Mizos every month.
                  </p>
                  <div className="mt-6 flex items-center gap-6">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-[#123B6D] flex items-center justify-center text-[11px] font-bold text-white">
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <div className="text-white/80 text-[13px]">
                      <div className="flex items-center gap-1 font-semibold text-white"><Star size={14} className="fill-[#FFC94A] text-[#FFC94A]" /> 4.8/5 • 2.4k reviews</div>
                      <div className="text-white/60">Booked in last 24h: 128 passengers</div>
                    </div>
                  </div>
                </div>
                <div className="md:w-[320px] grid grid-cols-3 gap-3">
                  {[
                    { k: "378km", v: "Distance", icon: Route },
                    { k: "10h", v: "Avg Time", icon: Timer },
                    { k: "₹700", v: "Starts from", icon: Bus },
                  ].map((s) => (
                    <div key={s.k} className="bg-white/10 backdrop-blur border border-white/10 rounded-[16px] p-3 text-white">
                      <s.icon size={16} className="opacity-80 mb-2" />
                      <div className="text-[18px] font-bold leading-none">{s.k}</div>
                      <div className="text-[11px] opacity-70 mt-1">{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Search Card - floating */}
            <div className="relative -mt-[88px] md:-mt-[96px] mx-auto max-w-[1200px] px-4 md:px-6">
              <div className="bg-white rounded-[20px] md:rounded-[24px] shadow-[0_20px_60px_-20px_rgba(18,59,109,0.35),0_0_0_1px_rgba(0,0,0,0.04)] p-4 md:p-6 border border-white">
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                  {/* From To */}
                  <div className="flex-1 grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                    <div className="bg-[#F5F7FA] rounded-[16px] px-4 py-3 border border-zinc-100 focus-within:border-[#123B6D]/30 transition">
                      <div className="flex items-center gap-2 text-[11px] font-bold tracking-wide text-zinc-400 uppercase">
                        <MapPin size={12} /> From
                      </div>
                      <select
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="mt-1 w-full bg-transparent text-[16px] font-semibold outline-none"
                      >
                        <option>Saiha</option>
                        <option>Aizawl</option>
                      </select>
                      <div className="text-[12px] text-zinc-500">Siahatla, Saiha District</div>
                    </div>

                    <button
                      onClick={swapPlaces}
                      data-swap={swapTick}
                      className="w-9 h-9 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition self-center"
                      aria-label="Swap route"
                      title="Swap Saiha ↔ Aizawl"
                    >
                      <span className="flex items-center gap-1">
                        <ArrowLeftRight size={14} className="text-[#123B6D]" />
                        <span className="text-[10px] font-bold text-[#123B6D]">{swapTick % 2 === 0 ? "S→A" : "A→S"}</span>
                      </span>
                    </button>

                    <div className="bg-[#F5F7FA] rounded-[16px] px-4 py-3 border border-zinc-100 focus-within:border-[#123B6D]/30 transition">
                      <div className="flex items-center gap-2 text-[11px] font-bold tracking-wide text-zinc-400 uppercase">
                        <MapPin size={12} /> To
                      </div>
                      <select
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="mt-1 w-full bg-transparent text-[16px] font-semibold outline-none"
                      >
                        <option>Aizawl</option>
                        <option>Saiha</option>
                      </select>
                      <div className="text-[12px] text-zinc-500">Mizoram Capital</div>
                    </div>
                  </div>

                  {/* Date + Pax + Search */}
                  <div className="flex-1 grid grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_auto] gap-2">
                    <div className="bg-[#F5F7FA] rounded-[16px] px-4 py-3 border border-zinc-100">
                      <div className="flex items-center gap-2 text-[11px] font-bold tracking-wide text-zinc-400 uppercase">
                        <Calendar size={12} /> Date
                      </div>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-1 w-full bg-transparent text-[15px] font-semibold outline-none"
                      />
                      <div className="text-[12px] text-zinc-500">
                        {new Date(date).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
                      </div>
                    </div>

                    <div className="bg-[#F5F7FA] rounded-[16px] px-4 py-3 border border-zinc-100 flex flex-col justify-between">
                      <div className="flex items-center gap-2 text-[11px] font-bold tracking-wide text-zinc-400 uppercase">
                        <Users size={12} /> Passengers
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <button
                          disabled={passengers <= 1}
                          data-count={passengers}
                          onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                          className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center font-bold hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Decrease passengers"
                        >
                          −
                        </button>
                        <div className="text-[18px] font-bold min-w-[20px] text-center" data-testid="pax-count">{passengers}</div>
                        <button
                          disabled={passengers >= 10}
                          data-count={passengers}
                          onClick={() => setPassengers((p) => Math.min(10, p + 1))}
                          className="w-8 h-8 rounded-full bg-[#123B6D] text-white flex items-center justify-center font-bold hover:bg-[#0E2F58] disabled:opacity-40"
                          aria-label="Increase passengers"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleSearch}
                      className="h-full min-h-[74px] rounded-[16px] bg-[#123B6D] hover:bg-[#0E2F58] text-white font-bold text-[15px] px-7 flex items-center justify-center gap-2 shadow-[0_10px_24px_-8px_rgba(18,59,109,0.6)] transition"
                    >
                      <Search size={18} /> SEARCH SUMO
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-500">
                  <span className="inline-flex items-center gap-1 bg-[#F0F5FF] text-[#123B6D] px-2.5 py-1 rounded-full font-semibold"><Check size={12} /> Free cancellation till 6h</span>
                  <span className="inline-flex items-center gap-1 bg-zinc-100 px-2.5 py-1 rounded-full"><ShieldCheck size={12} /> Govt. verified operators</span>
                  <span className="inline-flex items-center gap-1 bg-zinc-100 px-2.5 py-1 rounded-full"><Clock size={12} /> Daily 5AM - 7AM departures</span>
                </div>
              </div>
            </div>
          </section>

          {/* Results */}
          <section id="results" className="mx-auto max-w-[1200px] px-4 md:px-6 mt-8 md:mt-10 pb-16">
            {!hasSearched ? (
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: "Saiha Counter", desc: "Siahatla, Near DC Office. 5AM reporting.", phone: "9862-xxx-xxx" },
                  { title: "Aizawl Counter", desc: "Zemabawk, Khatla Road. Daily boarding.", phone: "9862-yyy-yyy" },
                  { title: "Why Sumo?", desc: "Fastest, safest & most frequent on this hill route. 10-seater comfort.", phone: "Helpline" },
                ].map((c) => (
                  <div key={c.title} className="bg-white rounded-[20px] p-5 border border-zinc-100 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.2)]">
                    <div className="w-10 h-10 rounded-[12px] bg-[#F0F5FF] flex items-center justify-center text-[#123B6D] mb-3"><MapPin size={18} /></div>
                    <div className="font-bold">{c.title}</div>
                    <div className="text-[13px] text-zinc-500 mt-1 leading-[1.5]">{c.desc}</div>
                    <div className="mt-3 text-[12px] font-semibold text-[#123B6D]">{c.phone}</div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
                  <div>
                    <h2 className="display text-[22px] md:text-[26px] font-bold tracking-tight">
                      {from} → {to} • {filteredSumos.length} Sumos available
                    </h2>
                    <div className="text-[13px] text-zinc-500 mt-1">
                      {new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} • {passengers} passenger{passengers > 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="text-[12px] px-3 py-1.5 rounded-full bg-[#E8F0FF] text-[#123B6D] font-semibold border border-[#D0DDF5]">
                    Fare includes toll & permit • No hidden charges
                  </div>
                </div>

                <div className="grid gap-4">
                  {filteredSumos.map((s) => (
                    <div
                      key={s.id}
                      className="group bg-white rounded-[20px] border border-zinc-100 shadow-[0_12px_32px_-18px_rgba(0,0,0,0.18)] hover:shadow-[0_18px_48px_-18px_rgba(18,59,109,0.25)] transition-all p-4 md:p-5"
                    >
                      <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                        {/* left meta */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-bold text-[16px] md:text-[17px] leading-tight truncate">{s.name}</div>
                                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold bg-[#FFF7CC] text-[#7A5B00] px-2 py-0.5 rounded-full border border-[#FFE99A]"><Star size={10} className="fill-[#7A5B00]" /> {s.rating}</span>
                              </div>
                              <div className="text-[12px] text-zinc-500 mt-0.5 flex items-center gap-2">
                                <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-[11px]">{s.number}</span>
                                <span>• {s.operator}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[12px] text-zinc-400 font-semibold tracking-wide uppercase">Seats Left</div>
                              <div className={`text-[14px] font-bold px-2.5 py-1 rounded-full inline-block mt-1 ${s.seatsLeft <= 2 ? "bg-[#FFE3E3] text-[#B42318] border border-[#FFC9C9]" : "bg-[#E6F4EA] text-[#0F6D2E] border border-[#C7E8CF]"}`}>
                                {s.seatsLeft} left
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                            <div>
                              <div className="text-[18px] font-extrabold tracking-tight">{s.departure}</div>
                              <div className="text-[12px] text-zinc-500 font-medium">{s.from}</div>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                              <div className="text-[11px] text-zinc-400 font-semibold">{s.duration}</div>
                              <div className="w-[88px] md:w-[120px] h-[1px] bg-zinc-200 relative">
                                <div className="absolute left-1/2 -top-1 w-2 h-2 rounded-full bg-[#123B6D] -translate-x-1/2" />
                              </div>
                              <div className="text-[11px] text-zinc-400">10-seater</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[18px] font-extrabold tracking-tight">{s.arrival}</div>
                              <div className="text-[12px] text-zinc-500 font-medium">{s.to}</div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {s.amenities.map((a) => {
                              const Icon = amenityMeta[a].icon;
                              return (
                                <span key={a} className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#F5F7FA] border border-zinc-100 px-2.5 py-1 rounded-full text-zinc-700">
                                  <Icon size={12} className="text-[#123B6D]" /> {amenityMeta[a].label}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* right fare + action */}
                        <div className="lg:w-[260px] flex lg:flex-col items-center lg:items-stretch justify-between gap-4 bg-[#F8FAFF] lg:bg-[#F5F7FA] border border-[#E6EEFF] lg:border-zinc-100 rounded-[16px] p-4">
                          <div>
                            <div className="text-[11px] font-bold tracking-wide text-zinc-400 uppercase">Fare per seat</div>
                            <div className="flex items-baseline gap-1 mt-1">
                              <div className="text-[26px] font-extrabold tracking-tight text-[#123B6D]">₹{s.fare}</div>
                              <div className="text-[12px] text-zinc-500 line-through">₹850</div>
                            </div>
                            <div className="text-[11px] text-[#0F6D2E] font-semibold mt-1">₹{Math.round(s.fare * 0.12)} OFF • Early bird</div>
                          </div>
                          <div className="flex flex-col gap-2 w-[150px] lg:w-auto">
                            <button
                              onClick={() => setSelectedSumo(s)}
                              className="w-full h-[44px] rounded-[12px] bg-[#123B6D] hover:bg-[#0E2F58] text-white font-bold text-[14px] shadow-[0_10px_20px_-10px_rgba(18,59,109,0.7)] transition flex items-center justify-center gap-2"
                            >
                              BOOK NOW <ArrowLeftRight size={14} className="rotate-90 lg:rotate-0" />
                            </button>
                            <div className="text-[11px] text-center text-zinc-500">Total: ₹{s.fare * passengers} for {passengers} seat{passengers>1?"s":""}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredSumos.length === 0 && (
                    <div className="bg-white rounded-[20px] p-10 text-center border border-dashed border-zinc-200">
                      <div className="text-[16px] font-bold">No Sumos for this route</div>
                      <div className="text-[13px] text-zinc-500 mt-1">Try swapping Saiha ↔ Aizawl</div>
                      <button onClick={swapPlaces} className="mt-4 px-4 py-2 rounded-full bg-[#123B6D] text-white text-sm font-semibold">Swap Route</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </>
      )}

      {view === "bookings" && (
        <section className="mx-auto max-w-[900px] px-4 md:px-6 py-8">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="display text-[26px] font-bold tracking-tight">My Bookings</h2>
              <p className="text-[13px] text-zinc-500 mt-1">Bookings for this session • Export via copy • No permanent storage</p>
            </div>
            <button onClick={() => setView("home")} className="px-4 py-2 rounded-full bg-white border border-zinc-200 text-[13px] font-semibold">← Back to search</button>
          </div>

          <div className="grid gap-3">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-[20px] p-10 text-center border border-zinc-100">
                <Bus size={28} className="mx-auto text-zinc-300 mb-3" />
                <div className="font-bold">No bookings yet</div>
                <div className="text-[13px] text-zinc-500 mt-1">Search and book a Saiha - Aizawl Sumo to see it here</div>
              </div>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className="bg-white rounded-[20px] border border-zinc-100 p-5 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.2)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[12px] bg-[#E8F0FF] flex items-center justify-center text-[#123B6D]"><Bus size={18} /></div>
                      <div>
                        <div className="font-bold text-[15px]">{b.sumoName}</div>
                        <div className="text-[12px] text-zinc-500">{b.from} → {b.to} • {b.departure} • {b.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 bg-[#E6F4EA] text-[#0F6D2E] border border-[#C7E8CF] px-2.5 py-1 rounded-full text-[11px] font-bold"><Check size={12} /> {b.status}</div>
                      <div className="text-[12px] text-zinc-400 mt-1 font-mono">{b.id}</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-[13px]">
                    <div className="bg-[#F5F7FA] rounded-[12px] p-3"><div className="text-[11px] text-zinc-400 font-bold uppercase">Passenger</div><div className="font-semibold mt-1">{b.customerName}</div><div className="text-zinc-500 text-[12px]">{b.phone}</div></div>
                    <div className="bg-[#F5F7FA] rounded-[12px] p-3"><div className="text-[11px] text-zinc-400 font-bold uppercase">Seats</div><div className="font-semibold mt-1">{b.passengers} seat{b.passengers>1?"s":""}</div><div className="text-zinc-500 text-[12px]">₹{b.farePerSeat} x {b.passengers}</div></div>
                    <div className="bg-[#F5F7FA] rounded-[12px] p-3"><div className="text-[11px] text-zinc-400 font-bold uppercase">Total Paid</div><div className="font-extrabold text-[#123B6D] mt-1 text-[16px]">₹{b.totalFare}</div><div className="text-zinc-500 text-[12px]">{b.bookedAt}</div></div>
                    <div className="bg-[#123B6D] rounded-[12px] p-3 text-white"><div className="text-[11px] text-white/60 font-bold uppercase">Copy Ticket</div><button onClick={() => navigator.clipboard?.writeText(`SUMO TICKET ${b.id}\n${b.sumoName}\n${b.from} → ${b.to} ${b.date} ${b.departure}\n${b.customerName} ${b.phone}\nSeats: ${b.passengers} Total: ₹${b.totalFare}\nCounter: Siahatla Saiha\nUPI Paid to ${upiId}`)} className="mt-1 text-[12px] font-semibold underline decoration-white/40">Copy details</button></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {view === "admin" && (
        <section className="mx-auto max-w-[1200px] px-4 md:px-6 py-8">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="display text-[26px] font-bold tracking-tight">Admin Panel</h2>
              <p className="text-[13px] text-zinc-500 mt-1">Manage Sumos, bookings & payments — changes live for this session only</p>
            </div>
            <button onClick={() => setView("home")} className="px-4 py-2 rounded-full bg-white border border-zinc-200 text-[13px] font-semibold">← Exit admin</button>
          </div>

          <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
            {/* Left column */}
            <div className="grid gap-6">
              {/* Payment Settings */}
              <div className="bg-white rounded-[20px] border border-zinc-100 p-5 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.2)]">
                <div className="font-bold flex items-center gap-2"><QrCode size={16} className="text-[#123B6D]" /> Payment Settings</div>
                <p className="text-[11px] text-zinc-500 mt-1">Editable UPI & WhatsApp — used for QR and auto message</p>
                <div className="mt-4 grid gap-3">
                  <div>
                    <div className="text-[11px] font-bold uppercase text-zinc-400">UPI ID (pa)</div>
                    <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="doctorazyu@oksbi" className="mt-1 w-full bg-[#F5F7FA] border border-zinc-100 rounded-[12px] px-3 py-2.5 text-[14px] font-mono outline-none focus:border-[#123B6D]/30 focus:bg-white transition" />
                    <div className="text-[10px] text-zinc-400 mt-1">Example: yourname@oksbi / @ybl / @paytm</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase text-zinc-400">Business Name (pn)</div>
                    <input value={yourName} onChange={(e) => setYourName(e.target.value)} placeholder="Saiha Sumo Service" className="mt-1 w-full bg-[#F5F7FA] border border-zinc-100 rounded-[12px] px-3 py-2.5 text-[14px] font-semibold outline-none focus:border-[#123B6D]/30 focus:bg-white transition" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase text-zinc-400">WhatsApp Number (with country code)</div>
                    <input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="919362600601" className="mt-1 w-full bg-[#F5F7FA] border border-zinc-100 rounded-[12px] px-3 py-2.5 text-[14px] font-mono outline-none focus:border-[#123B6D]/30 focus:bg-white transition" />
                    <div className="text-[10px] text-zinc-400 mt-1">No + or spaces. Will open wa.me/{whatsappNumber}</div>
                  </div>
                  <div className="mt-2 bg-[#F0F5FF] border border-[#D6E4FF] rounded-[12px] p-3">
                    <div className="text-[11px] font-bold text-[#123B6D] uppercase flex items-center gap-1"><MessageCircle size={12} /> Preview UPI Link</div>
                    <div className="mt-1 text-[10px] font-mono text-[#123B6D] break-all leading-[1.4]">upi://pay?pa={upiId}&pn={encodeURIComponent(yourName)}&am=700&cu=INR&tn=Sumo Booking</div>
                    <div className="mt-2 flex gap-2">
                      <a href={`upi://pay?pa=${upiId}&pn=${encodeURIComponent(yourName)}&am=700&cu=INR&tn=Test`} className="text-[11px] bg-[#123B6D] text-white px-3 py-1.5 rounded-full font-semibold">Test UPI App</a>
                      <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi ${yourName}, test booking`)}`} target="_blank" rel="noopener noreferrer" className="text-[11px] bg-white border border-zinc-200 px-3 py-1.5 rounded-full font-semibold">Test WhatsApp</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add sumo */}
              <div className="bg-white rounded-[20px] border border-zinc-100 p-5 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.2)]">
                <div className="font-bold flex items-center gap-2"><Plus size={16} className="text-[#123B6D]" /> Add New Sumo</div>
                <div className="mt-4 grid gap-3">
                  <div>
                    <div className="text-[11px] font-bold uppercase text-zinc-400">Sumo / Service Name</div>
                    <input value={newSumoName} onChange={(e) => setNewSumoName(e.target.value)} placeholder="e.g. Chhimtuipui Express" className="mt-1 w-full bg-[#F5F7FA] border border-zinc-100 rounded-[12px] px-3 py-2.5 text-[14px] outline-none focus:border-[#123B6D]/30" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[11px] font-bold uppercase text-zinc-400">From</div>
                      <select value={newSumoFrom} onChange={(e) => setNewSumoFrom(e.target.value)} className="mt-1 w-full bg-[#F5F7FA] border border-zinc-100 rounded-[12px] px-3 py-2.5 text-[14px] outline-none">
                        <option>Saiha</option><option>Aizawl</option>
                      </select>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase text-zinc-400">To</div>
                      <select value={newSumoTo} onChange={(e) => setNewSumoTo(e.target.value)} className="mt-1 w-full bg-[#F5F7FA] border border-zinc-100 rounded-[12px] px-3 py-2.5 text-[14px] outline-none">
                        <option>Aizawl</option><option>Saiha</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[11px] font-bold uppercase text-zinc-400">Departure</div>
                      <input value={newSumoTime} onChange={(e) => setNewSumoTime(e.target.value)} className="mt-1 w-full bg-[#F5F7FA] border border-zinc-100 rounded-[12px] px-3 py-2.5 text-[14px] outline-none" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase text-zinc-400">Fare (₹)</div>
                      <input value={newSumoFare} onChange={(e) => setNewSumoFare(e.target.value)} className="mt-1 w-full bg-[#F5F7FA] border border-zinc-100 rounded-[12px] px-3 py-2.5 text-[14px] outline-none" />
                    </div>
                  </div>
                  <button onClick={addSumo} className="mt-2 h-[44px] rounded-[12px] bg-[#123B6D] text-white font-bold text-[14px]">Add Sumo to List</button>
                  <div className="text-[11px] text-zinc-500">Tip: All changes reset on page refresh — this is a frontend demo without backend.</div>
                </div>

                <div className="mt-8">
                  <div className="font-bold text-[14px]">Saiha Counter Info</div>
                  <div className="mt-2 text-[13px] text-zinc-600 leading-[1.6] bg-[#F5F7FA] rounded-[12px] p-3 border border-zinc-100">
                    <div><b>Address:</b> Siahatla, Saiha - 796901, Near DC Office</div>
                    <div><b>Phone:</b> 9862-xxx-xxx / 8974-xxx-xxx</div>
                    <div><b>Reporting:</b> 30 mins before departure</div>
                    <div><b>Aizawl Drop:</b> Zemabawk / Khatla / Vaivakawn</div>
                    <div className="mt-2 pt-2 border-t border-zinc-200"><b>UPI:</b> {upiId}<br/><b>WhatsApp:</b> +{whatsappNumber}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lists */}
            <div className="grid gap-6">
              <div className="bg-white rounded-[20px] border border-zinc-100 p-5 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.2)]">
                <div className="flex items-center justify-between">
                  <div className="font-bold">All Sumos ({sumos.length})</div>
                  <div className="text-[11px] bg-zinc-100 px-2.5 py-1 rounded-full font-semibold">{sumos.filter(s=>s.from==="Saiha").length} Saiha→Aizawl • {sumos.filter(s=>s.from==="Aizawl").length} Aizawl→Saiha</div>
                </div>
                <div className="mt-4 grid gap-2">
                  {sumos.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-3 bg-[#F5F7FA] rounded-[12px] px-3 py-2.5 border border-zinc-100">
                      <div className="min-w-0">
                        <div className="font-semibold text-[13px] truncate">{s.name}</div>
                        <div className="text-[11px] text-zinc-500">{s.from} → {s.to} • {s.departure} • ₹{s.fare} • {s.seatsLeft}/{s.seatsTotal} seats</div>
                      </div>
                      <button onClick={() => deleteSumo(s.id)} className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-red-600 hover:border-red-200">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[20px] border border-zinc-100 p-5 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.2)]">
                <div className="font-bold">All Bookings ({bookings.length}) — This Session</div>
                <div className="mt-4 grid gap-2">
                  {bookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between gap-3 bg-[#F5F7FA] rounded-[12px] px-3 py-2.5 border border-zinc-100">
                      <div className="min-w-0">
                        <div className="font-semibold text-[13px]">{b.id} • {b.customerName} • {b.phone}</div>
                        <div className="text-[11px] text-zinc-500">{b.sumoName} • {b.from}→{b.to} {b.date} • {b.passengers} seats • ₹{b.totalFare}</div>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400">{b.bookedAt.slice(0,16)}</div>
                    </div>
                  ))}
                  {bookings.length===0 && <div className="text-[13px] text-zinc-500 py-6 text-center">No bookings in this session</div>}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Booking Modal */}
      {selectedSumo && (
        <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="absolute inset-0 bg-[#0A1E3A]/70 backdrop-blur-[6px]" onClick={() => setSelectedSumo(null)} />
          <div className="relative w-full md:max-w-[560px] bg-white rounded-t-[24px] md:rounded-[24px] shadow-[0_24px_64px_-16px_rgba(0,0,0,0.5)] border border-white overflow-hidden animate-[in_.25s_ease] max-h-[92vh] md:max-h-[90vh] overflow-y-auto">
            <div className="h-1 w-full bg-[#123B6D] sticky top-0 z-10" />
            <div className="p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold tracking-wide text-[#123B6D] uppercase">Confirm your sumo</div>
                  <div className="font-extrabold text-[18px] leading-tight mt-1">{selectedSumo.name}</div>
                  <div className="text-[13px] text-zinc-500 mt-1">{from} → {to} • {date} • {selectedSumo.departure} • {selectedSumo.number} • <span className="font-mono text-[11px] bg-zinc-100 px-1.5 py-0.5 rounded">{pendingBookingId}</span></div>
                </div>
                <button onClick={() => setSelectedSumo(null)} className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center"><X size={16} /></button>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="bg-[#F5F7FA] rounded-[14px] p-3 border border-zinc-100">
                  <div className="text-[11px] text-zinc-400 font-bold uppercase">Route</div>
                  <div className="font-bold text-[14px] mt-1">{from} → {to}</div>
                  <div className="text-[11px] text-zinc-500 mt-1">{selectedSumo.duration}</div>
                </div>
                <div className="bg-[#F5F7FA] rounded-[14px] p-3 border border-zinc-100">
                  <div className="text-[11px] text-zinc-400 font-bold uppercase">Seats</div>
                  <div className="font-bold text-[14px] mt-1">{passengers} seat{passengers>1?"s":""}</div>
                  <div className="text-[11px] text-zinc-500 mt-1">{selectedSumo.seatsLeft} left</div>
                </div>
                <div className="bg-[#E8F0FF] rounded-[14px] p-3 border border-[#D6E4FF]">
                  <div className="text-[11px] text-[#123B6D]/70 font-bold uppercase">Total Fare</div>
                  <div className="font-extrabold text-[18px] text-[#123B6D] mt-1">₹{totalFarePreview}</div>
                  <div className="text-[11px] text-[#123B6D]/70 mt-1">₹{selectedSumo.fare} x {passengers}</div>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase text-zinc-400">Customer Full Name</div>
                  <input value={custName} onChange={(e) => setCustName(e.target.value)} placeholder="e.g. Lalremruata" className="mt-1 w-full bg-[#F5F7FA] border border-zinc-200 rounded-[12px] px-3.5 py-3 text-[14px] font-medium outline-none focus:border-[#123B6D] focus:bg-white transition" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase text-zinc-400">Phone Number</div>
                  <input value={custPhone} onChange={(e) => setCustPhone(e.target.value)} placeholder="9862xxxxxx" className="mt-1 w-full bg-[#F5F7FA] border border-zinc-200 rounded-[12px] px-3.5 py-3 text-[14px] font-medium outline-none focus:border-[#123B6D] focus:bg-white transition" />
                  <div className="text-[11px] text-zinc-500 mt-1.5">Ticket & counter location will be shared on this number • Demo: no SMS sent</div>
                </div>
              </div>

              {/* UPI PAYMENT SECTION */}
              <div className="mt-6 border border-[#D6E4FF] rounded-[16px] overflow-hidden bg-[#F8FAFF]">
                <button onClick={() => setShowQr(!showQr)} className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-[10px] bg-[#123B6D] text-white flex items-center justify-center"><QrCode size={18} /></div>
                    <div>
                      <div className="font-bold text-[14px] text-[#123B6D] flex items-center gap-1.5">UPI Payment <span className="bg-[#123B6D] text-white text-[10px] px-1.5 py-0.5 rounded-full">Required</span></div>
                      <div className="text-[11px] text-zinc-500">Scan QR or pay via UPI app • {upiId}</div>
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-[#123B6D] bg-white border border-[#D6E4FF] px-2.5 py-1 rounded-full">{showQr ? "Hide" : "Show QR"}</div>
                </button>

                {showQr && (
                  <div className="px-4 pb-4 grid md:grid-cols-[160px_1fr] gap-4 items-start">
                    <div className="bg-white rounded-[14px] border border-zinc-100 p-2.5 flex flex-col items-center">
                      {qrUrl ? (
                        <img src={qrUrl} alt="UPI QR" className="w-[150px] h-[150px] rounded-[8px]" />
                      ) : (
                        <div className="w-[150px] h-[150px] bg-zinc-100 rounded-[8px] flex items-center justify-center text-zinc-400"><QrCode size={28} /></div>
                      )}
                      <div className="mt-2 text-[10px] font-mono text-zinc-500 text-center break-all">₹{totalFarePreview} → {upiId}</div>
                      <div className="mt-1 text-[10px] text-[#0F6D2E] font-bold bg-[#E6F4EA] px-2 py-0.5 rounded-full border border-[#C7E8CF]">Scan with any UPI App</div>
                    </div>

                    <div className="grid gap-3">
                      <div className="bg-white rounded-[12px] border border-zinc-100 p-3">
                        <div className="text-[11px] font-bold uppercase text-zinc-400">Pay to</div>
                        <div className="font-bold text-[14px] mt-1 flex items-center gap-2">{yourName} <span className="text-[11px] font-mono bg-[#F0F5FF] text-[#123B6D] px-2 py-0.5 rounded-full border border-[#D6E4FF]">{upiId}</span></div>
                        <div className="text-[12px] mt-2 grid grid-cols-2 gap-2">
                          <div><span className="text-zinc-400">Amount:</span> <b className="text-[#123B6D]">₹{totalFarePreview}</b></div>
                          <div><span className="text-zinc-400">Booking:</span> <b>{pendingBookingId}</b></div>
                          <div className="col-span-2 text-[11px] text-zinc-500 mt-1 break-all">UPI Link: {upiLink.slice(0, 80)}...</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        <a
                          href={upiLink}
                          className="h-[44px] rounded-[12px] bg-[#0F6D2E] hover:bg-[#0C5A26] text-white font-bold text-[13px] flex items-center justify-center gap-2 transition shadow-[0_8px_16px_-8px_rgba(15,109,46,0.5)]"
                        >
                          <Zap size={16} /> Pay via UPI App — ₹{totalFarePreview}
                        </a>
                        <div className="text-[11px] text-center text-zinc-500">GPay, PhonePe, Paytm, BHIM will open with amount pre-filled</div>
                      </div>

                      <div className="text-[11px] text-zinc-500 leading-[1.5] bg-[#FFF7CC] border border-[#FFE99A] rounded-[10px] p-2.5">
                        <b>Steps:</b> 1) Pay ₹{totalFarePreview} using QR or UPI App 2) Click "I have Paid" below — this will confirm booking and open WhatsApp to send receipt to <b>+{whatsappNumber}</b>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handlePaidOnWhatsApp}
                disabled={!custName || custPhone.length < 8}
                className="mt-5 w-full h-[52px] rounded-[14px] bg-[#123B6D] disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-extrabold text-[14px] tracking-wide shadow-[0_12px_24px_-10px_rgba(18,59,109,0.7)] transition flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} /> I have Paid - Confirm on WhatsApp • ₹{totalFarePreview}
              </button>
              <div className="mt-3 text-[11px] text-center text-zinc-500">Secure UPI booking • Auto WhatsApp to +{whatsappNumber} • Free cancellation up to 6 hours</div>
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {showSuccess && (
        <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="absolute inset-0 bg-[#0A1E3A]/70 backdrop-blur-[8px]" onClick={() => setShowSuccess(null)} />
          <div className="relative w-full md:max-w-[480px] bg-white rounded-t-[24px] md:rounded-[24px] shadow-[0_24px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden text-center p-7">
            <div className="w-14 h-14 rounded-full bg-[#E6F4EA] border border-[#C7E8CF] flex items-center justify-center mx-auto text-[#0F6D2E]"><Check size={28} /></div>
            <div className="mt-4 font-extrabold text-[22px] tracking-tight">Booking Confirmed!</div>
            <div className="mt-1 text-[13px] text-zinc-500">Your Saiha ↔ Aizawl Sumo ticket is ready • WhatsApp opened</div>
            <div className="mt-5 bg-[#F5F7FA] rounded-[16px] p-4 text-left border border-zinc-100">
              <div className="font-bold text-[14px]">{showSuccess.sumoName}</div>
              <div className="text-[12px] text-zinc-500 mt-1">{showSuccess.from} → {showSuccess.to} • {showSuccess.date} • {showSuccess.departure}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                <div><span className="text-zinc-400">Booking ID:</span> <b>{showSuccess.id}</b></div>
                <div><span className="text-zinc-400">Passengers:</span> <b>{showSuccess.passengers}</b></div>
                <div><span className="text-zinc-400">Total:</span> <b className="text-[#123B6D]">₹{showSuccess.totalFare}</b></div>
                <div><span className="text-zinc-400">Phone:</span> <b>{showSuccess.phone}</b></div>
                <div className="col-span-2 mt-1 pt-2 border-t border-zinc-200 text-[11px]"><span className="text-zinc-400">UPI Paid to:</span> <b className="font-mono">{upiId}</b> • <span className="text-[#0F6D2E] font-semibold">WhatsApp sent to +{whatsappNumber}</span></div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={() => { setShowSuccess(null); setView("bookings"); }} className="h-[44px] rounded-[12px] bg-[#123B6D] text-white font-bold text-[13px]">View My Bookings</button>
              <button onClick={() => setShowSuccess(null)} className="h-[44px] rounded-[12px] bg-zinc-100 text-zinc-800 font-bold text-[13px]">Book Another</button>
            </div>
            <div className="mt-3 text-[11px] text-zinc-500">If WhatsApp didn't open, copy ticket and message manually to +{whatsappNumber}</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-100 bg-white">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6 py-8 grid md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[10px] bg-[#123B6D] flex items-center justify-center text-white"><Bus size={16} /></div>
              <div className="font-extrabold text-[14px] text-[#123B6D]">SUMO BOOKING</div>
            </div>
            <div className="text-[12px] text-zinc-500 mt-3 leading-[1.6]">Daily trusted Sumo service connecting Saiha District & Aizawl. Safe drivers, verified vehicles, fixed fares. UPI: {upiId}</div>
          </div>
          <div>
            <div className="font-bold text-[13px]">Saiha Counter</div>
            <div className="text-[12px] text-zinc-500 mt-2 leading-[1.6]">Siahatla, Saiha - 796901<br/>Near DC Office Complex<br/>Daily 4:30 AM - 7:00 AM</div>
            <div className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-bold bg-[#F5F7FA] border border-zinc-100 px-2.5 py-1 rounded-full"><Phone size={12} /> 9862-xxx-xxx</div>
          </div>
          <div>
            <div className="font-bold text-[13px]">Aizawl Counter</div>
            <div className="text-[12px] text-zinc-500 mt-2 leading-[1.6]">Zemabawk / Khatla Road<br/>Vaivakawn Drop Available<br/>Daily Boarding & Arrival</div>
            <div className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-bold bg-[#F5F7FA] border border-zinc-100 px-2.5 py-1 rounded-full"><Phone size={12} /> 9862-yyy-yyy</div>
          </div>
          <div>
            <div className="font-bold text-[13px]">Travel Info</div>
            <div className="text-[12px] text-zinc-500 mt-2 leading-[1.7]">• 378km • 10-11h journey<br/>• 10 seater Sumo (2+3+3+2)<br/>• Luggage: 15kg free<br/>• UPI: {upiId}<br/>• WhatsApp: +{whatsappNumber}</div>
          </div>
        </div>
        <div className="border-t border-zinc-100 py-4 text-center text-[11px] text-zinc-400">
          © {new Date().getFullYear()} Sumo Booking Saiha ↔ Aizawl • Built for Mizo travellers • Demo frontend — no backend, data stays in this tab only
        </div>
      </footer>

      <style>{`@keyframes in{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}
