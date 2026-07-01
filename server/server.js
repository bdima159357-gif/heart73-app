// =======================================
// HEART73 SERVER
// =======================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const paymentRoutes = require("./routes/payment");
const webhookRoutes = require("./routes/webhook");

const app = express();

app.use(cors());
app.use(express.json());

// =======================================
// Главная
// =======================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        message: "Heart73 Server Started ❤️"

    });

});

// =======================================
// Проверка API
// =======================================

app.get("/api/test", (req, res) => {

    res.json({

        success: true,

        message: "API работает"

    });

});

// =======================================
// Cloudflare Turnstile
// =======================================

app.post("/api/turnstile", async (req, res) => {

    try {

        const { token } = req.body;

        if (!token) {

            return res.status(400).json({

                success: false,

                message: "Token отсутствует"

            });

        }

        const response = await axios.post(

            "https://challenges.cloudflare.com/turnstile/v0/siteverify",

            new URLSearchParams({

                secret: process.env.TURNSTILE_SECRET,

                response: token

            }),

            {

                timeout: 10000,

                headers: {

                    "Content-Type":
                        "application/x-www-form-urlencoded"

                }

            }

        );

        if (!response.data.success) {

            console.log("Turnstile failed");

            return res.json({

                success: false,

                errors: response.data["error-codes"]

            });

        }

        return res.json({

            success: true

        });

    } catch (err) {

        console.error("Turnstile Error");

        console.error(err.message);

        return res.status(500).json({

            success: false,

            message: "Ошибка проверки Turnstile"

        });

    }

});

// =======================================
// Маршруты
// =======================================

app.use("/api/payment", paymentRoutes);

app.use("/api/webhook", webhookRoutes);

// =======================================
// Запуск
// =======================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("================================");

    console.log(" HEART73 SERVER STARTED");

    console.log(" PORT:", PORT);

    console.log("================================");

});