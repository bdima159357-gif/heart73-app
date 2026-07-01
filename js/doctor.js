// ======================================
// HEART73 • Doctor Cabinet
// ======================================

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

    document.getElementById("doctorName").textContent =
        profile?.full_name || session.user.email;

    document.getElementById("logoutButton").onclick = async () => {

        await sb.auth.signOut();

        location.href = "login.html";

    };

    loadConsultations();

});

// ======================================

async function loadConsultations() {

    const list = document.getElementById("consultationsList");

    const { data, error } = await sb

        .from("consultations")

        .select(`
            *,
            patient:profiles!consultations_patient_id_fkey(
                full_name
            ),
            doctor:profiles!consultations_doctor_id_fkey(
                full_name
            )
        `)

        .order("created_at", {
            ascending: false
        });

    if (error) {

        console.error(error);

        list.innerHTML = "Ошибка загрузки.";

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

    data.forEach(c => {

        let statusText = "";
        let button = "";

        switch (c.status) {

            case "waiting_payment":

                statusText = "🟡 Ожидает оплаты";

                button = `
                    <button disabled>
                        Ожидается оплата
                    </button>
                `;

                break;

            case "paid":

                statusText = "🟢 Оплачено";

                button = `
                    <button
                        class="openChat"
                        data-id="${c.id}">
                        Открыть чат
                    </button>
                `;

                break;

            case "completed":

                statusText = "✅ Завершено";

                button = `
                    <button disabled>
                        Консультация завершена
                    </button>
                `;

                break;

            default:

                statusText = c.status;

                button = `
                    <button disabled>
                        ${c.status}
                    </button>
                `;

        }

        list.innerHTML += `

            <div class="card">

                <h3>${c.consultation_type}</h3>

                <p>

                    <b>Пациент:</b>

                    ${c.patient?.full_name || "Неизвестно"}

                </p>

                <p>

                    <b>Стоимость:</b>

                    ${c.amount} ₽

                </p>

                <p>

                    <b>Статус:</b>

                    ${statusText}

                </p>

                ${button}

            </div>

        `;

    });

    document.querySelectorAll(".openChat")

        .forEach(btn => {

            btn.onclick = () => {

                location.href =
`doctor-chat.html?consultation=${btn.dataset.id}`;

            };

        });

}