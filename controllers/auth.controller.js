import jwt from "jsonwebtoken"
import { User } from "../models/auth.model.js"
import bcrypt from "bcrypt"
import { tokenGeneratorAndCookieSetter } from "../utils/token.generate.cookie.js"

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

        const passwordEncryption = await bcrypt.hash(password, 8);
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

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        res.status(400).json({success: false, message: "Email could not be verified due to unknown reasons. That one na your wahala"}) //😅🫠🫠🫠
    }
}

export const login = async(req, res) => {
    
}
