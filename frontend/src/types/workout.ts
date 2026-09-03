export type MuscleGroup = 'CHEST' | 'BACK' | 'LOWER_BODY' | 'BICEPS' | 'TRICEPS' | 'SHOULDERS';

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  CHEST: '가슴',
  BACK: '등',
  LOWER_BODY: '하체',
  BICEPS: '이두',
  TRICEPS: '삼두',
  SHOULDERS: '어깨',
};

// 부위별 대표 운동 - 종목명 입력칸의 자동완성 후보 (직접 다른 이름을 입력해도 됨)
export const MUSCLE_GROUP_EXERCISES: Record<MuscleGroup, string[]> = {
  CHEST: ['벤치프레스', '인클라인 벤치프레스', '디클라인 벤치프레스', '덤벨 프레스', '인클라인 덤벨 프레스', '푸시업', '딥스', '펙덱 플라이', '케이블 크로스오버', '덤벨 플라이'],
  BACK: ['데드리프트', '풀업', '랫풀다운', '바벨 로우', '덤벨 로우', '시티드 케이블 로우', 'T바 로우', '백 익스텐션'],
  LOWER_BODY: ['스쿼트', '레그프레스', '런지', '레그 익스텐션', '레그 컬', '루마니안 데드리프트', '힙 쓰러스트', '카프 레이즈'],
  BICEPS: ['바벨 컬', '덤벨 컬', '해머 컬', '컨센트레이션 컬', '프리처 컬', '케이블 컬'],
  TRICEPS: ['트라이셉스 푸시다운', '오버헤드 익스텐션', '클로즈그립 벤치프레스', '딥스', '킥백', '스컬크러셔'],
  SHOULDERS: ['오버헤드 프레스', '사이드 레터럴 레이즈', '프론트 레이즈', '리어 델트 플라이', '업라이트 로우', '아놀드 프레스', '페이스 풀'],
};

export type WorkoutStatus = 'COMPLETED' | 'INCOMPLETE' | 'INJURED' | 'SKIPPED';

export const WORKOUT_STATUS_LABELS: Record<WorkoutStatus, string> = {
  COMPLETED: '완료',
  INCOMPLETE: '목표 미달',
  INJURED: '부상',
  SKIPPED: '휴식',
};

export interface WorkoutSet {
  id: number;
  weightKg: number | null;
  reps: number;
}

export interface WorkoutSetInput {
  weightKg: number | null;
  reps: number;
}

export interface WorkoutExercise {
  id: number;
  exerciseName: string;
  sets: WorkoutSet[];
}

export interface WorkoutExerciseInput {
  exerciseName: string;
  sets: WorkoutSetInput[];
}

// 하루 운동 기록 한 건 - 그날 타겟 부위 + 그날 한 종목들(각자 세트를 가짐)
export interface WorkoutRecord {
  id: number;
  workoutDate: string;
  muscleGroup: MuscleGroup;
  status: WorkoutStatus;
  memo: string | null;
  exercises: WorkoutExercise[];
  createdAt: string;
}

export interface WorkoutRecordInput {
  workoutDate: string;
  muscleGroup: MuscleGroup;
  status: WorkoutStatus;
  memo: string | null;
  exercises: WorkoutExerciseInput[];
}

export interface CoachingSuggestion {
  suggestedDate: string;
  muscleGroup: MuscleGroup;
  memo: string | null;
  exercises: WorkoutExerciseInput[];
}

export interface CoachingResult {
  configured: boolean;
  message: string | null;
  suggestion: CoachingSuggestion | null;
}

export interface ExercisePersonalRecord {
  workoutDate: string;
  weightKg: number | null;
  reps: number;
  estimatedOneRepMax: number | null;
}

export interface ExercisePersonalRecordSummary {
  exerciseName: string;
  personalRecord: ExercisePersonalRecord | null;
}

export interface ExerciseHistoryEntry {
  workoutDate: string;
  sets: WorkoutSet[];
}

export interface ExerciseHistoryResult {
  exerciseName: string;
  entries: ExerciseHistoryEntry[];
  personalRecord: ExercisePersonalRecord | null;
}
