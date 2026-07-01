// =======================================
// Heart73 Chat
// =======================================

const urlParams = new URLSearchParams(window.location.search);

const consultationId = Number(urlParams.get("consultation"));

const messagesDiv = document.getElementById("messages");

const fileInput =
    document.getElementById("fileInput");

const fileButton =
    document.getElementById("fileButton");

const selectedFile =
    document.getElementById("selectedFile");

fileButton.onclick=()=>{

    fileInput.click();

};

fileInput.onchange=()=>{

    if(fileInput.files.length){

        selectedFile.textContent=
            fileInput.files[0].name;

    }else{

        selectedFile.textContent=
            "Файл не выбран";

    }

};

let currentUserId = null;

const CHAT_ROLE = window.CHAT_ROLE || "patient";

document.getElementById("backButton").onclick = () => {

    history.back();

};

document.addEventListener("DOMContentLoaded", async () => {

    const {
        data: { session }
    } = await sb.auth.getSession();

    if (!session) {

        location.href = "login.html";

        return;

    }

    currentUserId = session.user.id;

    document.getElementById("chatStatus").textContent =
        "Консультация №" + consultationId;

    await loadMessages();

    subscribeMessages();

});

// ======================
// Загрузка сообщений
// ======================

async function loadMessages() {

    const { data, error } = await sb

        .from("messages")

        .select("*")

        .eq("consultation_id", consultationId)

        .order("created_at", {

            ascending: true

        });

    if (error) {

        console.error(error);

        return;

    }

    messagesDiv.innerHTML = "";

    data.forEach(drawMessage);

    scrollBottom();

}

// ======================
// Отрисовка сообщения
// ======================

function drawMessage(message) {

    const div = document.createElement("div");

    div.classList.add("message");

    if (message.sender_role === "doctor") {

    div.classList.add("doctor");

} else {

    div.classList.add("patient");

}

    const date = new Date(message.created_at);

    let html = `

        <div class="message-text">

            ${escapeHtml(message.message || "")}

        </div>

    `;

    // ---------- Если прикреплен файл ----------

    if (message.file_url) {

        const isImage =
            /\.(jpg|jpeg|png|gif|webp)$/i.test(message.file_name);

        if (isImage) {

            html += `

                <div class="message-image">

                    <img
                        src="${message.file_url}"
                        alt="${message.file_name}">

                </div>

            `;

        } else {

            html += `

                <div class="message-file">

                    📎
                    <a
                        href="${message.file_url}"
                        target="_blank">

                        ${message.file_name}

                    </a>

                </div>

            `;

        }

    }

    html += `

        <div class="message-time">

            ${date.toLocaleDateString("ru-RU")}
            ${date.toLocaleTimeString("ru-RU",{
                hour:"2-digit",
                minute:"2-digit"
            })}

        </div>

    `;

    div.innerHTML = html;

    messagesDiv.appendChild(div);

}

// ======================
// Отправка сообщения
// ======================

document.getElementById("sendButton").onclick = sendMessage;

document
    .getElementById("messageInput")
    .addEventListener("keydown", function(e){

        if(e.key==="Enter" && !e.shiftKey){

            e.preventDefault();

            sendMessage();

        }

    });

async function sendMessage() {

    const input = document.getElementById("messageInput");

    const text = input.value.trim();

    let fileUrl = null;
    let fileName = null;

    // ---------- Загрузка файла ----------
    if (fileInput.files.length > 0) {

        const file = fileInput.files[0];

        fileName = file.name;

        const extension = file.name.split(".").pop();

const path =
    consultationId +
    "/" +
    crypto.randomUUID() +
    "." +
    extension;

        const { error: uploadError } = await sb.storage

            .from("documents")

            .upload(path, file);

        if (uploadError) {

            console.error(uploadError);

            alert("Ошибка загрузки файла");

            return;

        }

    const publicUrl = sb.storage
    .from("documents")
    .getPublicUrl(path);

fileUrl = publicUrl.data.publicUrl;

    }

    // Если нет ни текста, ни файла — ничего не отправляем
    if (!text && !fileUrl) return;

    const { error } = await sb

    .from("messages")

    .insert({

        consultation_id: consultationId,

        sender_id: currentUserId,

        sender_role: CHAT_ROLE,

        message: text,

        file_url: fileUrl,

        file_name: fileName

    });

    if (error) {

        console.error(error);

        alert("Ошибка отправки.");

        return;

    }

    input.value = "";

    fileInput.value = "";

    selectedFile.textContent = "Файл не выбран";

}

// ======================
// Realtime
// ======================

function subscribeMessages(){

    sb.channel("chat-" + consultationId)

        .on(

            "postgres_changes",

            {

                event:"INSERT",

                schema:"public",

                table:"messages",

                filter:
                    "consultation_id=eq." + consultationId

            },

            payload=>{

                drawMessage(payload.new);

                scrollBottom();

            }

        )

        .subscribe();

}

// ======================
// Автоскролл
// ======================

function scrollBottom(){

    messagesDiv.scrollTop =
        messagesDiv.scrollHeight;

}

// ======================
// Защита HTML
// ======================

function escapeHtml(text){

    return text

        .replace(/&/g,"&amp;")

        .replace(/</g,"&lt;")

        .replace(/>/g,"&gt;")

        .replace(/"/g,"&quot;")

        .replace(/'/g,"&#039;");

}