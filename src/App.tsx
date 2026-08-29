// @ts-nocheck
import { useState } from "react";

export default function App(){
  const [upi,setUpi]=useState("doctorazyu@oksbi");
  const [wa,setWa]=useState("919362600601");
  const [seats,setSeats]=useState<number[]>([]);
  const [step,setStep]=useState(0);
  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const toggle=(n:number)=> setSeats(s=> s.includes(n) ? s.filter(x=>x!==n) : [...s,n].slice(0,4));
  const total=seats.length*700;
  const bookingId="B-"+Math.floor(1000+Math.random()*9000);
  const utr="42"+Math.floor(1000000000+Math.random()*9000000000).toString();

  const adminMsg = `NEW BOOKING%0A%0ARoute: Saiha to Aizawl%0ASumo: SA-06-01 06:00 AM%0AName: ${name}%0APhone: ${phone}%0ASeats: ${seats.join(", ")}%0AAmount: Rs.${total}%0ABooking: ${bookingId}%0AUTR: ${utr}%0AUPI: ${upi}`;
  const customerMsg = `Your Sumo Ticket ${bookingId} Confirmed!%0ASaiha to Aizawl 06:00 AM%0ASeats: ${seats.join(", ")}%0AAmount: Rs.${total}%0AKan lawm e! Tluang takin!`;

  const openAdminWA = ()=> {
    window.open(`https://wa.me/${wa}?text=${adminMsg}`, "_blank");
  };
  const openCustomerWA = ()=> {
    if(!phone) return;
    const custNo = phone.startsWith("91") ? phone : "91"+phone.replace(/\D/g,"");
    window.open(`https://wa.me/${custNo}?text=${customerMsg}`, "_blank");
  };
  const openBoth = ()=> {
    openAdminWA();
    setTimeout(()=>openCustomerWA(), 800);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-[#060D1E] text-white" style={{fontFamily:"sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&display=swap'); .glass{background:rgba(255,255,255,0.07);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,0.12)}`}</style>
      
      <header className="sticky top-0 z-20 glass">
        <div className="max-w-5xl mx-auto px-5 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-2xl bg-white text-black grid place-items-center font-black">S</div><div><div className="font-black">SUMO BOOKING</div><div className="text-[10px] opacity-60">SAIHA to AIZAWL</div></div></div>
          <div className="px-3 py-1 rounded-full bg-emerald-400 text-black text-[10px] font-black">WHATSAPP LIVE</div>
        </div>
        <div className="bg-[#25D366] text-black text-center text-[11px] py-1 font-bold">Booking zawh ah WhatsApp ah message a lut nghal - Admin {wa} + Customer ah!</div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-5">
        <div className="rounded-[28px] bg-gradient-to-br from-indigo-600 to-violet-700 p-[1px]">
          <div className="rounded-[27px] bg-[#0F1B3A] p-5">
            <h1 className="text-[22px] font-black">Seat Thlang Rawh - 10 Seats</h1>
            <div className="mt-4 grid grid-cols-4 gap-3 max-w-[300px] mx-auto">
              <div className="h-[54px] rounded-2xl bg-white/10 grid place-items-center text-[9px]">DRIVER</div>
              <button onClick={()=>toggle(1)} className={`h-[54px] rounded-2xl font-black border ${seats.includes(1)?"bg-white text-black":"bg-white/5 border-white/15"}`}>1</button><div></div><div></div>
              {[2,3,4,5,6,7,8,9,10].map(n=> <button key={n} onClick={()=>toggle(n)} className={`h-[54px] rounded-2xl font-black border ${seats.includes(n)?"bg-white text-black":"bg-white/5 border-white/15"}`}>{n}</button>)}
            </div>
            <div className="mt-3 text-[13px]">Seats: {seats.join(", ")||"--"} | Rs.{total}</div>

            {step===0 && <button disabled={!seats.length} onClick={()=>setStep(1)} className="mt-4 w-full h-[52px] rounded-full bg-white text-black font-black disabled:opacity-30">Continue Rs.{total}</button>}

            {step===1 && (
              <div className="mt-4 space-y-3">
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Hming" className="w-full h-12 rounded-full bg-white text-black px-5 font-bold"/>
                <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Customer WhatsApp No 9362..." className="w-full h-12 rounded-full bg-white text-black px-5 font-bold"/>
                <button disabled={!name||!phone} onClick={()=>setStep(2)} className="w-full h-[52px] rounded-full bg-white text-black font-black disabled:opacity-30">Pay Rs.{total} to {upi}</button>
              </div>
            )}

            {step===2 && (
              <div className="mt-4 glass rounded-[20px] p-4">
                <div className="text-center font-black">Pay Rs.{total} to {upi}</div>
                <div className="mt-3 w-[180px] h-[180px] mx-auto bg-white rounded-xl p-3 grid grid-cols-6 gap-1">{Array.from({length:36}).map((_,i)=><div key={i} className={`rounded-[2px] ${Math.random()>0.45?"bg-black":"bg-white"}`}/>)}</div>
                <div className="mt-3 grid gap-2">
                  <a href={`upi://pay?pa=${upi}&am=${total}&cu=INR`} className="h-12 rounded-full bg-[#00D26A] text-black font-black grid place-items-center">Pay with GPay</a>
                  <button onClick={openBoth} className="h-12 rounded-full bg-[#25D366] text-black font-black">Payment Done - Send WhatsApp Now!</button>
                  <div className="text-[10px] opacity-60 text-center">He button hmeh rualin WhatsApp a inhawng ang - Admin + Customer ah message a kal nghal!</div>
                </div>
              </div>
            )}

            {step===3 && (
              <div className="mt-4 rounded-[20px] bg-white text-black p-5 text-center">
                <div className="text-3xl">✓</div><div className="font-black text-xl mt-2">Ticket Confirmed!</div>
                <div className="mt-3 text-left text-[12px] bg-black/5 rounded-xl p-3 space-y-1">
                  <div className="flex justify-between"><span>Booking</span><b>{bookingId}</b></div>
                  <div className="flex justify-between"><span>Seats</span><b>{seats.join(", ")}</b></div>
                  <div className="flex justify-between"><span>Amount</span><b>Rs.{total}</b></div>
                  <div className="flex justify-between"><span>UTR</span><b>{utr}</b></div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={openAdminWA} className="h-11 rounded-full bg-[#25D366] text-black font-black text-[11px]">Resend Admin WA {wa}</button>
                  <button onClick={openCustomerWA} className="h-11 rounded-full bg-black text-white font-black text-[11px]">Resend Customer WA</button>
                </div>
                <div className="mt-2 text-[10px] bg-emerald-100 text-emerald-800 rounded-full py-2">WhatsApp thawn tawh - {wa} leh Customer ah!</div>
                <button onClick={()=>{setSeats([]);setStep(0);setName("");setPhone("")}} className="mt-3 w-full h-12 rounded-full bg-black text-white font-black">Book Another</button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[22px] bg-white text-black p-5">
            <div className="font-black">WhatsApp Auto Message</div>
            <div className="mt-3 text-[11px] space-y-2">
              <div><b>Admin ah:</b><div className="bg-black/5 rounded-lg p-2 mt-1 font-mono text-[10px]">NEW BOOKING<br/>Saiha to Aizawl<br/>{name||"Name"} - {phone||"Phone"}<br/>Seats {seats.join(", ")||"--"} Rs.{total}<br/>Booking {bookingId}<br/>UTR {utr}</div></div>
              <div><b>Customer ah:</b><div className="bg-green-50 rounded-lg p-2 mt-1 text-[10px]">Ticket {bookingId} Confirmed! Seats {seats.join(", ")||"--"} Rs.{total} Kan lawm e!</div></div>
            </div>
            <button onClick={openAdminWA} className="mt-3 w-full h-10 rounded-full bg-[#25D366] text-black font-bold text-[12px]">Test Admin WhatsApp {wa}</button>
          </div>
          <div className="glass rounded-[22px] p-5">
            <div className="font-bold text-sm">Settings</div>
            <input value={upi} onChange={e=>setUpi(e.target.value)} className="mt-2 w-full h-10 rounded-full bg-white text-black px-4 text-[12px] font-bold" placeholder="UPI"/>
            <input value={wa} onChange={e=>setWa(e.target.value)} className="mt-2 w-full h-10 rounded-full bg-white text-black px-4 text-[12px] font-bold" placeholder="Admin WA 9193..."/>
            <div className="text-[10px] opacity-60 mt-2">9362600601 format: 91 + number - 91 tel lo chuan a thawn thei lo!</div>
          </div>
        </div>
      </div>
    </div>
  )
}
