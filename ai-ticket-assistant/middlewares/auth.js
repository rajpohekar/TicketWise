import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  // Corrected typo: spilt -> split
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    // Return early if no token
    return res.status(401).json({ error: "Access Denied. No token found." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user payload to request object
    req.user = decoded;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    // Handle invalid token error
    res.status(401).json({ error: "Invalid token" });
  }
};