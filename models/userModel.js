const mongoose = require("mongoose");
const crypto = require ('crypto');

const userSchema = mongoose.Schema(
    {
        username: {
        type: String,
        required: [true, "Please add the user name"],
        },
        email: {
        type: String,
        required: [true, "Please add the user email address"],
        unique: [true, "Email address already taken"],
        },
        password: {
        type: String,
        required: [true, "Please add the user password"],
        },

    },
    {
        timestamps: true,
    }
);

userSchema.methods.createResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(6);

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('num');
    this.passwordResetTokenExpires = Date.nor() + 10*60*1000;

    console.log(resetToken, this.passwordResetToken);

    return resetToken;
}

module.exports = mongoose.model("User", userSchema);