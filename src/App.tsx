import { useState } from 'react';

type Step = 'seats' | 'details' | 'payment' | 'success';

export default function App() {
  const [step, setStep] = useState<Step>('seats');
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [route, setRoute] = useState<'saiha-aizawl' | 'aizawl-saiha'>('saiha-aizawl');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [utr, setUtr] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [isSending, setIsSending] = useState(false);

  const seats = Array.from({ length: 10 }, (_, i) => i + 1);
  const price = 1500;
  const total = selectedSeats.length * price;

  const toggleSeat = (n: number) => {
    setSelectedSeats(prev => prev.includes(n) ? prev.filter(s => s !== n) : [...prev, n]);
  };

  const handleBooking = async () => {
    if (!form.name || !form.phone || !utr) {
      alert('Name, Phone leh UTR dah vek rawh!');
      return;
    }
    setIsSending(true);
    const newId = 'SUMO' + Date.now().toString().slice(-6);
    setBookingId(newId);

    // 1. Telegram Auto Send
    try {
      await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          seats: selectedSeats,
          total,
          bookingId: newId,
          utr,
          route: route === 'saiha-aizawl' ? 'Saiha → Aizawl' : 'Aizawl → Saiha',
          date
        })
      });
    } catch (e) {
      console.log('Telegram failed, but continue');
    }

    // 2. WhatsApp 1-click backup
    const msg = `NEW BOOKING%0AID:${newId}%0ARoute:${route}%0ADate:${date}%0ASeats:${selectedSeats.join(',')}%0ATotal:Rs.${total}%0AName:${form.name}%0APhone:${form.phone}%0AUTR:${utr}`;
    window.open(`https://wa.me/919362600601?text=${msg}`, '_blank');

    setIsSending(false);
    setStep('success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">SUMO BOOKING</h1>
            <p className="text-sm text-gray-600">Saiha ↔ Aizawl • Daily Service</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">Rs. {price}/seat</p>
            <p className="text-xs text-green-600">✓ Telegram Auto Active</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Route Selector */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex gap-3">
          <button 
            onClick={() => setRoute('saiha-aizawl')}
            className={`flex-1 py-3 rounded-lg font-bold ${route === 'saiha-aizawl' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Saiha → Aizawl
          </button>
          <button 
            onClick={() => setRoute('aizawl-saiha')}
            className={`flex-1 py-3 rounded-lg font-bold ${route === 'aizawl-saiha' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Aizawl → Saiha
          </button>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)}
            className="px-3 py-3 border rounded-lg"
          />
        </div>

        {step === 'seats' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Seat Thlang rawh - {selectedSeats.length} thlan</h2>
            <div className="grid grid-cols-4 gap-3 mb-6 max-w-sm mx-auto">
              <div className="col-span-4 text-center text-xs text-gray-500 mb-2">DRIVER</div>
              {seats.map(n => (
                <button
                  key={n}
                  onClick={() => toggleSeat(n)}
                  className={`h-14 rounded-lg font-bold border-2 ${selectedSeats.includes(n) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 hover:border-blue-400'}`}
                >
                  {n}
                </button>
              ))}
            </div>
            {selectedSeats.length > 0 && (
              <div className="border-t pt-4">
                <p className="font-bold">Seats: {selectedSeats.join(', ')} • Total: Rs.{total}</p>
                <button onClick={() => setStep('details')} className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-bold">
                  Next - Details →
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'details' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Details</h2>
            <input placeholder="Hming" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-3 rounded-lg mb-3" />
            <input placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border p-3 rounded-lg mb-3" />
            <input placeholder="Email (optional)" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border p-3 rounded-lg mb-3" />
            <div className="flex gap-3">
              <button onClick={() => setStep('seats')} className="flex-1 border py-3 rounded-lg">Back</button>
              <button onClick={() => setStep('payment')} disabled={!form.name || !form.phone} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold disabled:bg-gray-300">
                Payment →
              </button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Payment - Rs.{total}</h2>
            <div className="bg-blue-50 p-4 rounded-lg mb-4 text-center">
              <p className="font-bold">UPI: doctorazyu@oksbi</p>
              <p className="text-sm">Amount: Rs.{total}</p>
              <p className="text-xs text-gray-600 mt-2">QR Code hmangin emaw UPI ID hmangin pe rawh</p>
            </div>
            <input placeholder="UTR / Transaction ID dah rawh" value={utr} onChange={e => setUtr(e.target.value)} className="w-full border p-3 rounded-lg mb-4" />
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4 text-sm">
              <p>✓ Pay zawh ah UTR dah la</p>
              <p>✓ Telegram ah a thleng nghal ang!</p>
              <p>✓ WhatsApp backup a in hawng ang</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('details')} className="flex-1 border py-3 rounded-lg">Back</button>
              <button onClick={handleBooking} disabled={isSending || !utr} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold disabled:bg-gray-300">
                {isSending ? 'Sending...' : 'Payment Done ✓'}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Booking Success!</h2>
            <p className="font-mono bg-gray-100 p-2 rounded mb-4">{bookingId}</p>
            <p className="text-sm mb-2">Seats: {selectedSeats.join(', ')} • Rs.{total}</p>
            <p className="text-sm text-green-600 font-bold">✓ Telegram ah thawn a ni ta - 9362600601</p>
            <p className="text-sm text-blue-600">✓ WhatsApp a in hawng tawh - SEND hmet rawh</p>
            <button onClick={() => { setStep('seats'); setSelectedSeats([]); setUtr(''); }} className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-bold">
              New Booking
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
