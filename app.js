const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require("body-parser");
const http = require("http");
const authRoutes = require('./routes/authroute')
dotenv.config();
const dbserver = require('./dbService')
const app = express();
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = ((req, res, next) => {
    logg.info("huasss tinchek");

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

app.use(cors());
app.use("/auth", authRoutes);
app.use((error, req, res, next) => {
    console.log("here")
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

app.set("port", process.env.PORT || 7000);
http.createServer(app).listen(app.get("port"), function () {
    console.log("port" + app.get("port"));
});