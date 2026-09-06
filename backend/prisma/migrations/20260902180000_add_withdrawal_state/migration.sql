ALTER TABLE "blockchain_transactions"
  ADD COLUMN IF NOT EXISTS "to_address" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "amount" DECIMAL(38,18),
  ADD COLUMN IF NOT EXISTS "asset" VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "network" VARCHAR(50);

CREATE INDEX IF NOT EXISTS "blockchain_transactions_operation_id_idx"
  ON "blockchain_transactions"("operation_id");

CREATE INDEX IF NOT EXISTS "blockchain_transactions_status_idx"
  ON "blockchain_transactions"("status");
