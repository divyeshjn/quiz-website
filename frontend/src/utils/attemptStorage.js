const PREFIX = "quiz_attempt_";

export const storeAttempt = (
  quizId,
  attemptId,
  accessToken
) => {
  const data = {
    quizId,
    attemptId,
    accessToken,
  };

  localStorage.setItem(
    `${PREFIX}${quizId}`,
    JSON.stringify(data)
  );

  return data;
};

export const getStoredAttempt = (quizId) => {
  try {
    const data = localStorage.getItem(
      `${PREFIX}${quizId}`
    );

    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const clearStoredAttempt = (quizId) => {
  localStorage.removeItem(`${PREFIX}${quizId}`);
};