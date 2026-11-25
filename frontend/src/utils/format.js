export const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const formatDuration = (seconds) => {
  if (seconds == null) return "—";

  const safeSeconds = Math.max(
    0,
    Math.floor(seconds)
  );

  const hours = Math.floor(safeSeconds / 3600);

  const minutes = Math.floor(
    (safeSeconds % 3600) / 60
  );

  const remainingSeconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
};

export const getQuizStatus = (
  quiz,
  now = Date.now()
) => {
  if (quiz.status === "draft") {
    return "draft";
  }

  if (
    quiz.status === "closed" ||
    now >= new Date(quiz.endTime).getTime()
  ) {
    return "closed";
  }

  if (
    now < new Date(quiz.startTime).getTime()
  ) {
    return "upcoming";
  }

  return "open";
};

export const toLocalDateTimeInput = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();

  const localDate = new Date(
    date.getTime() - offset * 60000
  );

  return localDate.toISOString().slice(0, 16);
};

export const toUTCDateTime = (value) => {
  return new Date(value).toISOString();
};