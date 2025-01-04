const express = require("express");
const route = require('./routes/index')
const bodyParser = require('body-parser')
require('dotenv/config')
const db = require("./config/db");

const PORT = process.env.PORT;
const app = express();
const cookieParser = require("cookie-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(express.json())
app.use(route)

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
