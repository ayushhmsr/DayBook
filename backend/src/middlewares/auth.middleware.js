import jwt from "jsonwebtoken";
import config from "../config/config.js";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret || config.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired access token." });
  }
}

export default authenticate;
