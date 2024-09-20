const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const crypto = require("crypto")
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true,
      // validate: [validator.isBoolean, "invalid value,must be true or false"]
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "please provide valid E-mail id"]
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, //this is used to hide from response
      validate: [validator.isStrongPassword, "please use Strong password with min 8 charector"]
    },
    roles: {
      type: String,
      required: true,
      enum: ['user', 'admin', 'root'],
      //root is super admin
      default: "user"
    },
    confirmPassword: {
      type: String,
      required: true,
      validate: {
        validator: function (validPassword) {
          return validPassword === this.password
        },
        message: "password does not match"
      }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpire: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // if password modified then encrypt it
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.confirmPassword = undefined;
  next()
})

// compare password in login controller
// userSchema.methods.comparePassword = async function (userPassword, dbPassword) {

//   return await bcrypt.compare(userPassword, dbPassword);
// }

// check password changed after access token assigned
userSchema.methods.checkPasswordAfterTokenAssigned = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10) //convert into second with base is 10
    // console.log(jwtTimeStamp, changedTimeStamp)
    // if changed password after token issue means true
    return jwtTimeStamp < changedTimeStamp

  }

  // not changed password means false

  return false
}
// Reset Token generation
userSchema.methods.createPasswordResetToken = function () {
  // generate reset Token
  const resetToken = crypto.randomBytes(64).toString("hex")
  // encrypt reset token
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")

  this.passwordResetExpire = Date.now() + 10 * 60 * 1000  //10 min time to reset
  return resetToken
}

module.exports = mongoose.model("user", userSchema);
