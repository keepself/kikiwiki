ALTER TABLE workout_records DROP CONSTRAINT workout_records_status_check;
ALTER TABLE workout_records ADD CONSTRAINT workout_records_status_check
    CHECK (status IN ('PLANNED', 'COMPLETED', 'INCOMPLETE', 'INJURED', 'SKIPPED'));
