import { useRef } from 'react';
import type { Profile } from '../types/profile';

interface Props {
  profile: Profile;
  onPhotoSelect: (file: File) => void;
  onPhotoRemove: () => void;
  onOpenMyRecords: () => void;
}

export function ProfileCard({ profile, onPhotoSelect, onPhotoRemove, onOpenMyRecords }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onPhotoSelect(file);
    e.target.value = '';
  };

  return (
    <div className="card section profile-card profile-card--mini">
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

      <span className="profile-card__name">{profile.username}</span>

      <button type="button" className="profile-card__records-btn" onClick={onOpenMyRecords}>
        내 기록 ›
      </button>
    </div>
  );
}
