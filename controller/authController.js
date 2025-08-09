import prisma from "../config/prismaClient.mjs";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  const { name, email, phone, password, role_id, company_id, age } = req.body;
  console.log("in register", req.body);

  if (!name || !phone || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("typeof hashedPassword:", typeof hashedPassword);
    console.log("hashedPassword value:", hashedPassword);
    console.log("contains null byte:", hashedPassword.includes("\x00"));

    const user = await prisma.users.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role_id: role_id,
      },
    });

    // Convert BigInt to string for JSON serialization
    res
      .status(201)
      .json({ message: "User  registered", userId: user.id.toString() });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: "User  registration failed." });
  }
};

export const loginUser = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: "Phone and password are required." });
  }

  try {
    const user = await prisma.users.findUnique({ where: { phone } });

    if (!user) {
      return res.status(404).json({ error: "User  not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // For simplicity, return basic info (in production use JWT)
    res.json({
      message: "Login successful",
      user: {
        id: user.id.toString(), // Convert BigInt to string
        name: user.name,
        email: user.email,
        phone: user.phone,
        age: user.age,
        role_id: user.role_id,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Login failed." });
  }
};
