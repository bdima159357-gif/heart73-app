// ======================================
// HEART73 • Register v3
// Part 1
// ======================================

const sb = window.sb;

const form = document.getElementById("registerForm");

const notify = document.getElementById("notify");

const button = document.getElementById("registerButton");

// ======================================
// Красивые уведомления
// ======================================

function showError(text){

    notify.className="notify error";

    notify.innerHTML=text;

    button.disabled=false;

    button.innerHTML="Создать аккаунт";

}

function showSuccess(text){

    notify.className="notify success";

    notify.innerHTML=text;

}

function clearNotify(){

    notify.className="notify";

    notify.innerHTML="";

}

// ======================================
// Маска телефона
// ======================================

function formatPhone(input){

    let numbers=input.value.replace(/\D/g,"");

    if(numbers.startsWith("8")){

        numbers="7"+numbers.substring(1);

    }

    if(numbers.length>0 && !numbers.startsWith("7")){

        numbers="7"+numbers;

    }

    numbers=numbers.substring(0,11);

    let value="";

    if(numbers.length){

        value="+7";

    }

    if(numbers.length>1){

        value+=" ("+numbers.substring(1,4);

    }

    if(numbers.length>=4){

        value+=") "+numbers.substring(4,7);

    }

    if(numbers.length>=7){

        value+="-"+numbers.substring(7,9);

    }

    if(numbers.length>=9){

        value+="-"+numbers.substring(9,11);

    }

    input.value=value;

}

window.formatPhone=formatPhone;

// ======================================
// Регистрация
// ======================================

form.addEventListener("submit",register);

async function register(e){

    e.preventDefault();

    clearNotify();

    button.disabled=true;

    button.innerHTML="Создаем аккаунт...";

    const name=

        document

        .getElementById("name")

        .value

        .trim();

    const phone=

        document

        .getElementById("phone")

        .value

        .trim();

    const email=

        document

        .getElementById("email")

        .value

        .trim()

        .toLowerCase();

    const password=

        document

        .getElementById("password")

        .value;

    const password2=

        document

        .getElementById("password2")

        .value;

    const agree=

        document

        .getElementById("agree")

        .checked;

    const phoneDigits=

        phone.replace(/\D/g,"");

    // =======================
    // Проверки
    // =======================

    if(name.length<3){

        return showError(

            "Введите имя полностью."

        );

    }

    if(phoneDigits.length!==11){

        return showError(

            "Введите корректный номер телефона."

        );

    }

    if(!email.includes("@")){

        return showError(

            "Введите корректный Email."

        );

    }

    if(password.length<6){

        return showError(

            "Пароль должен содержать минимум 6 символов."

        );

    }

    if(password!==password2){

        return showError(

            "Пароли не совпадают."

        );

    }

    if(!agree){

        return showError(

            "Необходимо принять условия обработки персональных данных."

        );

    }

    // =======================
    // Cloudflare Turnstile
    // =======================

    const token=

        document.querySelector(

            "[name='cf-turnstile-response']"

        )?.value;

    if(!token){

        return showError(

            "Подтвердите, что вы не робот."

        );

    }

    // ======= ПРОДОЛЖЕНИЕ В ЧАСТИ 2 =======

        // =======================
    // Проверка Turnstile
    // =======================

    try{

        const verify = await fetch(

            API_URL + "/api/turnstile",

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify({

                    token

                })

            }

        );

        const verifyResult = await verify.json();

        if(!verifyResult.success){

            return showError(

                "Не удалось пройти проверку Cloudflare."

            );

        }

    }catch(err){

        console.error(err);

        return showError(

            "Ошибка соединения с сервером."

        );

    }

    // =======================
    // Регистрация Supabase
    // =======================

    const {

        data,

        error

    } = await sb.auth.signUp({

        email,

        password

    });

    if(error){

        return showError(

            error.message

        );

    }

    // =======================
    // Создание профиля
    // =======================

    if(data.user){

        const {

            error:profileError

        } = await sb

            .from("profiles")

            .insert({

                id:data.user.id,

                full_name:name,

                phone:phone,

                role:"patient"

            });

        if(profileError){

            console.error(profileError);

        }

    }

    showSuccess(

        "🎉 Аккаунт успешно создан.<br><br>Сейчас откроется страница входа."

    );

    button.innerHTML="Успешно!";

    setTimeout(()=>{

        location.href="login.html";

    },1800);

}

// =======================
// Enter
// =======================

document

.querySelectorAll("input")

.forEach(input=>{

    input.addEventListener(

        "keydown",

        e=>{

            if(

                e.key==="Enter"

            ){

                e.preventDefault();

                form.requestSubmit();

            }

        }

    );

});