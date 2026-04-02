import { useState } from "react";
import { BASE_URL } from "../utils/constants";
import { useEffect } from "react";

const Premium = () => {
  const [isPremium, setIsPremium] = useState(false);

  const verifyPremiumStatus = async () => {
    const res = await fetch(BASE_URL + "/verify/isPremium", {
      credentials: "include"
    });
    const json = await res.json();

    if (json.isPremium) {
      setIsPremium(true);
    }
  }

  useEffect(() => {
    verifyPremiumStatus();
  }, []);

  const buyMembership = async (membershipType) => {
    const res = await fetch(BASE_URL + "/payment/create", {
      body: JSON.stringify({ membershipType }),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const order = await res.json();
    console.log(order);

    const { amount, notes, currency, order_id } = order.data;

    const options = {
      key: order.keyId,
      amount,
      currency,
      order_id,
      prefill: {
        name: notes.firstName + " " + notes.lastName,
        email: notes.email,
      },
      theme: {
        color: "#F37254",
      },
      handler: verifyPremiumStatus
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  if (isPremium) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
        <div className="text-6xl mb-4 animate-float">👑</div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Premium Member</h1>
        <p className="text-slate-400">You&apos;re enjoying all premium benefits!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-4 animate-fade-in-up">
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">💎</div>
        <h1 className="text-4xl font-bold gradient-text mb-2">Go Premium</h1>
        <p className="text-slate-400">Unlock the full DevTinder experience</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Silver Card */}
        <div className="glass-card rounded-2xl p-8 gradient-border group hover:scale-[1.02] transition-all duration-300">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
              style={{ background: 'linear-gradient(135deg, #94a3b8, #64748b)' }}
            >
              <span className="text-2xl">🥈</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Silver</h2>
            <p className="text-slate-400 text-sm mt-1">Great for getting started</p>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-2 text-slate-300 text-sm">
              <span className="text-emerald-400">✓</span> 100 connection requests per day
            </li>
            <li className="flex items-center gap-2 text-slate-300 text-sm">
              <span className="text-emerald-400">✓</span> 1000 messages per day
            </li>
            <li className="flex items-center gap-2 text-slate-300 text-sm">
              <span className="text-emerald-400">✓</span> Blue tick for 1 year
            </li>
          </ul>

          <button
            onClick={() => buyMembership("silver")}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all border-0"
            style={{
              background: 'linear-gradient(135deg, #94a3b8, #64748b)',
            }}
            onMouseOver={(e) => { e.target.style.boxShadow = '0 0 20px rgba(148,163,184,0.4)'; e.target.style.transform = 'translateY(-1px)' }}
            onMouseOut={(e) => { e.target.style.boxShadow = 'none'; e.target.style.transform = 'translateY(0)' }}
          >
            Get Silver →
          </button>
        </div>

        {/* Gold Card */}
        <div className="relative glass-card rounded-2xl p-8 gradient-border group hover:scale-[1.02] transition-all duration-300">
          {/* Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="px-4 py-1 rounded-full text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            >
              ⭐ MOST POPULAR
            </span>
          </div>

          <div className="text-center mb-6 mt-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            >
              <span className="text-2xl">🥇</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Gold</h2>
            <p className="text-slate-400 text-sm mt-1">For power networkers</p>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-2 text-slate-300 text-sm">
              <span className="text-emerald-400">✓</span> Unlimited connection requests
            </li>
            <li className="flex items-center gap-2 text-slate-300 text-sm">
              <span className="text-emerald-400">✓</span> 10,000 messages per day
            </li>
            <li className="flex items-center gap-2 text-slate-300 text-sm">
              <span className="text-emerald-400">✓</span> Blue tick for 2 years
            </li>
          </ul>

          <button
            onClick={() => buyMembership("gold")}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all border-0"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            }}
            onMouseOver={(e) => { e.target.style.boxShadow = '0 0 20px rgba(245,158,11,0.4)'; e.target.style.transform = 'translateY(-1px)' }}
            onMouseOut={(e) => { e.target.style.boxShadow = 'none'; e.target.style.transform = 'translateY(0)' }}
          >
            Get Gold →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Premium