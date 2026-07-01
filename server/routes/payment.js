
const express = require("express");
const { YooCheckout } = require("@a2seven/yoo-checkout");
const { v4: uuidv4 } = require("uuid");

const { createClient } = require("@supabase/supabase-js");

const sb = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const router = express.Router();

console.log("=== PAYMENT ROUTE LOADED ===");

const checkout = new YooCheckout({
    shopId: process.env.YOOKASSA_SHOP_ID,
    secretKey: process.env.YOOKASSA_SECRET_KEY
});

router.post("/create", async (req, res) => {

    try {

       const {
    consultation_id,
    amount,
    description,
    email
} = req.body;

        const paymentRequest = {

            amount: {
                value: Number(amount).toFixed(2),
                currency: "RUB"
            },

            confirmation: {
                type: "redirect",
                return_url: "http://localhost:5500/pages/patient.html"
            },

            capture: true,

            description: description || "Консультация",

            receipt: {

                customer: {
                    email: email
                },

                items: [

                    {

                        description: description || "Консультация",

                        quantity: "1.00",

                        measure: "piece",

                        amount: {
                            value: Number(amount).toFixed(2),
                            currency: "RUB"
                        },

                        vat_code: 1,

                        payment_mode: "full_payment",

                        payment_subject: "service"

                    }

                ]

            },

            metadata: {
                consultation: uuidv4()
            }

        };

        console.log("========== REQUEST TO YOOKASSA ==========");
        console.dir(paymentRequest, { depth: null });
        console.log("=========================================");

        const payment = await checkout.createPayment(
            paymentRequest,
            uuidv4()
        );

        const { error: paymentError } = await sb
    .from("payments")
    .insert({

    consultation_id: consultation_id,

    yookassa_payment_id: payment.id,

    amount: Number(amount),

    status: "pending"

});

if (paymentError) {

    console.error("Ошибка сохранения платежа:");
    console.error(paymentError);

}

        console.log("========== YOOKASSA RESPONSE ==========");
        console.dir(payment, { depth: null });
        console.log("======================================");

        res.json({

            success: true,

            confirmation_url: payment.confirmation.confirmation_url,

            payment_id: payment.id

        });

    } catch (err) {

        console.log("========== YOOKASSA ERROR ==========");

        if (err.response) {

            console.dir(err.response.data, { depth: null });

        } else {

            console.error(err);

        }

        console.log("====================================");

        res.status(500).json({

            success: false,

            message: err.response?.data || err.message

        });

    }

});

module.exports = router;