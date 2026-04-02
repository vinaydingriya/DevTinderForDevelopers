const express = require("express")
const paymentRouter = express.Router()
const { userAuth } = require("../middlewares/auth");
const razorpayInstance = require("../utils/razorpay")
const Payment = require("../models/payment");
const User = require("../models/user")

const { membershipAmount } = require("../utils/constants");

const { validateWebhookSignature } = require("razorpay/dist/utils/razorpay-utils")


paymentRouter.post("/payment/create", userAuth, async (req, res) => {
    const { firstName, lastName, email } = req.user;
    const { membershipType } = req.body;

    try {
        const order = await razorpayInstance.orders.create({
            amount: membershipAmount[membershipType] * 100,
            currency: "INR",
            notes: {
                firstName,
                lastName,
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
        console.log(err)
        res.status(500).send({ error: err });
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
        console.log("User updated");

        // if (req.body.event === "captured") {
        // }
        // if (req.body.event === "failed") {
        // }

        res.status(200).json({ msg: "Webhook processed" });
    }

    catch (err) {
        return res.status(500).json({ msg: "Internal error" })
    }
})

paymentRouter.get("/verify/isPremium", userAuth, async (req, res)=> {
    const user = req.user.toJSON(); // important
    if (user.isPremium) {
        return res.json({isPremium: true});
    }
    return res.json({isPremium: false});
})

module.exports = paymentRouter