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
