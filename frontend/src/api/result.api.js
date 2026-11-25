import api from "./axios";

export const getResults = async (
  quizId,
  passingPercentage = 50
) => {
  const { data } = await api.get(
    `/quizzes/${quizId}/results`,
    {
      params: {
        passingPercentage,
      },
    }
  );

  return data;
};

export const getAnalytics = async (quizId) => {
  const { data } = await api.get(
    `/quizzes/${quizId}/results/analytics`
  );

  return data;
};

export const getIndividualResult = async (
  quizId,
  attemptId
) => {
  const { data } = await api.get(
    `/quizzes/${quizId}/results/${attemptId}`
  );

  return data;
};

export const downloadResults = async (quizId) => {
  const response = await api.get(
    `/quizzes/${quizId}/results/export`,
    {
      responseType: "blob",
    }
  );

  const blob = new Blob(
    [response.data],
    { type: "text/csv;charset=utf-8" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `quiz_${quizId}_results.csv`;

  document.body.appendChild(link);

  link.click();

  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
};