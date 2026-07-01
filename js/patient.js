// =====================================
// Сердце под защитой
// Кабинет пациента
// =====================================

const sb = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("SB =", sb);

document.addEventListener("DOMContentLoaded", async () => {

    // Проверяем авторизацию
    const {
        data: { session }
    } = await sb.auth.getSession();

    if (!session) {

        location.href = "login.html";
        return;

    }

    // Загружаем профиль
    const { data, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", session.user.id);

console.log("Profile data:", data);
console.log("Profile error:", error);

const profile = data?.[0];

    if (profile) {

        document.getElementById("patientName").textContent =
            profile.full_name;

        document.getElementById("welcomeName").textContent =
            profile.full_name;

        document.getElementById("avatar").textContent =
            profile.full_name.substring(0,1).toUpperCase();

    }

// ======================================
// Загружаем консультации
// ======================================

const { data: consultations, error: consultationsError } = await sb
    .from("consultations")
    .select("*")
    .eq("patient_id", session.user.id)
    .order("created_at", { ascending: false });

if (!consultationsError && consultations) {

    const history = document.getElementById("historyList");

    history.innerHTML = "";

    if (consultations.length === 0) {

        history.innerHTML = `
            <div class="history-item">
                <div>
                    <h3>Пока обращений нет</h3>
                    <p>После оплаты консультации она появится здесь.</p>
                </div>

                <span class="status waiting">
                    Нет данных
                </span>
            </div>
        `;

    } else {

        consultations.forEach(item => {

            history.innerHTML += `

            <div class="history-item">

                <div>

                    <h3>${item.consultation_type}</h3>

                    <p>

                        ${new Date(item.created_at).toLocaleString("ru-RU")}

                    </p>

                </div>

                <span class="status ${item.status==="completed" ? "success" : "waiting"}">

                    ${item.status}

                </span>

            </div>

            `;

        });

    }

}
    
});

// ----------------------
// Выход
// ----------------------

document
.getElementById("logoutBtn")
.addEventListener("click", async ()=>{

    await sb.auth.signOut();

    location.href="login.html";

});


// ======================================
// Создание консультации
// ======================================

async function createConsultation(type, amount){

    const {
        data: { session }
    } = await sb.auth.getSession();

    if(!session){

        location.href="login.html";
        return;

    }

    const { error } = await sb
        .from("consultations")
        .insert({

            patient_id: session.user.id,

            consultation_type: type,

            amount: amount,

            status: "waiting_payment"

        });

    if(error){

        console.error(error);
        alert(error.message);
        return;

    }

    location.href = "payment.html";

}

// ---------------------------

document
.getElementById("chatBtn")
.addEventListener("click",()=>{

    createConsultation("Чат",500);

});

// ---------------------------

document
.getElementById("videoBtn")
.addEventListener("click",()=>{

    createConsultation("Видео",1000);

});
