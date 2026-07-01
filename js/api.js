// =========================
// Heart73 API
// =========================

async function apiPost(url, data) {

    const response = await fetch(`${API_URL}${url}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    return response.json();

}

const api = {

    async createPayment(data) {

        return apiPost("/api/payment/create", data);

    }

};