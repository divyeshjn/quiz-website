import mongoose from "mongoose";
import { createHash } from "node:crypto";

import Attempt from "../models/Attempt.js";

export const hashToken = (token) => {
  return createHash("sha256")
    .update(token)
    .digest("hex");
};

export const requireAttemptAccess = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID",
      });
    }

    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Attempt access token required",
      });
    }

    const token = authorization.slice(7);

    const attempt = await Attempt.findOne({
      _id: id,
      accessTokenHash: hashToken(token),
    });

    if (!attempt) {
      return res.status(401).json({
        success: false,
        message: "Invalid attempt credentials",
      });
    }

    req.attempt = attempt;

    next();
  } catch (error) {
    next(error);
  }
};