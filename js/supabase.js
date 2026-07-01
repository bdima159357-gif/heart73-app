// =========================
// Heart73 Supabase
// =========================

const sb = window.supabase.createClient(

    SUPABASE_URL,

    SUPABASE_KEY

);

// делаем клиент доступным во всех файлах

window.sb = sb;

console.log("SUPABASE CONNECTED");