export const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (
    typeof data?.message === "string" &&
    data.message
  ) {
    return data.message;
  }

  if (error?.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }

  if (!error?.response) {
    return "Unable to connect to the server.";
  }

  return "Something went wrong. Please try again.";
};