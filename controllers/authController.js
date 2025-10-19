const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      verificationToken
    });

    // Send verification email using Resend
    const verifyUrl = `${process.env.BASE_URL}/api/auth/verify/${verificationToken}`;

    await resend.emails.send({
      from: "IndianCompanyBazar <no-reply@yourdomain.com>",
      to: email,
      subject: "Verify your email",
      html: `
        <h2>Welcome to Indian Company Bazar, ${name}!</h2>
        <p>Click below to verify your email:</p>
        <a href="${verifyUrl}" target="_blank">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `,
    });

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Please verify your email before logging in" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


