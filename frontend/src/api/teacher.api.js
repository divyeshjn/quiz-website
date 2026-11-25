import api from "./axios";

export const loginTeacher = async (password) => {
  const { data } = await api.post(
    "/teacher/login",
    { password }
  );

  return data;
};

export const logoutTeacher = async () => {
  const { data } = await api.post(
    "/teacher/logout"
  );

  return data;
};

export const getTeacherStatus = async () => {
  const { data } = await api.get(
    "/teacher/me"
  );

  return data;
};