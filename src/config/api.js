export const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://souptikalignx-backend.souptik.workers.dev";
export const API_ENDPOINTS = {
  onboarding: `${API_BASE_URL}/api/onboarding`,
  workoutRecommendations: `${API_BASE_URL}/api/workouts/recommendations`
};
