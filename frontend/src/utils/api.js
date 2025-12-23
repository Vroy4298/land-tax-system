const API_URL = import.meta.env.VITE_API_URL;

export const apiFetch = async (path, options = {}) => {
  return fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      ...(options.headers || {}),
    },
    ...options,
  });
};
