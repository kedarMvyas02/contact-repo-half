const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();
const router = require("./routes/contactRoutes");

const port = process.env.port;
const app = express();

app.use(express.json());
app.use("/api/contacts", router);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`We are live on port: ${port}`);
});
