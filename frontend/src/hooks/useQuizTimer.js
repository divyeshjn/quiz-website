import { useEffect, useState } from "react";

export default function useQuizTimer(
  deadline,
  clockOffset = 0
) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const deadlineTime = new Date(deadline).getTime();

  const remainingMs = Number.isFinite(deadlineTime)
    ? Math.max(
        0,
        deadlineTime - (now + clockOffset)
      )
    : 0;

  const remainingSeconds = Math.ceil(
    remainingMs / 1000
  );

  const hours = Math.floor(
    remainingSeconds / 3600
  );

  const minutes = Math.floor(
    (remainingSeconds % 3600) / 60
  );

  const seconds = remainingSeconds % 60;

  const pad = (value) =>
    String(value).padStart(2, "0");

  const formattedTime =
    hours > 0
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;

  return {
    remainingSeconds,
    formattedTime,
    isExpired: remainingSeconds === 0,
  };
}