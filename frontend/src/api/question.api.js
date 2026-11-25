import api from "./axios";

export const getQuestions = async (quizId) => {
  const response = await api.get(
    `/quizzes/${quizId}/questions`
  );

  return response.data;
};

export const addQuestion = async (quizId, data) => {
  const response = await api.post(
    `/quizzes/${quizId}/questions`,
    data
  );

  return response.data;
};

export const updateQuestion = async (
  quizId,
  questionId,
  data
) => {
  const response = await api.patch(
    `/quizzes/${quizId}/questions/${questionId}`,
    data
  );

  return response.data;
};

export const deleteQuestion = async (
  quizId,
  questionId
) => {
  const response = await api.delete(
    `/quizzes/${quizId}/questions/${questionId}`
  );

  return response.data;
};

export const uploadQuestions = async (
  quizId,
  file
) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    `/quizzes/${quizId}/questions/upload`,
    formData
  );

  return response.data;
};