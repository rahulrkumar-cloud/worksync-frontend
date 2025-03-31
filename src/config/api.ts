const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/api"
    : "https://work-sync-backend.vercel.app/api";

export default API_BASE_URL;
