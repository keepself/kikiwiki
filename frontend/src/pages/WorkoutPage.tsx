import { useEffect, useState } from 'react';
import {
  fetchWorkoutRecords,
  createWorkoutRecord,
  updateWorkoutRecord,
  deleteWorkoutRecord,
  fetchWorkoutCoaching,
  fetchPersonalRecords,
  fetchExerciseHistory,
  deleteExercise,
  fetchProfile,
  updateProfileHeight,
  updateProfilePhoto,
  deleteProfilePhoto,
  fetchWeightLogs,
  createWeightLog,
  deleteWeightLog,
} from '../api/client';
import type {
  ExerciseHistoryResult,
  ExercisePersonalRecordSummary,
  MuscleGroup,
  WorkoutRecord,
  WorkoutRecordInput,
} from '../types/workout';
import { MUSCLE_GROUP_LABELS } from '../types/workout';
import type { Profile, BodyWeightLog } from '../types/profile';
import { resizeImageToDataUrl } from '../imageResize';
import { WorkoutRecordForm } from '../components/WorkoutRecordForm';
import { WorkoutRecordList } from '../components/WorkoutRecordList';
import { PersonalRecordList } from '../components/PersonalRecordList';
import { ExerciseTrendModal } from '../components/ExerciseTrendModal';
import { MonthFilterSelect } from '../components/MonthFilterSelect';
import { ProfileCard } from '../components/ProfileCard';
import { WeightTrendModal } from '../components/WeightTrendModal';
import { Modal } from '../components/Modal';

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function emptyFormValues(): WorkoutRecordInput {
  return { workoutDate: todayStr(), muscleGroup: 'CHEST', status: 'COMPLETED', memo: null, exercises: [] };
}

const MUSCLE_GROUPS: MuscleGroup[] = ['CHEST', 'BACK', 'LOWER_BODY', 'BICEPS', 'TRICEPS', 'SHOULDERS'];
const RECORDS_LIST_LIMIT = 6;

