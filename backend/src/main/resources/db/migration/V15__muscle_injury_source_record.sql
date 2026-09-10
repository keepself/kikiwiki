ALTER TABLE muscle_injuries ADD COLUMN source_record_id BIGINT;
UPDATE muscle_injuries SET source_record_id = 0 WHERE source_record_id IS NULL;
ALTER TABLE muscle_injuries ALTER COLUMN source_record_id SET NOT NULL;
