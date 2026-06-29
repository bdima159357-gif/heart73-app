// =============================
// Heart73 Authentication
// =============================

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// ----------------------------
// Проверка сессии
// ----------------------------

document.addEventListener("DOMContentLoaded", async () => {

    const { data } = await supabase.auth.getSession();

    if (!data.session) return;

    const page = location.pathname;

    if (page.includes("login") || page.includes("register")) {

        location.href = "../patient/dashboard.html";

    }

});

// ----------------------------
// Регистрация
// ----------------------------

async function register(email,password){

    const {data,error} = await supabase.auth.signUp({

        email:email,
        password:password

    });

    if(error){

        alert(error.message);
        return false;

    }

    alert("Аккаунт создан.\nПроверьте электронную почту.");

    location.href="login.html";

}

// ----------------------------
// Вход
// ----------------------------

async function login(email,password){

    const {error}=await supabase.auth.signInWithPassword({

        email:email,
        password:password

    });

    if(error){

        alert(error.message);
        return false;

    }

    location.href="../patient/dashboard.html";

}

// ----------------------------
// Выход
// ----------------------------

async function logout(){

    await supabase.auth.signOut();

    location.href="../login.html";

}

// ----------------------------
// Пользователь
// ----------------------------

async function currentUser(){

    const {data}=await supabase.auth.getUser();

    return data.user;

}
