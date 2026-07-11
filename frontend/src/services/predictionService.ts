import { apiRequest } from "./api";
import { PredictionResponse, MisclassificationItem, GradCamResponse } from "../types/api";

// Local storage key for Mock vs Live mode
const MODE_KEY = "neurovision_mode";

export const getMode = (): "live" | "mock" => {
  if (typeof window === "undefined") return "live";
  return (localStorage.getItem(MODE_KEY) as "live" | "mock") || "live";
};

export const setMode = (mode: "live" | "mock") => {
  localStorage.setItem(MODE_KEY, mode);
  window.dispatchEvent(new Event("storage")); // Trigger reactivity across components
};

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const res = await apiRequest<{ status: string; model_loaded: boolean }>("/api/health");
    return res.status === "ok" && res.model_loaded;
  } catch {
    return false;
  }
};

export const runPrediction = async (file: File): Promise<PredictionResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  
  return apiRequest<PredictionResponse>("/api/predict", {
    method: "POST",
    body: formData,
  });
};

export const getMisclassifications = async (): Promise<MisclassificationItem[]> => {
  return apiRequest<MisclassificationItem[]>("/api/misclassifications");
};

export const getMisclassificationGradcam = async (
  relativePath: string,
  targetClass?: string
): Promise<GradCamResponse> => {
  const query = targetClass ? `?target_class=${targetClass}` : "";
  return apiRequest<GradCamResponse>(
    `/api/misclassifications/gradcam?relative_path=${encodeURIComponent(relativePath)}${targetClass ? `&target_class=${targetClass}` : ""}`,
    { method: "POST" }
  );
};
