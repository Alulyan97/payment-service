require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes");
const Merchant = require("./models/Merchant");

const app = express();
app.use(express.json());

// подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("MongoDB connected");
        
        // создание тестового продавца
        const existing = await Merchant.findOne({ merchantId: "test_merchant" });
        if (!existing) {
            await Merchant.create({
                merchantId: "test_merchant",
                secretKey: "test_secret_key_123",
                feePercent: 2.5
            });
            console.log("Создан тестовый продавец");
        }
    })
    .catch(err => console.error("MongoDB ошибка:", err));

app.use("/api", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});