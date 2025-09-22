const express = require("express");
const helmet = require('helmet');
const cors = require("cors");
require("dotenv").config();
const userAuth = require("./routes/userAuthRoutes.js");
const userProfileRoute = require("./routes/userProfile/profileRoute.js");
const termsAndConditionRoute = require("./routes/userProfile/terms&ConditionRoute.js");
const createUserRoute = require("./routes/admin/adminRoute.js");
const masterAddingRoute = require("./routes/Master/addMasterRoute.js");
const addquotationRoute = require("./routes/quotation/quotationRoute.js");
const quotationStatus = require("./routes/quotation/quotationStatusRoute.js");
const masterEditingRoute = require("./routes/Master/editmasterRouter.js");
const masterDeletingRoute = require("./routes/Master/deletemasterRoute.js");
const masterGetRoute = require("./routes/Master/getMasterRoute.js");
const repairInquiryRoute = require("./routes/repair/inquiryRoute.js");
const repairInquiryStatusRoute = require("./routes/repair/inquiryStatusRoute.js");
const repairRoute = require("./routes/repair/repairRoute.js");
const repairStatusRoute = require("./routes/repair/repairStatusRoute.js");
const checkExistingCustomer = require("./utils/checkExistingCustomer.js");
const customer = require("./routes/customerRoute.js");
const refreshToken = require("./routes/refreshTokenRouter.js");
const invoiceRoute = require("./routes/invoice/invoiceRoute.js");
const invoiceStatusRoute = require("./routes/invoice/invoiceStatusRoute.js");
const purchaseRoute = require("./routes/purchaseRoute.js");
const paymentRoute = require("./routes/invoice/paymentRoute.js");
const searchRoute = require("./routes/searchroute.js");
const exportToExcelRoute = require("./routes/exportToExcelRoute.js");
const userDashboardRoute = require("./routes/dashboard/userDashboardRoute.js");

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Backend is running!");
});


app.use("/auth",userAuth);
app.use("/create-user",createUserRoute);
app.use("/refresh",refreshToken);

app.use("/profile",userProfileRoute);
app.use("/terms&Condition",termsAndConditionRoute)

app.use("/quotation",addquotationRoute);
app.use("/quotation-status",quotationStatus);

app.use("/master-add",masterAddingRoute);
app.use("/master-edit",masterEditingRoute);
app.use("/master-delete",masterDeletingRoute);
app.use("/master-view",masterGetRoute);

app.use("/repair-inquiry",repairInquiryRoute);
app.use("/repair-inquiry-status",repairInquiryStatusRoute);
app.use("/repairs",repairRoute);
app.use("/repair-status",repairStatusRoute);

app.use("/check-customer",checkExistingCustomer);
app.use("/customer",customer);

app.use("/invoice",invoiceRoute);
app.use("/invoice-status",invoiceStatusRoute)
app.use("/invoice-payment/",paymentRoute);

app.use("/purchase",purchaseRoute);

app.use("/search",searchRoute);

app.use("/export",exportToExcelRoute);

app.use("/dashboard",userDashboardRoute);



const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));
