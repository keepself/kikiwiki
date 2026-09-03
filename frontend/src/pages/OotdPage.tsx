import { useEffect, useState } from 'react';
import { fetchOotdEntries, createOotdEntry, deleteOotdEntry, API_BASE_URL } from '../api/client';
import type { OotdEntry, OotdEntryInput } from '../types/ootd';
import { OotdGrid } from '../components/OotdGrid';
import { OotdUploadForm } from '../components/OotdUploadForm';
import { Modal } from '../components/Modal';

export function OotdPage() {
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<OotdEntry[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<OotdEntry | null>(null);
  const [tagSearch, setTagSearch] = useState('');

  const loadEntries = () => {
    fetchOotdEntries()
      .then(setEntries)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleCreate = async (input: OotdEntryInput) => {
    try {
      await createOotdEntry(input);
      loadEntries();
      setShowUpload(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OOTD 등록 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('이 사진을 삭제할까요?')) return;
    try {
      await deleteOotdEntry(id);
      loadEntries();
      setSelectedEntry(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OOTD 삭제 중 오류가 발생했습니다.');
    }
  };

  const query = tagSearch.trim().toLowerCase();
  const filteredEntries = query
    ? entries.filter((entry) => entry.tags.some((tag) => tag.toLowerCase().includes(query)))
    : entries;

  return (
    <div className="app app--ootd">
      {error && <div className="error-banner">{error}</div>}

      <div className="ootd-tag-search-wrap">
        <svg className="ootd-tag-search__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="8.5" cy="8.5" r="5.5" />
          <path d="m17 17-4.35-4.35" />
        </svg>
        <input
          type="text"
          className="ootd-tag-search"
          value={tagSearch}
          onChange={(e) => setTagSearch(e.target.value)}
          placeholder="태그로 검색"
        />
      </div>

      <OotdGrid entries={filteredEntries} onSelect={setSelectedEntry} />

      <button className="fab" onClick={() => setShowUpload(true)} aria-label="OOTD 추가">
        +
      </button>

      {showUpload && (
        <Modal title="OOTD 추가" onClose={() => setShowUpload(false)}>
          <OotdUploadForm onSubmit={handleCreate} />
        </Modal>
      )}

      {selectedEntry && (
        <Modal title={selectedEntry.entryDate} onClose={() => setSelectedEntry(null)}>
          <div className="ootd-detail">
            <div className="ootd-detail__frame">
              <img src={`${API_BASE_URL}${selectedEntry.imageUrl}`} alt={selectedEntry.entryDate} />
              <div className="ootd-detail__scrim">
                {selectedEntry.tags.length > 0 && (
                  <div className="ootd-detail__tags">
                    {selectedEntry.tags.map((tag) => (
                      <span className="ootd-detail__tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {selectedEntry.memo && <div className="ootd-detail__memo">{selectedEntry.memo}</div>}
              </div>
              <button type="button" className="ootd-detail__delete" onClick={() => handleDelete(selectedEntry.id)} aria-label="삭제">
                ×
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
