const express = require("express");
const connectDb = require("./config/dbConnection");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();
const router = require("./routes/contactRoutes");
const port = process.env.port;
const app = express();
// mongodb://127.0.0.1:27017/contactsRecord

app.use(express.json());
app.use(errorHandler);
connectDb();
app.use("/api/contacts", router);

app.listen(port, () => {
  console.log(`We are live on port: ${port}`);
});
