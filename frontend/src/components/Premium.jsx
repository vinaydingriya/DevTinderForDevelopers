import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";

const Premium = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [membershipType, setMembershipType] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const verifyPremiumStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/verify/isPremium");
      if (res.data.isPremium) {
        setIsPremium(true);
        setMembershipType(res.data.membershipType || "");
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyPremiumStatus();
  }, [verifyPremiumStatus]);

  const buyMembership = async (type) => {
    try {
      setPaymentLoading(true);

      // 1. Create order on backend
      const res = await api.post("/payment/create", { membershipType: type });
      const order = res.data;

      const { amount, notes, currency, order_id } = order.data;

      // 2. Ensure Razorpay SDK is loaded
      if (!window.Razorpay) {
        alert("Payment service is loading. Please try again in a moment.");
        setPaymentLoading(false);
        return;
      }

      // 3. Open Razorpay checkout with proper handler
      const options = {
        key: order.keyId,
        amount,
        currency,
        name: "DevTinder",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} Membership`,
        order_id: order_id,
        prefill: {
          name: notes.firstName + " " + notes.lastName,
          email: notes.email,
        },
        theme: {
          color: "#7c3aed",
        },
        handler: async function (response) {
          // 4. Verify payment on backend with signature
          try {
            await api.post("/payment/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            // Payment verified — refresh premium status
            await verifyPremiumStatus();
          } catch (err) {
            console.error("Payment verification failed:", err);
            alert("Payment verification failed. If amount was deducted, it will be refunded within 5-7 days. Please contact support.");
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
        setPaymentLoading(false);
      });

      rzp.open();
      setPaymentLoading(false);
    } catch (err) {
      console.error("Error creating order:", err);
      alert("Could not initiate payment. Please try again.");
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin inline-block" />
      </div>
    );
  }

  if (isPremium) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
        <div className="text-6xl mb-4 animate-float">👑</div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Premium Member</h1>
        <p className="text-slate-400">
          You&apos;re enjoying all {membershipType || "premium"} benefits!
        </p>
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
            disabled={paymentLoading}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #94a3b8, #64748b)',
            }}
            onMouseOver={(e) => { if (!paymentLoading) { e.target.style.boxShadow = '0 0 20px rgba(148,163,184,0.4)'; e.target.style.transform = 'translateY(-1px)' } }}
            onMouseOut={(e) => { e.target.style.boxShadow = 'none'; e.target.style.transform = 'translateY(0)' }}
          >
            {paymentLoading ? "Processing..." : "Get Silver →"}
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
            disabled={paymentLoading}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            }}
            onMouseOver={(e) => { if (!paymentLoading) { e.target.style.boxShadow = '0 0 20px rgba(245,158,11,0.4)'; e.target.style.transform = 'translateY(-1px)' } }}
            onMouseOut={(e) => { e.target.style.boxShadow = 'none'; e.target.style.transform = 'translateY(0)' }}
          >
            {paymentLoading ? "Processing..." : "Get Gold →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Premium