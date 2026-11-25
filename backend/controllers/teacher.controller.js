import jwt from "jsonwebtoken";
import { createHash, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "teacher_token";

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
});

const comparePasswords = (provided, expected) => {
  const hash = (value) =>
    createHash("sha256").update(value).digest();

  return timingSafeEqual(
    hash(provided),
    hash(expected)
  );
};

// Teacher login
export const loginTeacher = (req, res) => {
  const { password } = req.body;

  if (typeof password !== "string" || !password) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }

  if (!comparePasswords(password, process.env.TEACHER_PASSWORD)) {
    return res.status(401).json({
      success: false,
      message: "Invalid password",
    });
  }

  const token = jwt.sign(
    { role: "teacher" },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );

  res.cookie(COOKIE_NAME, token, cookieOptions());

  return res.status(200).json({
    success: true,
    message: "Login successful",
  });
};

// Teacher logout
export const logoutTeacher = (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions());

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

// Check authentication status
export const getTeacherStatus = (req, res) => {
  return res.status(200).json({
    success: true,
    authenticated: true,
    role: "teacher",
  });
};