const express = require("express");
const connectDb = require("./config/dbConnection");
const errorController = require("./controllers/errorController");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();
const routerContact = require("./routes/contactRoutes");
const routerUsers = require("./routes/userRoutes");
const port = process.env.PORT;
const app = express();

app.use(express.json());
app.use(errorHandler);
app.use("/api/contacts", routerContact);
app.use("/api/users", routerUsers);
connectDb();

app.all("*", (req, res, next) => {
  next(new Error(`The requested URL was not found on this server.`, 404));
});

app.use(errorController);

app.listen(port, () => {
  console.log(`We are live on port: ${port}`);
});
