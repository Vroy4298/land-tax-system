import { getAuthToken } from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  };

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });
}
