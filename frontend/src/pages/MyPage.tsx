import { useRef, useState } from 'react';
import { updateProfilePhoto, deleteProfilePhoto } from '../api/client';
import { resizeImageToDataUrl } from '../imageResize';
import type { Profile } from '../types/profile';

interface Props {
  profile: Profile;
  onProfileChange: (profile: Profile) => void;
}

export function MyPage({ profile, onProfileChange }: Props) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      onProfileChange(await updateProfilePhoto(dataUrl));
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로필 사진 저장 중 오류가 발생했습니다.');
    }
  };

  const handlePhotoRemove = async () => {
    try {
      onProfileChange(await deleteProfilePhoto());
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로필 사진 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="app">
      {error && <div className="error-banner">{error}</div>}

      <div className="card section">
        <div className="card-header-row">
          <h2 className="section-title">마이페이지</h2>
        </div>

        <div className="profile-card">
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
                  onClick={handlePhotoRemove}
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
              <span className="profile-card__stat-label">아이디</span>
              <span className="profile-card__stat-value">{profile.username}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
