import jwt from "jsonwebtoken"
export const getCookieAndToken = (res, userId) => {
    const token = jwt.sign({userId: user._id, email: user.email}, process.env.JWT_SECRET-KEY,{
        expiresIn: '1h'
    });

    res.cookie("token", token, {
        httpOnly: true,  
        maxAge: 3600000, // 1 hour
    }); 

    return token
}


