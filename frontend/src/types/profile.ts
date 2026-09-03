export interface Profile {
  heightCm: number | null;
  profileImageDataUrl: string | null;
}

export interface BodyWeightLog {
  id: number;
  recordedDate: string;
  weightKg: number;
}

export interface BodyWeightLogInput {
  recordedDate: string;
  weightKg: number;
}
