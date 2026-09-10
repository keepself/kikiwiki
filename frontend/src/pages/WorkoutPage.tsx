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
  fetchActiveInjuries,
  recoverMuscleInjury,
  fetchSavedItems,
  createSavedItem,
  updateSavedItem,
  deleteSavedItem,
} from '../api/client';
import type {
  CoachingSuggestion,
  ExerciseHistoryResult,
  ExercisePersonalRecordSummary,
  MuscleGroup,
  MuscleInjury,
  WorkoutExerciseInput,
  WorkoutRecord,
  WorkoutRecordInput,
} from '../types/workout';
import { MUSCLE_GROUP_LABELS } from '../types/workout';
import type { Profile, BodyWeightLog } from '../types/profile';
import type { SavedItem, SavedItemInput } from '../types/storage';
import { resizeImageToDataUrl } from '../imageResize';
import { WorkoutRecordForm } from '../components/WorkoutRecordForm';
import { WorkoutRecordList } from '../components/WorkoutRecordList';
import { PersonalRecordList } from '../components/PersonalRecordList';
import { ExerciseTrendModal } from '../components/ExerciseTrendModal';
import { MonthFilterSelect } from '../components/MonthFilterSelect';
import { MuscleGroupFilterSelect } from '../components/MuscleGroupFilterSelect';
import { ProfileCard } from '../components/ProfileCard';
import { WeightTrendModal } from '../components/WeightTrendModal';
import { SavedItemForm } from '../components/SavedItemForm';
import { SavedItemList } from '../components/SavedItemList';
import { Modal } from '../components/Modal';

const WORKOUT_TIP_TAG = '운동';

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function emptyFormValues(): WorkoutRecordInput {
  return { workoutDate: todayStr(), muscleGroup: 'CHEST', status: 'PLANNED', memo: null, exercises: [] };
}

