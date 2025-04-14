import jwt from "jsonwebtoken"
import { User } from "../models/auth.model.js"
import bcrypt from "bcrypt"
import { tokenGeneratorAndCookieSetter } from "../utils/token.generate.cookie.js"
import { VERIFICATION_EMAIL_TEMPLATE } from "../mailer/emailtemplate.js"
import sender from "../mailer/sendmail.config.js"
import { getCookieAndToken } from "../utils/getTokenAndCookie.js"
import crypto from 'crypto'

export const signup = async (req,res) => {
    try {
        const { name, rmail, password} = req.body

        if(!name || !email || !password){
            return res.status(400).json({message: "All fields are required"})
        }

        const oldUser = await User.findOne({ email });

        if (!oldUser){
            return res.status(400).json({message: "User already exists"})
        }

        const passwordEncryption = await bcrypt.hash(password, 10);
        const verificationToken = Math.floor(10000 + Math.random() * 900000).toString() // 6 digits value numbers as verification token

        const newUser = new User ({
            name, 
            email,
            password: passwordEncryption,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24hours valid  
        });

        await newUser.save();

        tokenGeneratorAndCookieSetter(res, newUser._id);

        //after signup a mail is sent to the registered email

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "verification"
        }

        await sender.sendMail(mailOptions);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
              _id: newUser._id,
              email: newUser.email,
              name: newUser.name,
              role: newUser.role,
            },
          });
    } catch (error) {
        res.status(400).json({success: false, message: error.message})
    }
}


export const verifyEmail = async(req, res) => {
    const { code } = req.body

    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now()},
        });

        if (!user) {
            console.log("Verification failed: Invalid or expired token sent");
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification code"
            });
        }

        user.isVerified = true,
        user.verificationToken = undefined,
        user.verificationTokenExpiresAt = undefined

        await user.save();
        // send mail construct appears here

        // Send welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to the platform!",
            html: WELCOME_EMAIL_TEMPLATE.replace("{name}", user.name),
            category: "welcome",
        };
    
        await sender.sendMail(mailOptions);
    
        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            lastLogin: user.lastLogin,
            }
        });
    } catch (error) {
        res.status(400).json({success: false, message: "Email could not be verified due to unknown reasons. That one na your wahala 🕺🏽💃🏽😎"})
    }
}

export const login = async(req, res) => {
    const { email, password} = req.body;


    try{
        const user = await user.findOne({email})

        if (!user){
            res.status(400).json({ success: false, message: "Invalid Email"})
        }

        const passwordisPassword = await bcrypt.compare(password, user.password)
        if(!passwordisPassword) {
            return res.status(400).json({ success: false, message: "Invalid Password"})
        }
        

        user.lastLogin = new Date();
        await user.save();
        getCookieAndToken(res, user._id)

        res.status(200).json({
            success: true,
            message: "You have been successfully logged in",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                lastLogin: user.lastLogin,
            }
        });

    } catch (error) {
        console.error("Login error:", error);
      res.status(500).json({ success: false, message: "Couldn't log you in. NOt my wahala. 🚶‍♂️‍➡️🚶‍♀️‍➡️🏃🏻‍➡️🏃🏻‍♂️‍➡️" });
    }
}

export const logout =  async(req,res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const forgotPassword = async(req, res) => {
    const { email } = req.body;
    try {
        const user = await user.findOne({email});

        if(!user){
            return res.status(400).json({success: false, message: 'User does not exist'});
        }

        const resetToken = crypto.randomBytes(20).toString("hex")
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; //1 hour 

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save()


        // Send reset email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Reset Your Password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "reset",
        };
    
        await sender.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: 'Password reset link has been sent to your email'
        })
    } catch (error) {
        console.error("Reset Password error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const resetPassword = async (req, res) => {
    try {
        const {token} = req.params;
        const {password} = req.body

        const user = await user.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: {$gt: Date.now()}
        })

        if(!user){
            return res.status(400).json({success: false, message: "Invalid or expired reset token"})
        }

        const hashPassword = await bcrypt.hash(password, 10);

        user.password = hashPassword;
        user.resetPasswordToken = undefined
        user.resetPasswordExpiresAt = undefined

        await user.save()
    } catch (error) {
        
    }
}