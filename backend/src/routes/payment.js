const express = require("express")
const paymentRouter = express.Router()
const { userAuth } = require("../middlewares/auth");
const razorpayInstance = require("../utils/razorpay")
const Payment = require("../models/payment");
const User = require("../models/user")
const crypto = require("crypto");

const { membershipAmount } = require("../utils/constants");

const { validateWebhookSignature } = require("razorpay/dist/utils/razorpay-utils")


paymentRouter.post("/payment/create", userAuth, async (req, res) => {
    const { firstName, lastName, email } = req.user;
    const { membershipType } = req.body;

    if (!membershipType || !membershipAmount[membershipType]) {
        return res.status(400).json({ error: "Invalid membership type" });
    }

    try {
        const order = await razorpayInstance.orders.create({
            amount: membershipAmount[membershipType] * 100,
            currency: "INR",
            notes: {
                firstName,
                lastName: lastName || "",
                email,
                membershipType
            }
        });

        const payment = new Payment({
            amount: order.amount,
            currency: order.currency,
            notes: order.notes,
            order_id: order.id,
            status: order.status,
            user_id: req.user._id
        })

        const savedPayment = await payment.save();

        res.json({ data: savedPayment, keyId: process.env.RAZORPAY_KEY_ID });
    }
    catch (err) {
        console.error("Payment create error:", err.message || err);
        res.status(500).json({ error: err.message || "Failed to create payment order" });
    }
})

// Client-side payment verification (industry standard)
paymentRouter.post("/payment/verify", userAuth, async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({ msg: "Missing payment verification fields" });
        }

        // Verify signature using HMAC SHA256
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ msg: "Payment verification failed — invalid signature" });
        }

        // Signature valid — update payment record
        const payment = await Payment.findOne({ order_id: razorpay_order_id });
        if (!payment) {
            return res.status(404).json({ msg: "Payment record not found" });
        }

        payment.status = "captured";
        payment.payment_id = razorpay_payment_id;
        await payment.save();

        // Mark user as premium
        const user = await User.findById(payment.user_id);
        if (user) {
            user.isPremium = true;
            user.membershipType = payment.notes.membershipType;
            await user.save();
        }

        res.json({ msg: "Payment verified successfully", isPremium: true });
    } catch (err) {
        console.error("Payment verification error:", err);
        res.status(500).json({ msg: "Internal error during payment verification" });
    }
})

paymentRouter.post("/payment/webhook", async (req, res) => {
    const webhookSignature = req.get("X-Razorpay-Signature");

    if (!webhookSignature) {
        return res.status(400).json({ msg: "Missing signature header" });
    }

    try {
        const isWebhookValid = validateWebhookSignature(JSON.stringify(req.body),
            webhookSignature,
            process.env.RAZORPAY_WEBHOOK_SECRET
        );

        if (!isWebhookValid) {
            return res.status(400).json({ msg: "Invalid webhook signature" });
        }

        const paymentDetails = req.body.payload.payment.entity;

        const payment = await Payment.findOne({ order_id: paymentDetails.order_id });
        payment.status = paymentDetails.status;
        await payment.save();

        if (payment.status === "captured") {
            const user = await User.findById(payment.user_id);
            if (user) {
                user.isPremium = true;
                user.membershipType = payment.notes.membershipType;
                await user.save();
            }
        }
        console.log("Webhook processed — user updated");

        res.status(200).json({ msg: "Webhook processed" });
    }

    catch (err) {
        return res.status(500).json({ msg: "Internal error" })
    }
})

paymentRouter.get("/verify/isPremium", userAuth, async (req, res)=>{
    const user = req.user.toJSON(); // important
    if (user.isPremium) {
        return res.json({ isPremium: true, membershipType: user.membershipType || "" });
    }
    return res.json({ isPremium: false });
})

module.exports = paymentRouter