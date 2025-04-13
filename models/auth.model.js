import mongoose from 'mongoose'


const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    isVerified:{
        type:Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpiresAt: {
        type: Date,
    },
    verificationToken: {
        type: String
    },
    verificationTokenExpiresAt: {
        type: Date,
    }


}, {timestamps: true}) 

export const User = mongoose.model("User", userSchema)