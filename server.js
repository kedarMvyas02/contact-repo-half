const express = require("express");
const connectDb = require("./config/dbConnection");
const errorHandler = require("./middleware/errorHandler");
const validateToken = require("./middleware/validateTokenHandler");
const dotenv = require("dotenv").config();
const routerContact = require("./routes/contactRoutes");
const routerUsers = require("./routes/userRoutes");
const port = process.env.port;
const app = express();

app.use(express.json());
app.use(errorHandler);
connectDb();
app.use("/api/contacts", routerContact);
app.use("/api/users", validateToken, routerUsers);

app.listen(port, () => {
  console.log(`We are live on port: ${port}`);
});
