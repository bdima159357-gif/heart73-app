require("dotenv").config();

const express = require("express");
const cors = require("cors");

const paymentRoutes = require("./routes/payment");

const app = express();

app.use(cors());
app.use(express.json());

// Главная страница
app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Heart73 Server Started ❤️"
    });

});

// Проверка API
app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "API работает"
    });

});

// Подключаем маршруты оплаты
app.use("/api/payment", paymentRoutes);

// Запуск сервера
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`✅ Server started on port ${PORT}`);

});