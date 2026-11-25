import jwt from "jsonwebtoken";

export const requireTeacher = (req, res, next) => {
  const token = req.cookies.teacher_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        algorithms: ["HS256"],
      }
    );

    if (decoded.role !== "teacher") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    req.teacher = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session",
    });
  }
};