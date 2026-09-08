-- CreateTable
CREATE TABLE "appsumo_licenses" (
    "id" SERIAL NOT NULL,
    "license_key" VARCHAR(255) NOT NULL,
    "event" VARCHAR(50) NOT NULL,
    "license_status" VARCHAR(50),
    "event_timestamp" BIGINT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER,
    "tenant_id" INTEGER,
    "raw_payload" JSONB,

    CONSTRAINT "appsumo_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appsumo_licenses_license_key_key" ON "appsumo_licenses"("license_key");

-- CreateIndex
CREATE INDEX "appsumo_licenses_user_id_idx" ON "appsumo_licenses"("user_id");

-- CreateIndex
CREATE INDEX "appsumo_licenses_tenant_id_idx" ON "appsumo_licenses"("tenant_id");

-- CreateIndex
CREATE INDEX "appsumo_licenses_license_status_idx" ON "appsumo_licenses"("license_status");

-- AddForeignKey
ALTER TABLE "appsumo_licenses" ADD CONSTRAINT "appsumo_licenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appsumo_licenses" ADD CONSTRAINT "appsumo_licenses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

