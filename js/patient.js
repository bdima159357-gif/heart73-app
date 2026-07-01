// =========================
// Heart73 Patient Cabinet
// =========================

document.addEventListener("DOMContentLoaded", async () => {

    const {
        data: { session }
    } = await sb.auth.getSession();

    if (!session) {
        location.href = "login.html";
        return;
    }

    const { data: profile } = await sb
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

    document.getElementById("patientName").textContent =
        profile?.full_name || session.user.email;

    document.getElementById("logoutButton").onclick = async () => {

        await sb.auth.signOut();

        location.href = "login.html";

    };

    loadConsultations(session.user.id);

});

async function loadConsultations(patientId) {

    const list = document.getElementById("consultationsList");

    list.innerHTML = `<div class="loading">Загрузка...</div>`;

    const { data, error } = await sb
        .from("consultations")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

    if (error) {

        console.error(error);

        list.innerHTML = `
            <div class="card">
                Не удалось загрузить консультации.
            </div>
        `;

        return;

    }

    if (!data || data.length === 0) {

        list.innerHTML = `
            <div class="card">
                Пока консультаций нет.
            </div>
        `;

        return;

    }

    list.innerHTML = "";

    data.forEach(consultation => {

        let icon = "💬";

        if (consultation.consultation_type === "Видео") {

            icon = "📹";

        }

        let status = "";
        let button = "";

        switch (consultation.status) {

            case "waiting_payment":

                status = `
                    <span class="status waiting">
                        🟡 Ожидает оплаты
                    </span>
                `;

                button = `
                    <button
                        class="payButton"
                        data-id="${consultation.id}"
                        data-amount="${consultation.amount}"
                        data-type="${consultation.consultation_type}">
                        💳 Оплатить
                    </button>
                `;

                break;

            case "paid":

                status = `
                    <span class="status success">
                        🟢 Оплачено
                    </span>
                `;

                button = `
                    <button
                        class="chatButton"
                        data-id="${consultation.id}">
                        💬 Открыть чат
                    </button>
                `;

                break;

            case "completed":

                status = `
                    <span class="status success">
                        ✅ Завершена
                    </span>
                `;

                button = `
                    <button
                        class="docButton"
                        data-id="${consultation.id}">
                        📄 Заключение
                    </button>
                `;

                break;

            default:

                status = `
                    <span class="status">
                        ${consultation.status}
                    </span>
                `;

        }

        list.innerHTML += `

            <div class="card">

                <h3>${icon} ${consultation.consultation_type}</h3>

                <p>

                    <strong>Стоимость:</strong>

                    ${consultation.amount} ₽

                </p>

                <p>

                    <strong>Статус:</strong>

                    ${status}

                </p>

                ${button}

            </div>

        `;

    });

    document.querySelectorAll(".payButton").forEach(btn => {

        btn.onclick = async () => {

            const user = await sb.auth.getUser();

            const result = await api.createPayment({

                consultation_id: Number(btn.dataset.id),

                amount: Number(btn.dataset.amount),

                description:
                    btn.dataset.type + " | Сердце под защитой",

                email: user.data.user.email

            });

            if (!result.success) {

                alert(result.message);

                return;

            }

            location.href = result.confirmation_url;

        };

    });

    document.querySelectorAll(".chatButton").forEach(btn => {

        btn.onclick = () => {

            location.href =
                `chat.html?consultation=${btn.dataset.id}`;

        };

    });

    document.querySelectorAll(".docButton").forEach(btn => {

        btn.onclick = () => {

            alert("Раздел заключений скоро появится.");

        };

    });

}