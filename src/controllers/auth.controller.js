const User = require('../models/User')
const bcrypt = require('bcryptjs')
const generateToken=require('../lib/utils');
const userRegister = async (req, res) => {
    const {userName, email, password } = req.body;
    if (!email || !password || !userName)
        return res.status(400).json({ message: "All fields are required" });
    if (!email)
        return res.status(400).json({ message: "email required" });
    if (!password)
        return res.status(400).json({ message: "password required" });
    if(!userName)
        return res.status(400).json({ message: "username required" });
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email))
        return res.status(400).json({ message: "Please enter valid email" });
    if (password.length < 6)
        return res.status(400).json({ message: "password must be at least 6 characters" });

    try {
        const userExists = await User.findOne({ email });
        if (userExists)
            return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            userName,
            password: hashedPassword
        })

        if (newUser) {
            generateToken(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                email: newUser.email,
                userName:newUser.userName,
                message: "User registered successfully"
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }

    } catch (error) {
        return res.status(500).json({ message: "Registration Failed" })
    }
}

const userLogin = async (req, res) => {
    const {email,password}=req.body;
    try {
        const getUser=await User.findOne({email});
        if(!getUser) return res.status(400).json({message:"Invalid credentials"});
        const isPasswordCorrect=await bcrypt.compare(password,getUser.password);
        if(!isPasswordCorrect) return res.status(400).json({message:"Invalid credentials"});
        generateToken(getUser._id,res);

        res.status(200).json({
            _id:getUser._id,
            userName:getUser.userName,
            email:getUser.email,
            message:"Login successful"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:"login failed"
        });
    }
}

const userLogout=(req,res)=>{
    res.cookie("jwt","",{maxAge:0,httpOnly:true})
    res.status(200).json({
        message:"logged out successfully"
    });
}

module.exports = { userLogin, userRegister,userLogout };

