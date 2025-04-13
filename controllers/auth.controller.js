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
        
    }
}