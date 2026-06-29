// =====================================
// Сердце под защитой
// Кабинет пациента
// =====================================

const sb = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

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
    const { data: profile } = await sb
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

    if (profile) {

        document.getElementById("patientName").textContent =
            profile.full_name;

        document.getElementById("welcomeName").textContent =
            profile.full_name;

        document.getElementById("avatar").textContent =
            profile.full_name.substring(0,1).toUpperCase();

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

// ----------------------
// Пока заглушки
// ----------------------

document
.getElementById("chatBtn")
.addEventListener("click",()=>{

    alert("Следующий этап — подключение оплаты ЮKassa.");

});

document
.getElementById("videoBtn")
.addEventListener("click",()=>{

    alert("Следующий этап — подключение оплаты ЮKassa.");

});
