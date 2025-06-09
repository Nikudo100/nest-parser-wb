-- CreateTable
CREATE TABLE "OurProduct" (
    "id" SERIAL NOT NULL,
    "nmid" BIGINT NOT NULL,
    "innerId" TEXT,
    "name" TEXT,
    "brand" TEXT,
    "image" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parsedProductId" INTEGER NOT NULL,

    CONSTRAINT "OurProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParsedProduct" (
    "id" SERIAL NOT NULL,
    "nmid" BIGINT NOT NULL,
    "name" TEXT,
    "brand" TEXT,
    "image" TEXT,
    "price" INTEGER,
    "isOur" BOOLEAN NOT NULL DEFAULT false,
    "parsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParsedProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyStockSnapshot" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalStock" INTEGER NOT NULL,
    "parsedProductId" INTEGER NOT NULL,

    CONSTRAINT "DailyStockSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OurProduct_nmid_key" ON "OurProduct"("nmid");

-- CreateIndex
CREATE UNIQUE INDEX "OurProduct_parsedProductId_key" ON "OurProduct"("parsedProductId");

-- CreateIndex
CREATE UNIQUE INDEX "ParsedProduct_nmid_key" ON "ParsedProduct"("nmid");

-- CreateIndex
CREATE INDEX "ParsedProduct_nmid_idx" ON "ParsedProduct"("nmid");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStockSnapshot_parsedProductId_date_key" ON "DailyStockSnapshot"("parsedProductId", "date");

-- AddForeignKey
ALTER TABLE "OurProduct" ADD CONSTRAINT "OurProduct_parsedProductId_fkey" FOREIGN KEY ("parsedProductId") REFERENCES "ParsedProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyStockSnapshot" ADD CONSTRAINT "DailyStockSnapshot_parsedProductId_fkey" FOREIGN KEY ("parsedProductId") REFERENCES "ParsedProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
