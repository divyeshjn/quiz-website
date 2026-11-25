import Attempt from "../models/Attempt.js";

import {
  finalizeAttempt,
} from "./submission.service.js";

let isRunning = false;

export const startAutoSubmitWorker = () => {
  const processExpiredAttempts = async () => {
    if (isRunning) return;

    isRunning = true;

    try {
      const expiredAttempts = await Attempt.find({
        status: "in-progress",
        deadline: {
          $lte: new Date(),
        },
      })
        .select("_id")
        .limit(100)
        .lean();

      for (const attempt of expiredAttempts) {
        try {
          await finalizeAttempt(attempt._id);

          console.log(
            `Auto-submission processed: ${attempt._id}`
          );
        } catch (error) {
          console.error(
            "Auto-submission failed:",
            attempt._id,
            error.message
          );
        }
      }
    } catch (error) {
      console.error(
        "Auto-submit worker error:",
        error.message
      );
    } finally {
      isRunning = false;
    }
  };

  // Check immediately after server starts
  void processExpiredAttempts();

  // Check every 10 seconds
  const timer = setInterval(
    processExpiredAttempts,
    10000
  );

  console.log("Auto-submit worker started");

  return timer;
};