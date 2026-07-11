import { apiRequest } from "./api";
import { MetricsResponse } from "../types/api";

export const getModelMetrics = async (): Promise<MetricsResponse> => {
  return apiRequest<MetricsResponse>("/api/model/metrics");
};

export const getConfusionMatrix = async (
  dataset: "official" | "external"
): Promise<number[][]> => {
  const res = await apiRequest<{ confusion_matrix: number[][] }>(
    `/api/model/confusion-matrix?dataset=${dataset}`
  );
  return res.confusion_matrix;
};
