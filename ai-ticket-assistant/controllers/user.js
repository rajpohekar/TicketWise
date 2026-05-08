// Corrected typo: brcypt -> bcrypt
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { inngest } from "../inngest/client.js";

export const signup = async (req, res) => {
  const { email, password, skills = [] } = req.body;
  try {
    // Added await
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, skills });

    // Fire inngest event, but don't fail signup if the background worker is offline.
    try {
      await inngest.send({
        name: "user/signup",
        data: {
          email,
        },
      });
      console.log("✅ Welcome email event queued for:", email);
    } catch (eventError) {
      console.warn("User created, but welcome email was not queued:", eventError.message);
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    // Don't send password back, even if hashed
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ user: userResponse, token }); // Use 201 for resource creation
  } catch (error) {
    // Handle potential duplicate email error
    if (error.code === 11000) {
      return res.status(409).json({ error: "Email already exists" });
    }
    console.error("Signup error:", error.message); // Log the error
    res.status(500).json({ error: "Signup failed", details: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Added await
    const user = await User.findOne({ email });
    if (!user) {
      // Use 401 for authentication failure
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Corrected typo: brcypt -> bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Use 401 for authentication failure
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    // Don't send password back
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ user: userResponse, token });
  } catch (error) {
    console.error("Login error:", error.message); // Log the error
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};

// Note: Basic logout, doesn't invalidate token server-side.
export const logout = async (req, res) => {
  try {
    // Optionally check if token exists and is valid, but it doesn't invalidate anything
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        // Log error but don't fail the logout process for an invalid token
        if (err) console.warn("Logout attempt with invalid token:", err.message);
      });
    }
    // Client-side should remove the token upon receiving this message.
    res.json({ message: "Logout successful. Please remove token client-side." });
  } catch (error) {
    console.error("Logout error:", error.message); // Log the error
    res.status(500).json({ error: "Logout failed", details: error.message });
  }
};

export const updateUser = async (req, res) => {
  // Validate input (basic example)
  const { skills = [], role, email } = req.body;
  if (!email || !role || !['user', 'moderator', 'admin'].includes(role)) {
    return res.status(400).json({ error: "Invalid input: email and valid role are required." });
  }

  try {
    if (req.user?.role !== "admin") {
      // Corrected typo: eeor -> error
      return res.status(403).json({ error: "Forbidden" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      // Use 404 if user not found
      return res.status(404).json({ error: "User not found" });
    }

    // Use findOneAndUpdate for atomicity and getting the updated doc if needed
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { skills: skills.length ? skills : user.skills, role: role } },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    ).select("-password"); // Exclude password from the returned doc


    if (!updatedUser) {
        // Should ideally not happen if findOne found the user, but good practice
        return res.status(404).json({ error: "User not found during update." });
    }

    return res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update user error:", error.message); // Log the error
    res.status(500).json({ error: "Update failed", details: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const users = await User.find().select("-password"); // Exclude passwords
    return res.json(users);
  } catch (error) {
    console.error("Get users error:", error.message); // Log the error
    // Changed error message to be more specific
    res.status(500).json({ error: "Failed to fetch users", details: error.message });
  }
};
