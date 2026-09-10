import { useState } from 'react';
import type { MuscleGroup } from '../types/workout';
import { MUSCLE_GROUP_LABELS } from '../types/workout';

interface Props {
  value: Set<MuscleGroup>; // 비어있으면 전체 부위
  onChange: (value: Set<MuscleGroup>) => void;
}

const MUSCLE_GROUPS: MuscleGroup[] = ['CHEST', 'BACK', 'LOWER_BODY', 'BICEPS', 'TRICEPS', 'SHOULDERS'];

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4.5 10.5 3.5 3.5 7.5-8" />
    </svg>
  );
}

export function MuscleGroupFilterSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const selected = [...value];

  const label =
    selected.length === 0
      ? '전체 부위'
      : selected.length === 1
        ? MUSCLE_GROUP_LABELS[selected[0]]
        : `${MUSCLE_GROUP_LABELS[selected[0]]} 외 ${selected.length - 1}개`;

  const toggle = (group: MuscleGroup) => {
    const next = new Set(value);
    if (next.has(group)) {
      next.delete(group);
    } else {
      next.add(group);
    }
    onChange(next);
  };

  return (
    <div className="row-menu-wrap month-filter">
      <button type="button" className="month-filter__trigger" onClick={() => setOpen((v) => !v)}>
        {label}
      </button>

      {open && (
        <>
          <div className="menu-backdrop" onClick={() => setOpen(false)} />
          <div className="row-menu-popover muscle-filter__dropdown">
            {MUSCLE_GROUPS.map((group) => {
              const isSelected = value.has(group);
              return (
                <button
                  type="button"
                  key={group}
                  className={`muscle-filter__row ${isSelected ? 'muscle-filter__row--selected' : ''}`}
                  onClick={() => toggle(group)}
                >
                  <span>{MUSCLE_GROUP_LABELS[group]}</span>
                  {isSelected && <CheckIcon />}
                </button>
              );
            })}

            {value.size > 0 && (
              <button
                type="button"
                className="month-filter__clear"
                onClick={() => {
                  onChange(new Set());
                  setOpen(false);
                }}
              >
                전체 부위 보기
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
