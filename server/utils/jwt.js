import dotenv from "dotenv"
import jwt from "jsonwebtoken"
dotenv.config()

export const generateToken = (user) => {
    return jwt.sign({
        id: user._id,
        email: user.email,
        role: user.role
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "1d"
    }
)
}
