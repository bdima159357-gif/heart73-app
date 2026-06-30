const sb = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

document.addEventListener("DOMContentLoaded", async () => {

    const {
        data: { session }
    } = await sb.auth.getSession();

    if (!session) {

        location.href = "login.html";
        return;

    }

    const { data, error } = await sb
        .from("consultations")
        .select("*")
        .eq("patient_id", session.user.id)
        .eq("status", "waiting_payment")
        .order("created_at", { ascending: false })
        .limit(1);

    if (error || data.length === 0) {

        document.getElementById("paymentInfo").innerHTML =
            "Нет консультаций для оплаты.";

        document.getElementById("payButton").style.display = "none";

        return;

    }

    const consultation = data[0];

    document.getElementById("paymentInfo").innerHTML = `

        <h2>${consultation.consultation_type}</h2>

        <p>Стоимость: <b>${consultation.amount} ₽</b></p>

        <p>Статус: ${consultation.status}</p>

    `;

    document.getElementById("payButton").onclick = () => {

        alert("Следующий этап — подключаем ЮKassa.");

    };

});
