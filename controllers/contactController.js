const asyncHandler = require("express-async-handler");

const getContact = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "Get all contacts",
  });
});

const getContacts = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: `Get contact for ${req.params.id}`,
  });
});

const createContact = asyncHandler(async (req, res) => {
  //   console.log("The request body is: ", req.body);
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    res.status(400);
    throw new Error("All fields are compulsory");
  }
  res.status(200).json({
    message: "Create Contacts",
  });
});

const updateContact = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: `Update contact for ${req.params.id}`,
  });
});

const deleteContact = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: `Delete contact for ${req.params.id}`,
  });
});

module.exports = {
  getContact,
  getContacts,
  createContact,
  updateContact,
  deleteContact,
};
