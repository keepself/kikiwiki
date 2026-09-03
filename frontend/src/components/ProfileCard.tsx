import { useEffect, useRef, useState } from 'react';
import type { Profile } from '../types/profile';

interface Props {
  profile: Profile;
  latestWeightKg: number | null;
  onPhotoSelect: (file: File) => void;
  onPhotoRemove: () => void;
  onHeightSave: (heightCm: number | null) => void;
  onOpenWeightModal: () => void;
}

export function ProfileCard({
  profile,
  latestWeightKg,
  onPhotoSelect,
  onPhotoRemove,
  onHeightSave,
  onOpenWeightModal,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [heightInput, setHeightInput] = useState(profile.heightCm != null ? String(profile.heightCm) : '');

  useEffect(() => {
    setHeightInput(profile.heightCm != null ? String(profile.heightCm) : '');
  }, [profile.heightCm]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onPhotoSelect(file);
    e.target.value = '';
  };

  const handleHeightBlur = () => {
    const num = heightInput ? Number(heightInput) : null;
    if (num !== profile.heightCm) {
      onHeightSave(num);
    }
  };

  return (
    <div className="card section profile-card">
      <div className="profile-card__photo-col">
        <div className="profile-card__photo-wrap">
          <button
            type="button"
            className="profile-card__photo"
            onClick={() => fileInputRef.current?.click()}
            aria-label="프로필 사진 변경"
          >
            {profile.profileImageDataUrl ? (
              <img src={profile.profileImageDataUrl} alt="프로필 사진" />
            ) : (
              <span className="profile-card__photo-placeholder">+</span>
            )}
          </button>
          {profile.profileImageDataUrl && (
            <button
              type="button"
              className="profile-card__photo-remove"
              onClick={onPhotoRemove}
              aria-label="사진 삭제"
            >
              ×
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
      </div>

      <div className="profile-card__stats">
        <div className="profile-card__stat">
          <span className="profile-card__stat-label">키</span>
          <div className="profile-card__height-field">
            <input
              type="number"
              min={50}
              max={250}
              value={heightInput}
              onChange={(e) => setHeightInput(e.target.value)}
              onBlur={handleHeightBlur}
              placeholder="예: 175"
            />
            <span className="profile-card__stat-unit">cm</span>
          </div>
        </div>

        <button type="button" className="profile-card__stat profile-card__stat--clickable" onClick={onOpenWeightModal}>
          <span className="profile-card__stat-label">몸무게</span>
          <span className="profile-card__stat-value">
            {latestWeightKg != null ? `${latestWeightKg}kg` : '기록 없음'}
          </span>
          <span className="profile-card__stat-hint">기록 보기 ›</span>
        </button>
      </div>
    </div>
  );
}