export function WorkoutPage() {
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<WorkoutRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<WorkoutRecord | null>(null);

  // "+ 기록 추가" 폼과, AI 코칭이 만들어준 다음주 계획 초안을 여는 폼이 같은 모달을 공유함 -
  // formValues가 null이 아니면 모달이 열리고, 그 값이 폼의 초기값이 됨
  const [formValues, setFormValues] = useState<WorkoutRecordInput | null>(null);

  const [personalRecords, setPersonalRecords] = useState<ExercisePersonalRecordSummary[]>([]);
  // 종목이 많아지면 "내 기록" 모달에서 스크롤이 길어지니 이름으로 걸러볼 수 있게 함
  const [myRecordsSearch, setMyRecordsSearch] = useState('');

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

  // 아직 회복 안 된(진행 중인) 부상 목록 - "목표 운동" 위 배너에 보여줌
  const [activeInjuries, setActiveInjuries] = useState<MuscleInjury[]>([]);

  const loadInjuries = () => {
    fetchActiveInjuries()
      .then(setActiveInjuries)
      .catch((err) => setError(err.message));
  };

  // 부상은 원래 계획중 카드의 "⋯" 메뉴로만 표시할 수 있었는데, 그 부위에 아직 계획이 없으면
  // 미리 빈 계획을 하나 만들어야 하는 번거로움이 있었음 - 계획 없이도 바로 부상 등록할 수 있게 함
  const [showInjuryPicker, setShowInjuryPicker] = useState(false);
  const ALL_MUSCLE_GROUPS: MuscleGroup[] = ['CHEST', 'BACK', 'LOWER_BODY', 'BICEPS', 'TRICEPS', 'SHOULDERS'];

  const handleDirectInjury = async (muscleGroup: MuscleGroup) => {
    setShowInjuryPicker(false);
    try {
      await createWorkoutRecord({ workoutDate: todayStr(), muscleGroup, status: 'INJURED', memo: null, exercises: [] });
      loadRecords();
      loadInjuries();
    } catch (err) {
      setError(err instanceof Error ? err.message : '부상 등록 중 오류가 발생했습니다.');
    }
  };

  // AI가 제안한 무게/횟수를 실제 입력칸 기본값이자 "목표"로 같이 저장해둠 - 다음에 이 기록을
  // 완료 처리할 때 "지난 목표 대비 실제로 얼마나 했는지" 옆에 보여줄 수 있게
  const suggestionToInput = (suggestion: CoachingSuggestion): WorkoutRecordInput => ({
    workoutDate: suggestion.suggestedDate,
    muscleGroup: suggestion.muscleGroup,
    status: 'PLANNED',
    memo: suggestion.memo,
    exercises: suggestion.exercises.map((exercise) => ({
      exerciseName: exercise.exerciseName,
      sets: exercise.sets.map((set) => ({
        weightKg: set.weightKg,
        reps: set.reps,
        targetWeightKg: set.weightKg,
        targetReps: set.reps,
      })),
    })),
  });

  // AI 코칭 로딩 상태 - 체크 처리와 부상 회복 처리(자동 생성)가 같이 씀
  const [coachingLoadingId, setCoachingLoadingId] = useState<number | null>(null);

  // AI 코칭 호출이 네트워크/서버 오류로 실패하면 상태(완료/목표미달/회복)는 이미 저장된 뒤라
  // 다음 계획만 못 만들어진 채로 남음 - recordId별로 실패 시점의 nextDate를 기억해뒀다가
  // "다시 시도" 버튼으로 같은 날짜로 재시도할 수 있게 함. 그냥 화면 상태로만 두면 새로고침하는 순간
  // 실패했던 사실 자체가 사라져서 브라우저에 저장해뒀다가 새로고침해도 남아있게 함
  const COACHING_RETRY_STORAGE_KEY = 'kikiwiki-workout-coaching-retry';

  const loadCoachingRetryFromStorage = (): Record<number, string> => {
    try {
      const raw = localStorage.getItem(COACHING_RETRY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const [coachingRetry, setCoachingRetryState] = useState<Record<number, string>>(loadCoachingRetryFromStorage);

  const setCoachingRetry = (updater: (cur: Record<number, string>) => Record<number, string>) => {
    setCoachingRetryState((cur) => {
      const next = updater(cur);
      try {
        localStorage.setItem(COACHING_RETRY_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // 저장 실패(프라이빗 모드 등)해도 화면 동작 자체엔 지장 없게 조용히 무시
      }
      return next;
    });
  };

  const runCoaching = async (recordId: number, nextDate: string) => {
    setCoachingLoadingId(recordId);
    try {
      const coaching = await fetchWorkoutCoaching(recordId, nextDate);
      if (!coaching.configured) {
        // API 키 미설정처럼 재시도해도 똑같이 실패할 문제는 재시도 대상으로 남기지 않음
        setError(coaching.message ?? 'AI 코칭을 만들 수 없었어요.');
      } else if (coaching.suggestion) {
        await createWorkoutRecord(suggestionToInput(coaching.suggestion));
      }
      setCoachingRetry((cur) => {
        if (!(recordId in cur)) return cur;
        const next = { ...cur };
        delete next[recordId];
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 코칭 요청 중 오류가 발생했습니다.');
      setCoachingRetry((cur) => ({ ...cur, [recordId]: nextDate }));
    } finally {
      setCoachingLoadingId(null);
      loadRecords();
      loadPersonalRecords();
      loadInjuries();
    }
  };

  const handleRetryCoaching = (record: WorkoutRecord) => {
    const nextDate = coachingRetry[record.id] ?? addDays(todayStr(), 7);
    return runCoaching(record.id, nextDate);
  };

  const coachingRetryIds = new Set(Object.keys(coachingRetry).map(Number));

  // "회복 완료"도 완료/목표미달 체크랑 마찬가지로 다음 날짜를 한 번 물어보고 나서 바로 처리함 -
  // 부상 시작 시점의 기록(sourceRecordId)을 기준으로 AI가 "회복 직후니 가볍게 복귀" 계획을 자동으로 만들어줌
  const [pendingRecovery, setPendingRecovery] = useState<{
    muscleGroup: MuscleGroup;
    sourceRecordId: number;
    nextDate: string;
  } | null>(null);

  const startRecovery = (injury: MuscleInjury) => {
    setPendingRecovery({ muscleGroup: injury.muscleGroup, sourceRecordId: injury.sourceRecordId, nextDate: addDays(todayStr(), 7) });
  };

  const confirmRecovery = async () => {
    if (!pendingRecovery) return;
    const { muscleGroup, sourceRecordId, nextDate } = pendingRecovery;
    setPendingRecovery(null);

    try {
      await recoverMuscleInjury(muscleGroup);
    } catch (err) {
      setError(err instanceof Error ? err.message : '회복 처리 중 오류가 발생했습니다.');
      loadInjuries();
      return;
    }

    await runCoaching(sourceRecordId, nextDate);
  };

  useEffect(() => {
    loadRecords();
    loadPersonalRecords();
    loadInjuries();
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

  // 이미 저장된 기록의 상태를 바꿔서 다시 저장함 (계획중 카드의 완료/실패/부상/휴식 표시에 씀).
  // exercises를 따로 넘기면(완료/목표미달 체크에서 실제로 한 무게/횟수를 고친 경우) 그걸 쓰고,
  // 아니면(부상 표시 등) 기존 기록의 종목/세트를 그대로 씀
  const toInput = (
    record: WorkoutRecord,
    status: WorkoutRecordInput['status'],
    exercises?: WorkoutExerciseInput[]
  ): WorkoutRecordInput => ({
    workoutDate: record.workoutDate,
    muscleGroup: record.muscleGroup,
    status,
    memo: record.memo,
    exercises:
      exercises ??
      record.exercises.map((exercise) => ({
        exerciseName: exercise.exerciseName,
        sets: exercise.sets.map((set) => ({
          weightKg: set.weightKg,
          reps: set.reps,
          targetWeightKg: set.targetWeightKg,
          targetReps: set.targetReps,
        })),
      })),
  });

  const handleMarkOther = async (record: WorkoutRecord) => {
    try {
      await updateWorkoutRecord(record.id, toInput(record, 'INJURED'));
      loadRecords();
      loadPersonalRecords();
      loadInjuries();
    } catch (err) {
      setError(err instanceof Error ? err.message : '운동 기록 상태 변경 중 오류가 발생했습니다.');
    }
  };

  // 계획중 카드에서 완료/목표미달을 체크하면: 상태를 저장하고, 그 결과를 반영한 다음 계획을 검토 없이
  // 곧바로 "목표 운동"에 만들어둠 - 체크 버튼을 누른 것 자체가 이미 확정 행동이라 폼으로 다시 확인받지 않음
  const handleCheckResult = async (
    record: WorkoutRecord,
    result: 'COMPLETED' | 'INCOMPLETE',
    nextDate: string,
    exercises: WorkoutExerciseInput[]
  ) => {
    try {
      await updateWorkoutRecord(record.id, toInput(record, result, exercises));
    } catch (err) {
      setError(err instanceof Error ? err.message : '운동 기록 수정 중 오류가 발생했습니다.');
      loadRecords();
      loadPersonalRecords();
      return;
    }

    await runCoaching(record.id, nextDate);
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
  const [filterMuscleGroups, setFilterMuscleGroups] = useState<Set<MuscleGroup>>(new Set());
  const [filterMonth, setFilterMonth] = useState('');

  const filteredRecords = records.filter((record) => {
    if (filterMuscleGroups.size > 0 && !filterMuscleGroups.has(record.muscleGroup)) return false;
    if (filterMonth && !record.workoutDate.startsWith(filterMonth)) return false;
    return true;
  });

  // 아직 안 한 "목표 운동"은 필터(부위/기간)랑 상관없이 항상 다 보여줌 - 개수가 적어서 거를 이유가 없고,
  // 운동기록(지난 기록)만 필터로 걸러보게 함
  const targetRecords = records.filter((record) => record.status === 'PLANNED');
  const historyRecords = filteredRecords.filter((record) => record.status !== 'PLANNED');
  // 탭 배지는 필터 걸어도 줄어들지 않게 항상 전체 개수로 보여줌(목표운동/꿀팁저장소 배지랑 기준을 맞춤) -
  // 화면에 보이는 목록만 필터링된 historyRecords를 씀
  const totalHistoryCount = records.filter((record) => record.status !== 'PLANNED').length;

  // 이미 목표 운동이 있거나 부상 중인 부위 - 새로 계획을 만들 때 이 부위들은 고를 수 없게 함
  const unavailableMuscleGroups = new Set<MuscleGroup>([
    ...targetRecords.map((record) => record.muscleGroup),
    ...activeInjuries.map((injury) => injury.muscleGroup),
  ]);

  // 프로필(사진/키) + 체중 기록 - 계정이 하나뿐이라 별도 선택 없이 바로 조회/수정함
  const [profile, setProfile] = useState<Profile>({ username: '', heightCm: null, profileImageDataUrl: null });
  const [weightLogs, setWeightLogs] = useState<BodyWeightLog[]>([]);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showMyRecordsModal, setShowMyRecordsModal] = useState(false);
  const [heightInput, setHeightInput] = useState('');

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

  useEffect(() => {
    setHeightInput(profile.heightCm != null ? String(profile.heightCm) : '');
  }, [profile.heightCm]);

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

  const handleHeightBlur = () => {
    const num = heightInput ? Number(heightInput) : null;
    if (num !== profile.heightCm) {
      handleHeightSave(num);
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

  // 목표운동/운동기록/꿀팁저장소를 카드 3장으로 늘어놓는 대신 탭으로 전환해서 봄 - 한 번에 하나만 보임
  const [activeWorkoutTab, setActiveWorkoutTab] = useState<'target' | 'history' | 'tips'>('target');

  // 운동 꿀팁 저장소 - 기존 정보저장소(SavedItem)를 그대로 쓰되 '운동' 태그로만 걸러서 보여줌
  const [workoutTips, setWorkoutTips] = useState<SavedItem[]>([]);
  const [editingTip, setEditingTip] = useState<SavedItem | null>(null);
  const [tipFormValues, setTipFormValues] = useState<SavedItemInput | null>(null);

  const loadWorkoutTips = () => {
    fetchSavedItems()
      .then((items) => setWorkoutTips(items.filter((item) => item.tags.includes(WORKOUT_TIP_TAG))))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadWorkoutTips();
  }, []);

  const handleCreateTip = async (input: SavedItemInput) => {
    try {
      await createSavedItem(input);
      loadWorkoutTips();
    } catch (err) {
      setError(err instanceof Error ? err.message : '운동 꿀팁 등록 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateTip = async (input: SavedItemInput) => {
    if (!editingTip) return;
    try {
      await updateSavedItem(editingTip.id, input);
      loadWorkoutTips();
    } catch (err) {
      setError(err instanceof Error ? err.message : '운동 꿀팁 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteTip = async (id: number) => {
    try {
      await deleteSavedItem(id);
      loadWorkoutTips();
    } catch (err) {
      setError(err instanceof Error ? err.message : '운동 꿀팁 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="app">
      {error && <div className="error-banner">{error}</div>}

      <ProfileCard
        profile={profile}
        onPhotoSelect={handlePhotoSelect}
        onPhotoRemove={handlePhotoRemove}
        onOpenMyRecords={() => setShowMyRecordsModal(true)}
      />

      <div className="schedule-layout__stack">
          {activeInjuries.map((injury) =>
            pendingRecovery?.muscleGroup === injury.muscleGroup ? (
              <div className="injury-banner" key={injury.muscleGroup}>
                <span className="injury-banner__icon">🤕</span>
                <span className="injury-banner__text">
                  다음 {MUSCLE_GROUP_LABELS[injury.muscleGroup]} 운동 날짜는?
                </span>
                <input
                  type="date"
                  min={todayStr()}
                  value={pendingRecovery.nextDate}
                  onChange={(e) =>
                    setPendingRecovery((cur) => (cur ? { ...cur, nextDate: e.target.value } : cur))
                  }
                />
                <button type="button" className="injury-banner__recover" onClick={confirmRecovery}>
                  확인
                </button>
                <button type="button" className="injury-banner__recover" onClick={() => setPendingRecovery(null)}>
                  취소
                </button>
              </div>
            ) : (
              <div className="injury-banner" key={injury.muscleGroup}>
                <span className="injury-banner__icon">🤕</span>
                <span className="injury-banner__text">
                  <b>{MUSCLE_GROUP_LABELS[injury.muscleGroup]}</b> 부상 중이에요 — 회복될 때까지 이 부위 다음 계획은 만들지 않아요
                  <span className="injury-banner__date">{injury.injuredAt.slice(5, 10).replace('-', '/')}부터</span>
                </span>
                <button type="button" className="injury-banner__recover" onClick={() => startRecovery(injury)}>
                  회복 완료
                </button>
              </div>
            )
          )}

          <div className="injury-add-row">
            {showInjuryPicker ? (
              <div className="injury-add-picker">
                <span className="injury-add-picker__label">어디를 다치셨나요?</span>
                <div className="weekday-picker">
                  {ALL_MUSCLE_GROUPS.filter((group) => !activeInjuries.some((injury) => injury.muscleGroup === group)).map(
                    (group) => (
                      <button
                        type="button"
                        key={group}
                        className="weekday-picker__day"
                        onClick={() => handleDirectInjury(group)}
                      >
                        {MUSCLE_GROUP_LABELS[group]}
                      </button>
                    )
                  )}
                </div>
                <button type="button" className="text-button" onClick={() => setShowInjuryPicker(false)}>
                  취소
                </button>
              </div>
            ) : (
              <button type="button" className="text-button" onClick={() => setShowInjuryPicker(true)}>
                + 부상 등록
              </button>
            )}
          </div>

          <div className="card section">
            <div className="workout-tabs-row">
              <div className="workout-tabs">
                <button
                  type="button"
                  className={`workout-tab ${activeWorkoutTab === 'target' ? 'workout-tab--active' : ''}`}
                  onClick={() => setActiveWorkoutTab('target')}
                >
                  목표 운동 <span className="workout-tab__count">{targetRecords.length}</span>
                </button>
                <button
                  type="button"
                  className={`workout-tab ${activeWorkoutTab === 'history' ? 'workout-tab--active' : ''}`}
                  onClick={() => setActiveWorkoutTab('history')}
                >
                  운동 기록 <span className="workout-tab__count">{totalHistoryCount}</span>
                </button>
                <button
                  type="button"
                  className={`workout-tab ${activeWorkoutTab === 'tips' ? 'workout-tab--active' : ''}`}
                  onClick={() => setActiveWorkoutTab('tips')}
                >
                  꿀팁 저장소 <span className="workout-tab__count">{workoutTips.length}</span>
                </button>
              </div>

              {activeWorkoutTab === 'target' && (
                <button type="button" className="workout-tab-add" onClick={() => setFormValues(emptyFormValues())}>
                  + 추가
                </button>
              )}
              {activeWorkoutTab === 'tips' && (
                <button
                  type="button"
                  className="workout-tab-add"
                  onClick={() => setTipFormValues({ type: 'LINK', title: '', url: null, content: null, tags: [WORKOUT_TIP_TAG] })}
                >
                  + 추가
                </button>
              )}
            </div>

            {activeWorkoutTab === 'target' && (
              <WorkoutRecordList
                records={targetRecords}
                onEdit={setEditingRecord}
                onDelete={handleDelete}
                onCheckResult={handleCheckResult}
                onMarkOther={handleMarkOther}
                coachingLoadingId={coachingLoadingId}
                coachingRetryIds={coachingRetryIds}
                onRetryCoaching={handleRetryCoaching}
              />
            )}

            {activeWorkoutTab === 'history' && (
              <>
                <div className="filter-bar-row">
                  <div className="filter-bar">
                    <MuscleGroupFilterSelect value={filterMuscleGroups} onChange={setFilterMuscleGroups} />
                    <MonthFilterSelect value={filterMonth} onChange={setFilterMonth} />
                  </div>
                </div>

                <WorkoutRecordList
                  records={historyRecords}
                  onEdit={setEditingRecord}
                  onDelete={handleDelete}
                  onCheckResult={handleCheckResult}
                  onMarkOther={handleMarkOther}
                  coachingLoadingId={coachingLoadingId}
                  coachingRetryIds={coachingRetryIds}
                  onRetryCoaching={handleRetryCoaching}
                />
              </>
            )}

            {activeWorkoutTab === 'tips' && (
              <SavedItemList items={workoutTips} onEdit={setEditingTip} onDelete={handleDeleteTip} />
            )}
          </div>
      </div>

      {showMyRecordsModal && (
        <Modal title="내 기록" onClose={() => { setShowMyRecordsModal(false); setMyRecordsSearch(''); }}>
          {personalRecords.length > 5 && (
            <input
              type="text"
              className="my-records-search"
              value={myRecordsSearch}
              onChange={(e) => setMyRecordsSearch(e.target.value)}
              placeholder="종목 이름으로 찾기"
            />
          )}

          <PersonalRecordList
            records={personalRecords.filter((r) => r.exerciseName.toLowerCase().includes(myRecordsSearch.trim().toLowerCase()))}
            onSelect={handleViewExerciseHistory}
            onDelete={handleDeleteExercise}
          />

          <div className="my-records-vitals">
            <label className="my-records-vitals__height">
              키
              <input
                type="number"
                min={50}
                max={250}
                value={heightInput}
                onChange={(e) => setHeightInput(e.target.value)}
                onBlur={handleHeightBlur}
                placeholder="예: 175"
              />
              cm
            </label>

            <button
              type="button"
              className="my-records-vitals__weight"
              onClick={() => {
                setShowMyRecordsModal(false);
                setShowWeightModal(true);
              }}
            >
              몸무게 {latestWeightKg != null ? `${latestWeightKg}kg` : '기록 없음'} · 기록 보기 ›
            </button>
          </div>
        </Modal>
      )}

      {formValues && (
        <Modal title="운동 기록 추가" onClose={() => setFormValues(null)}>
          <WorkoutRecordForm
            initialValues={formValues}
            unavailableMuscleGroups={unavailableMuscleGroups}
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
            isEditing
            initialValues={{
              workoutDate: editingRecord.workoutDate,
              muscleGroup: editingRecord.muscleGroup,
              status: editingRecord.status,
              memo: editingRecord.memo,
              exercises: editingRecord.exercises.map((exercise) => ({
                exerciseName: exercise.exerciseName,
                sets: exercise.sets.map((set) => ({
                  weightKg: set.weightKg,
                  reps: set.reps,
                  targetWeightKg: set.targetWeightKg,
                  targetReps: set.targetReps,
                })),
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

      {tipFormValues && (
        <Modal title="운동 꿀팁 추가" onClose={() => setTipFormValues(null)}>
          <SavedItemForm
            initialValues={tipFormValues}
            onSubmit={async (input) => {
              await handleCreateTip({ ...input, tags: [...new Set([...input.tags, WORKOUT_TIP_TAG])] });
              setTipFormValues(null);
            }}
          />
        </Modal>
      )}

      {editingTip && (
        <Modal title="운동 꿀팁 수정" onClose={() => setEditingTip(null)}>
          <SavedItemForm
            submitLabel="수정하기"
            initialValues={{
              type: editingTip.type,
              title: editingTip.title,
              url: editingTip.url,
              content: editingTip.content,
              tags: editingTip.tags,
            }}
            onSubmit={async (input) => {
              await handleUpdateTip({ ...input, tags: [...new Set([...input.tags, WORKOUT_TIP_TAG])] });
              setEditingTip(null);
            }}
          />
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
