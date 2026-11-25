import api from "./axios";

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const startAttempt = async (data) => {
  const response = await api.post(
    "/attempts/start",
    data
  );

  return response.data;
};

export const getAttempt = async (attemptId, token) => {
  const response = await api.get(
    `/attempts/${attemptId}`,
    getAuthConfig(token)
  );

  return response.data;
};

export const saveAnswer = async (
  attemptId,
  token,
  questionId,
  selectedOption
) => {
  const response = await api.patch(
    `/attempts/${attemptId}/answer`,
    {
      questionId,
      selectedOption,
    },
    getAuthConfig(token)
  );

  return response.data;
};

export const submitAttempt = async (
  attemptId,
  token
) => {
  const response = await api.post(
    `/attempts/${attemptId}/submit`,
    {},
    getAuthConfig(token)
  );

  return response.data;
};