const API_URL = import.meta.env.VITE_API_URL;

export const apiFetch = (endpoint, options = {}) => {
  return fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
};
