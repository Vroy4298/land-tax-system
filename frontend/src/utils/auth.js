export function getAuthToken() {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  // Guard against invalid tokens
  if (!token || token === "undefined" || token === "null") {
    return null;
  }

  return token;
}

// Decode role from JWT payload (no library needed — just base64 decode)
export function getUserRole() {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || "citizen";
  } catch {
    return "citizen";
  }
}

export function isAdmin() {
  return getUserRole() === "admin";
}
