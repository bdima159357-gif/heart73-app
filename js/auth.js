// ======================================
// Сердце под защитой
// Авторизация
// ======================================

// Создаем клиент Supabase
const sb = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

document.addEventListener("DOMContentLoaded", () => {

    // ======================================
    // ВХОД
    // ======================================

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", async (e) => {

            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            const { error } = await sb.auth.signInWithPassword({

                email,
                password

            });

            if (error) {

                alert(error.message);
                return;

            }

            location.href = "patient.html";

        });

    }

    // ======================================
    // РЕГИСТРАЦИЯ
    // ======================================

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {

        registerForm.addEventListener("submit", async (e) => {

            e.preventDefault();

            const name = document.getElementById("name").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const password2 = document.getElementById("password2").value;

            if (password !== password2) {

                alert("Пароли не совпадают.");
                return;

            }

          const { data, error } = await sb.auth.signUp({

    email,

    password,

    options: {

        data: {

            full_name: name,

            phone: phone

        }

    }

});

            if (error) {

                alert(error.message);
                return;

            }
                if (profileError) {

                    console.error(profileError);

                }

            }

            alert("Аккаунт успешно создан!");

            location.href = "login.html";

        });

    }

    // ======================================
    // КНОПКА РЕГИСТРАЦИИ
    // ======================================

    const registerLink = document.getElementById("register");

    if (registerLink) {

        registerLink.addEventListener("click", (e) => {

            e.preventDefault();

            location.href = "register.html";

        });

    }

});
