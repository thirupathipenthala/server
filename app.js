const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require("http");
dotenv.config();
const app = express();
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//services
require('./dbService')

//routes
const authRoutes = require('./routes/authroute')
const apiRoutes = require('./routes/api')
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);

app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

app.set("port", process.env.PORT || 7000);

http.createServer(app).listen(app.get("port"), function () {
    console.log("port" + app.get("port"));
});