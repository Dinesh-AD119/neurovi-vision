import { apiRequest } from "./api";
import { GradCamResponse } from "../types/api";

export const getGradCam = async (
  analysisId: string,
  targetClass?: string
): Promise<GradCamResponse> => {
  const query = targetClass ? `?target_class=${targetClass}` : "";
  return apiRequest<GradCamResponse>(
    `/api/gradcam/${analysisId}${query}`,
    { method: "POST" }
  );
};
