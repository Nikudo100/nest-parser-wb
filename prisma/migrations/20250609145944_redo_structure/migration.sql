/*
  Warnings:

  - You are about to drop the column `parsedProductId` on the `DailyStockSnapshot` table. All the data in the column will be lost.
  - You are about to drop the `OurProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ParsedProduct` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[productId,date]` on the table `DailyStockSnapshot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productId` to the `DailyStockSnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DailyStockSnapshot" DROP CONSTRAINT "DailyStockSnapshot_parsedProductId_fkey";

-- DropForeignKey
ALTER TABLE "OurProduct" DROP CONSTRAINT "OurProduct_parsedProductId_fkey";

-- DropIndex
DROP INDEX "DailyStockSnapshot_parsedProductId_date_key";

-- AlterTable
ALTER TABLE "DailyStockSnapshot" DROP COLUMN "parsedProductId",
ADD COLUMN     "productId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "OurProduct";

-- DropTable
DROP TABLE "ParsedProduct";

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "nmid" BIGINT NOT NULL,
    "name" TEXT,
    "brand" TEXT,
    "image" TEXT,
    "supplier" TEXT,
    "supplierId" INTEGER,
    "supplierRating" DOUBLE PRECISION,
    "rating" DOUBLE PRECISION,
    "reviewRating" DOUBLE PRECISION,
    "feedbacks" INTEGER,
    "price" INTEGER,
    "totalQuantity" INTEGER,
    "is_our_product" BOOLEAN NOT NULL DEFAULT false,
    "colors" JSONB,
    "parsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarehouseStock" (
    "id" SERIAL NOT NULL,
    "wh" INTEGER NOT NULL,
    "dtype" INTEGER,
    "dist" INTEGER,
    "qty" INTEGER NOT NULL,
    "priority" INTEGER,
    "time1" INTEGER,
    "time2" INTEGER,
    "sizeName" TEXT,
    "sizeRank" INTEGER,
    "optionId" BIGINT,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WarehouseStock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_nmid_key" ON "Product"("nmid");

-- CreateIndex
CREATE INDEX "Product_nmid_idx" ON "Product"("nmid");

-- CreateIndex
CREATE INDEX "WarehouseStock_productId_idx" ON "WarehouseStock"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStockSnapshot_productId_date_key" ON "DailyStockSnapshot"("productId", "date");

-- AddForeignKey
ALTER TABLE "DailyStockSnapshot" ADD CONSTRAINT "DailyStockSnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseStock" ADD CONSTRAINT "WarehouseStock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
