// ====================================
// Сердце под защитой
// Авторизация
// ====================================

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    if(loginForm){

        loginForm.addEventListener("submit", loginUser);

    }

    const register = document.getElementById("register");

    if(register){

        register.addEventListener("click", function(e){

            e.preventDefault();

            location.href="register.html";

        });

    }

});

async function loginUser(e){

    e.preventDefault();

    const email=document.getElementById("email").value;

    const password=document.getElementById("password").value;

    const {error}=await supabase.auth.signInWithPassword({

        email,
        password

    });

    if(error){

        alert(error.message);

        return;

    }

    location.href="patient.html";

}
