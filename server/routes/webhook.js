const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();

const sb = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

router.post("/", async (req, res) => {

    try {

        const event = req.body.event;

        if (event !== "payment.succeeded") {
            return res.sendStatus(200);
        }

        const payment = req.body.object;

        // Обновляем платеж
        const { error: paymentError } = await sb
            .from("payments")
            .update({
                status: "paid",
                paid_at: new Date().toISOString()
            })
            .eq("yookassa_payment_id", payment.id);

        if (paymentError) {
            console.error(paymentError);
        }

        // Получаем consultation_id
        const { data: paymentRow } = await sb
            .from("payments")
            .select("consultation_id")
            .eq("yookassa_payment_id", payment.id)
            .single();

        if (paymentRow) {

            await sb
                .from("consultations")
                .update({
                    status: "paid"
                })
                .eq("id", paymentRow.consultation_id);

        }

        console.log("✅ Оплата подтверждена:", payment.id);

        res.sendStatus(200);

    } catch (err) {

        console.error(err);

        res.sendStatus(500);

    }

});

module.exports = router;