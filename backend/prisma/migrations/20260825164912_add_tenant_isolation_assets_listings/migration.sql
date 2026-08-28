-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "tenant_id" INTEGER;

-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "tenant_id" INTEGER;

-- CreateIndex
CREATE INDEX "idx_assets_tenant" ON "assets"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_listings_tenant" ON "listings"("tenant_id");

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
