const express = require("express");
const cors = require("cors");
require("dotenv").config();
const userAuth = require("./routes/userAuthRoutes.js");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Backend is running!");
});

app.use("/auth",userAuth);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));
