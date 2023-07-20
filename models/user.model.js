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
    },
  },
  {
    timestamps: true,
  }
);

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

module.exports = mongoose.model("user", userSchema);
