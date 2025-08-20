const express = require("express");
const helmet = require('helmet');
const cors = require("cors");
require("dotenv").config();
const userAuth = require("./routes/userAuthRoutes.js");
const masterAddingRoute = require("./routes/Master/addMasterRoute.js");
const addquotationRoute = require("./routes/quotation/quotationRoute.js");
const quotationStatus = require("./routes/quotation/quotationStatusRoute.js");
const masterEditingRoute = require("./routes/Master/editmasterRouter.js");
const masterDeletingRoute = require("./routes/Master/deletemasterRoute.js");
const repairInquiryRoute = require("./routes/repair/inquiryRoute.js");
const repairInquiryStatusRoute = require("./routes/repair/inquiryStatusRoute.js")
const checkExistingCustomer = require("./utils/checkExistingCustomer.js");
const customer = require("./routes/customerRoute.js");
const refreshToken = require("./routes/refreshTokenRouter.js");

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Backend is running!");
});

app.use("/auth",userAuth);
app.use("/refresh",refreshToken)
app.use("/master-add",masterAddingRoute);
app.use("/quotation",addquotationRoute);
app.use("/quotation-status",quotationStatus);
app.use("/master-edit",masterEditingRoute);
app.use("/master-delete",masterDeletingRoute);
app.use("/repair-inquiry",repairInquiryRoute);
app.use("/repair-inquiry-status",repairInquiryStatusRoute);
app.use("/check-customer",checkExistingCustomer)
app.use("/customer",customer);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));
