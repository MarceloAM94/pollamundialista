-- Migrate TIMESTAMP to TIMESTAMPTZ for all DateTime columns.
-- The DB timezone is UTC, so stored values are already UTC wall-clock times.
-- USING "column" AT TIME ZONE 'UTC' explicitly interprets them as UTC.

ALTER TABLE "Usuario"
  ALTER COLUMN "createdAt" TYPE TIMESTAMP(3) WITH TIME ZONE USING "createdAt" AT TIME ZONE 'UTC';

ALTER TABLE "Partido"
  ALTER COLUMN "fechaHora" TYPE TIMESTAMP(3) WITH TIME ZONE USING "fechaHora" AT TIME ZONE 'UTC';

ALTER TABLE "Pronostico"
  ALTER COLUMN "createdAt" TYPE TIMESTAMP(3) WITH TIME ZONE USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" TYPE TIMESTAMP(3) WITH TIME ZONE USING "updatedAt" AT TIME ZONE 'UTC';
