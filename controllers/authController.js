const User = require("../models/user");
const db = require("../config/db");
const { dataValid } = require("../utils/dataValidation");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
    const valid = {
        username: "required",
        password: "required",
        confirmPassword: "required",
        email: "required,isEmail",
        name: "required",
    };

    const user = await dataValid(valid, req.body);

    try {
        

        if (user.data.password !== user.data.confirmPassword) {
            user.message.push("Password tidak sama");
        }

        if (user.message.length > 0) {
            return res.status(400).json({
                message: user.message,
            });
        }

        const usernameExist = await User.findAll({
            where: {
                username: user.data.username,
            },
        });

        const emailExist = await User.findAll({
            where: {
                email: user.data.email,
            },
        });

        if (usernameExist.length > 0) {
            return res.status(400).json({
                message: "Username telah digunakan",
            });
        }

        if (emailExist.length > 0) {
            return res.status(400).json({
                message: "Email telah digunakan",
            });
        }
        // Hash password sebelum menyimpan ke database
        const hashedPassword = await bcrypt.hash(user.data.password, 10); // Salt rounds = 10

        // Buat user baru dengan password yang telah di-hash
        const newUser = await User.create({
            ...user.data,
            password: hashedPassword, // Ganti password dengan hashed password
        });

        return res.status(201).json({
            message: "success",
            data: newUser,
        });
    } catch (error) {
        console.log("Error di register", error);
    }
};

const Login = async (req, res) => {
    const valid = {
        email: "required,isEmail",
        password: "required",
    };

    const user = await dataValid(valid, req.body);

    if (user.message.length > 0) {
        return res.status(400).json({
            message: user.message,
        });
    }

    try {
        // Cari user berdasarkan email
        const existingUser = await User.findOne({
            where: { email: user.data.email },
        });

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(
            user.data.password,
            existingUser.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid password",
            });
        }

        // Generate JWT
        const accessToken = jwt.sign(
            { id: existingUser.id, email: existingUser.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: existingUser.id, email: existingUser.email },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        // Kirim token ke cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false, 
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        });



        return res.status(200).json({
            message: "Login successful",
            accessToken,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

module.exports = { register, Login };
