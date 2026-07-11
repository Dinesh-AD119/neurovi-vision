export interface ProbabilityItem {
  class_name: string;
  display_name: string;
  probability: number;
}

export interface ModelInfo {
  name: string;
  architecture: string;
  input_size: number[];
  preprocessing: string;
}

export interface PredictionResponse {
  analysis_id: string;
  predicted_class: string;
  display_name: string;
  confidence: number;
  confidence_level: "VERY HIGH" | "HIGH" | "MODERATE" | "LOW";
  uncertainty_warning: boolean;
  prediction_margin: number;
  top_2: ProbabilityItem[];
  probabilities: ProbabilityItem[];
  model: ModelInfo;
  timestamp: string;
}

export interface GradCamResponse {
  analysis_id: string;
  heatmap: string; // Base64 URL
  overlay: string; // Base64 URL
  target_class: string;
  layer_name: string;
}

export interface ClassMetric {
  precision: number;
  recall: number;
  "f1-score"?: number;
  f1_score?: number;
  support: number;
}

export interface DatasetStats {
  accuracy: number;
  evaluated_images: number;
  confusion_matrix: number[][];
  classification_report: Record<string, ClassMetric>;
}

export interface MetricsResponse {
  official: DatasetStats;
  external: DatasetStats;
}

export interface RecordItem {
  analysis_id: string;
  original_filename: string;
  predicted_class: string;
  display_name: string;
  confidence: number;
  confidence_level: string;
  uncertainty_warning: boolean;
  prediction_margin: number;
  timestamp: string;
}

export interface RecordDetailResponse extends RecordItem {
  top_2: ProbabilityItem[];
  probabilities: ProbabilityItem[];
  image_data_b64: string;
}

export interface MisclassificationItem {
  file: string;
  relative_path: string;
  actual: string;
  predicted: string;
  conf: number;
  confidence_level: string;
  prediction_margin: number;
  top_2: ProbabilityItem[];
  probabilities: ProbabilityItem[];
}
