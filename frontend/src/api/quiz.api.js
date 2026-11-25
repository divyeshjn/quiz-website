import api from "./axios";

export const createQuiz = async (quizData) => {
  const { data } = await api.post(
    "/quizzes",
    quizData
  );

  return data;
};

export const getAllQuizzes = async () => {
  const { data } = await api.get("/quizzes");

  return data;
};

export const getQuizById = async (quizId) => {
  const { data } = await api.get(
    `/quizzes/${quizId}`
  );

  return data;
};

export const updateQuiz = async (
  quizId,
  quizData
) => {
  const { data } = await api.patch(
    `/quizzes/${quizId}`,
    quizData
  );

  return data;
};

export const deleteQuiz = async (quizId) => {
  const { data } = await api.delete(
    `/quizzes/${quizId}`
  );

  return data;
};

export const publishQuiz = async (quizId) => {
  const { data } = await api.post(
    `/quizzes/${quizId}/publish`
  );

  return data;
};

export const getPublicQuiz = async (quizId) => {
  const { data } = await api.get(
    `/quizzes/${quizId}/public`
  );

  return data;
};