export function WorkoutPage() {
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<WorkoutRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<WorkoutRecord | null>(null);

  // "+ 기록 추가" 폼과, AI 코칭이 만들어준 다음주 계획 초안을 여는 폼이 같은 모달을 공유함 -
  // formValues가 null이 아니면 모달이 열리고, 그 값이 폼의 초기값이 됨
  const [formValues, setFormValues] = useState<WorkoutRecordInput | null>(null);

  const [personalRecords, setPersonalRecords] = useState<ExercisePersonalRecordSummary[]>([]);

  const loadRecords = () => {
    fetchWorkoutRecords()
      .then(setRecords)
      .catch((err) => setError(err.message));
  };

  // 종목/세트가 바뀔 수 있는 모든 작업(등록/수정/삭제) 뒤에 같이 새로고침해야 PR이 최신 상태로 유지됨
  const loadPersonalRecords = () => {
    fetchPersonalRecords()
      .then(setPersonalRecords)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadRecords();
    loadPersonalRecords();
  }, []);

  const handleCreate = async (input: WorkoutRecordInput) => {
    try {
      await createWorkoutRecord(input);
      loadRecords();
      loadPersonalRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : '운동 기록 등록 중 오류가 발생했습니다.');
    }
  };

  const handleUpdate = async (input: WorkoutRecordInput) => {
    if (!editingRecord) return;
    try {
      await updateWorkoutRecord(editingRecord.id, input);
      loadRecords();
      loadPersonalRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : '운동 기록 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteWorkoutRecord(id);
      loadRecords();
      loadPersonalRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : '운동 기록 삭제 중 오류가 발생했습니다.');
    }
  };

  // AI 코칭: 카드 하나를 골라 그 기록 전체를 보내면, 자동이 아니라 그 순간에만 다음주 계획 초안을 만들어옴.
  // 만들어진 초안은 곧바로 "운동 기록 추가" 폼에 채워서 열어줌 - 확인/수정 후 등록하면 그때 저장됨
  const [coachingLoadingId, setCoachingLoadingId] = useState<number | null>(null);

  const handleRequestCoaching = async (record: WorkoutRecord) => {
    setCoachingLoadingId(record.id);
    try {
      const result = await fetchWorkoutCoaching(record.id);
      if (!result.configured || !result.suggestion) {
        setError(result.message ?? 'AI 코칭을 만들 수 없었어요.');
        return;
      }
      const suggestion = result.suggestion;
      setFormValues({
        workoutDate: suggestion.suggestedDate,
        muscleGroup: suggestion.muscleGroup,
        status: 'COMPLETED',
        memo: suggestion.memo,
        exercises: suggestion.exercises,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 코칭 요청 중 오류가 발생했습니다.');
    } finally {
      setCoachingLoadingId(null);
    }
  };

  // 종목별 기록 카드에서 종목을 클릭하면 그 종목의 변화 추이(스파크라인+목록)를 모달로 보여줌
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistoryResult | null>(null);

  const handleViewExerciseHistory = async (exerciseName: string) => {
    try {
      setExerciseHistory(await fetchExerciseHistory(exerciseName));
    } catch (err) {
      setError(err instanceof Error ? err.message : '종목 기록을 불러오는 중 오류가 발생했습니다.');
    }
  };

  // 종목 자체를 삭제 - 그 이름으로 기록된 모든 날짜의 세트가 같이 지워짐 (날짜 기록은 남음)
  const handleDeleteExercise = async (exerciseName: string) => {
    try {
      await deleteExercise(exerciseName);
      loadRecords();
      loadPersonalRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : '종목 삭제 중 오류가 발생했습니다.');
    }
  };

  // 기록이 많아지면 기본 화면엔 최근 것만 보이고, "더보기"로 필터(부위/월)가 달린 전체 상세 화면으로 넘어감
  const [showRecordsDetail, setShowRecordsDetail] = useState(false);
  const [filterMuscleGroup, setFilterMuscleGroup] = useState<MuscleGroup | ''>('');
  const [filterMonth, setFilterMonth] = useState('');

  const filteredRecords = records.filter((record) => {
    if (filterMuscleGroup && record.muscleGroup !== filterMuscleGroup) return false;
    if (filterMonth && !record.workoutDate.startsWith(filterMonth)) return false;
    return true;
  });

  // 프로필(사진/키) + 체중 기록 - 계정이 하나뿐이라 별도 선택 없이 바로 조회/수정함
  const [profile, setProfile] = useState<Profile>({ heightCm: null, profileImageDataUrl: null });
  const [weightLogs, setWeightLogs] = useState<BodyWeightLog[]>([]);
  const [showWeightModal, setShowWeightModal] = useState(false);

  const loadProfile = () => {
    fetchProfile()
      .then(setProfile)
      .catch((err) => setError(err.message));
  };

  const loadWeightLogs = () => {
    fetchWeightLogs()
      .then(setWeightLogs)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadProfile();
    loadWeightLogs();
  }, []);

  const handlePhotoSelect = async (file: File) => {
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setProfile(await updateProfilePhoto(dataUrl));
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로필 사진 저장 중 오류가 발생했습니다.');
    }
  };

  const handlePhotoRemove = async () => {
    try {
      setProfile(await deleteProfilePhoto());
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로필 사진 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleHeightSave = async (heightCm: number | null) => {
    try {
      setProfile(await updateProfileHeight(heightCm));
    } catch (err) {
      setError(err instanceof Error ? err.message : '키 저장 중 오류가 발생했습니다.');
    }
  };

  const handleAddWeightLog = async (input: { recordedDate: string; weightKg: number }) => {
    try {
      await createWeightLog(input);
      loadWeightLogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : '체중 기록 등록 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteWeightLog = async (id: number) => {
    try {
      await deleteWeightLog(id);
      loadWeightLogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : '체중 기록 삭제 중 오류가 발생했습니다.');
    }
  };

  const latestWeightKg = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weightKg : null;

  return (
    <div className="app">
      {error && <div className="error-banner">{error}</div>}

      <ProfileCard
        profile={profile}
        latestWeightKg={latestWeightKg}
        onPhotoSelect={handlePhotoSelect}
        onPhotoRemove={handlePhotoRemove}
        onHeightSave={handleHeightSave}
        onOpenWeightModal={() => setShowWeightModal(true)}
      />

      {showRecordsDetail ? (
        <div className="card section">
          <div className="card-header-row">
            <button className="text-button" onClick={() => setShowRecordsDetail(false)}>
              ‹ 뒤로
            </button>
            <h2 className="section-title">운동 기록</h2>
          </div>

          <div className="filter-bar-row">
            <div className="filter-bar">
              <select
                className="filter-bar__center-select"
                value={filterMuscleGroup}
                onChange={(e) => setFilterMuscleGroup(e.target.value as MuscleGroup | '')}
              >
                <option value="">전체 부위</option>
                {MUSCLE_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {MUSCLE_GROUP_LABELS[group]}
                  </option>
                ))}
              </select>
              <MonthFilterSelect value={filterMonth} onChange={setFilterMonth} />
            </div>
          </div>

          <WorkoutRecordList
            records={filteredRecords}
            onEdit={setEditingRecord}
            onDelete={handleDelete}
            onRequestCoaching={handleRequestCoaching}
            coachingLoadingId={coachingLoadingId}
          />
        </div>
      ) : (
        <div className="schedule-layout">
          <div className="card section">
            <div className="card-header-row">
              <h2 className="section-title">운동 기록</h2>
            </div>

            <WorkoutRecordList
              records={records}
              onEdit={setEditingRecord}
              onDelete={handleDelete}
              onRequestCoaching={handleRequestCoaching}
              coachingLoadingId={coachingLoadingId}
              limit={RECORDS_LIST_LIMIT}
              onViewAll={() => setShowRecordsDetail(true)}
            />
          </div>

          <div className="schedule-layout__right">
            <div className="card section">
              <div className="card-header-row">
                <h2 className="section-title">종목별 기록</h2>
              </div>

              <PersonalRecordList
                records={personalRecords}
                onSelect={handleViewExerciseHistory}
                onDelete={handleDeleteExercise}
              />
            </div>
          </div>
        </div>
      )}

      <button className="fab" onClick={() => setFormValues(emptyFormValues())} aria-label="운동 기록 추가">
        +
      </button>

      {formValues && (
        <Modal title="운동 기록 추가" onClose={() => setFormValues(null)}>
          <WorkoutRecordForm
            initialValues={formValues}
            onSubmit={async (input) => {
              await handleCreate(input);
              setFormValues(null);
            }}
          />
        </Modal>
      )}

      {editingRecord && (
        <Modal title="운동 기록 수정" onClose={() => setEditingRecord(null)}>
          <WorkoutRecordForm
            submitLabel="수정하기"
            initialValues={{
              workoutDate: editingRecord.workoutDate,
              muscleGroup: editingRecord.muscleGroup,
              status: editingRecord.status,
              memo: editingRecord.memo,
              exercises: editingRecord.exercises.map((exercise) => ({
                exerciseName: exercise.exerciseName,
                sets: exercise.sets.map((set) => ({ weightKg: set.weightKg, reps: set.reps })),
              })),
            }}
            onSubmit={async (input) => {
              await handleUpdate(input);
              setEditingRecord(null);
            }}
          />
        </Modal>
      )}

      {exerciseHistory && (
        <Modal title={exerciseHistory.exerciseName} onClose={() => setExerciseHistory(null)}>
          <ExerciseTrendModal history={exerciseHistory} />
        </Modal>
      )}

      {showWeightModal && (
        <Modal title="몸무게 기록" onClose={() => setShowWeightModal(false)}>
          <WeightTrendModal logs={weightLogs} onAdd={handleAddWeightLog} onDelete={handleDeleteWeightLog} />
        </Modal>
      )}
    </div>
  );
}
