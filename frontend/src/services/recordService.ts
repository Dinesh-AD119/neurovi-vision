import { apiRequest } from "./api";
import { RecordItem, RecordDetailResponse } from "../types/api";

export const getAllRecords = async (): Promise<RecordItem[]> => {
  return apiRequest<RecordItem[]>("/api/records");
};

export const getRecordDetail = async (
  analysisId: string
): Promise<RecordDetailResponse> => {
  return apiRequest<RecordDetailResponse>(`/api/records/${analysisId}`);
};

export const deleteRecord = async (analysisId: string): Promise<void> => {
  return apiRequest<void>(`/api/records/${analysisId}`, { method: "DELETE" });
};

export const clearAllRecords = async (): Promise<void> => {
  return apiRequest<void>("/api/records", { method: "DELETE" });
};
