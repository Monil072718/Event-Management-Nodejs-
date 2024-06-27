require("dotenv").config({ path: "./config.env" })
require("./db/conn");
const express = require("express");
const path = require('path');
const userroutes = require("./Router/User/userRoutes");
const router = require("./Router/Admin/adminRoutes");
const bodyParser = require("body-parser");
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use("/user", userroutes);
app.use("/admin", router);
userroutes.use(express.static('public'));
app.use((req, res) => {
    res.status(404).json({
        message: 'Oops! Invalid Method!'
    })
})


app.listen(port, () => {
    console.log(`your listining port on ${port}`);
})