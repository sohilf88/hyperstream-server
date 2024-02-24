const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select:false, //this is used to hide from response
    },
  },
  {
    timestamps: true,
  }
);
// static method for signup function
userSchema.statics.signup = async function (email, password) {
  // validate the email and password feild with below
  if (!email || !password) {
    throw Error("All feilds required");
  }
  if (!validator.isEmail(email)) {
    throw Error("invalid email address");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error(
      "Minimum length 8 => password must contain Uppercase,Lowercase,Special charecter and Number"
    );
  }

  const exists = await this.findOne({ email });

  if (exists) {
    throw Error("Email Address was Already in Use");
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  // create document with email and has password
  const User = await this.create({ email: email, password: hashPassword });
  return User;
};

// static method for login user

userSchema.statics.login = async function (email, password) {
  // check for both feilds
  if (!email || !password) {
    throw Error("All feilds required");
  }
  // check email is valid id or not
  if (!validator.isEmail(email)) {
    throw Error("invalid email address");
  }
  // check email id present in database
  // todo! need to change later error message for invalid user and password

  const checkUserAccountInDB = await this.findOne({ email });
  if (!checkUserAccountInDB) {
    throw Error("Invalid User Account or No account Found");
  }
  // compare user sent password with databse password
  const comparePassword = await bcrypt.compare(
    password,
    checkUserAccountInDB.password
  );
  if (!comparePassword) {
    throw Error("Invalid password");
  }
  return checkUserAccountInDB;
};

module.exports = mongoose.model("user", userSchema);
