-- 같은 루틴이 같은 날짜에 두 번 생성되는 걸 DB 레벨에서 막음 (동시 요청 경쟁 상태 대비)
CREATE UNIQUE INDEX uq_schedule_items_routine_start_date
    ON schedule_items (routine_id, start_date);
