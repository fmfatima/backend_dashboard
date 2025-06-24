const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userModel");

const sendEmail = require ('./../middleware/email')


//@desc Register a user
//@route POST /api/users/register
//@access public
    const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory!");
    }
    const userAvailable = await User.findOne({ email });
    if (userAvailable) {
        res.status(400);
        throw new Error("User already registered!");
    }

    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password: ", hashedPassword);
    const user = await User.create({
        username,
        email,
        password: hashedPassword,
    });

    console.log(`User created ${user}`);
    if (user) {
        res.status(201).json({ _id: user.id, email: user.email });
    } else {
        res.status(400);
        throw new Error("User data is not valid");
    }
    res.json({ message: "Register the user" });
    });

    //@desc Login user
    //@route POST /api/users/login
    //@access public
    const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory!");
    }
    const user = await User.findOne({ email });
    //compare password with hashedpassword
    if (user && (await bcrypt.compare(password, user.password))) {
        const accessToken = jwt.sign(
        {
            user: {
            username: user.username,
            email: user.email,
            id: user.id,
            },
        },
        process.env.ACCESS_TOKEN_SECERT,
        { expiresIn: "15m" }
        );
        res.status(200).json({ accessToken });
    } else {
        res.status(401);
        throw new Error("email or password is not valid");
    }
});

//@desc Current user info
//@route POST /api/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
    res.json(req.user);
});


//@desc forget passwrod current user info
//@route POST /api/users/foeget
//@access private


const forgetPassword = asyncHandler(async (req, res, next) => {
    //1. get usier based in posted email
    const user = await User.findOne({email: req.body.email});

    if(!user){
        const error = new CustomError('we couldnt find the user with this email', 404);
        next(error);
    }


    //2. generate a random reset token
    const resetToken = user.createResetPasswrodToken();
    await user.save({validateBeforeSave: false});

    //3. send email to user with reset token
    const resetUrl = `${req.protocol}://${req.get('host')}/api.users/resetPassword/${resetToken}`;
    const message = `We have received a password reset request use the below link to reset password\n\n${resetUrl}\n\n this reset password link will be valid only for 10 minutes.`
    try{
        await sendEmail({
        email: user.email,
        subject: 'Password Chnaged Request Received:',
        message: message
    });
    req.status(200).json({
        status: 'success',
        message: `password reset link to the user email`
    })

    }catch(err){
        user.passwordResetToken= undefined;
        user.passwordResetTokenExpire= undefined;
        user.save({validateBeforeSave: false});

        return next(new CustomError("there was an error sending password reset email. Please try again latter.", 500))
    }

});

const resetPassword = asyncHandler(async(req, res, next) => {
    const token = crypto.createHash('sha256').update(req.params.token).digest('num');
    const user = await User.findOne({passwordResetToken: token, passwordResetTokenExpire: {$gt: Date.now()}});

    if(!user){
        const error = new CustomError('Token is invalid or expire', 400);
        next(error);
    }

    user.password = req.body.password; 
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;
    user.passwordChangedAt = Date.now();

    user.save();

    //login user automagtically
    // const token = signToken(user._id);

    // res.status(200).json({
    //     status: 'success',
    //     token 
    // });


});



module.exports = { registerUser, loginUser, currentUser, forgetPassword, resetPassword };