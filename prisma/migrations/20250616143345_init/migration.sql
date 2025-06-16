-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "nmId" BIGINT NOT NULL,
    "imtId" BIGINT,
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
CREATE TABLE "ProductCart" (
    "imtId" BIGINT NOT NULL,
    "nmId" BIGINT NOT NULL,
    "slug" TEXT,
    "name" TEXT,
    "vendorCode" TEXT,
    "description" TEXT,
    "options" JSONB,
    "groupedOptions" JSONB,
    "certificate" JSONB,
    "fullColors" JSONB,
    "selling" JSONB,
    "media" JSONB,
    "data" JSONB,
    "nmColorsNames" TEXT,
    "contents" TEXT,
    "hasRich" BOOLEAN,
    "parsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DailyStockSnapshot" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalStock" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "DailyStockSnapshot_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "Product_nmId_key" ON "Product"("nmId");

-- CreateIndex
CREATE INDEX "Product_nmId_idx" ON "Product"("nmId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCart_nmId_key" ON "ProductCart"("nmId");

-- CreateIndex
CREATE INDEX "ProductCart_nmId_idx" ON "ProductCart"("nmId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStockSnapshot_productId_date_key" ON "DailyStockSnapshot"("productId", "date");

-- CreateIndex
CREATE INDEX "WarehouseStock_productId_idx" ON "WarehouseStock"("productId");

-- AddForeignKey
ALTER TABLE "ProductCart" ADD CONSTRAINT "ProductCart_nmId_fkey" FOREIGN KEY ("nmId") REFERENCES "Product"("nmId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyStockSnapshot" ADD CONSTRAINT "DailyStockSnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseStock" ADD CONSTRAINT "WarehouseStock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
