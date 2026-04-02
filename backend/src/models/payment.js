const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String
    },
    entity: {
        type: String
    },
    notes: {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        membershipType: {
            type: String,
            required: true
        }
    },
    order_id: {
        type: String,
        required: true
    },
    payment_id: {
        type: String
    },
    status: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {timestamps: true})

module.exports = new mongoose.model("Payment", paymentSchema)