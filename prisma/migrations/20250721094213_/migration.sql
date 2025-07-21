/*
  Warnings:

  - The primary key for the `OrderProduct` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[type]` on the table `Packaging` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `packagingId` to the `OrderProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentStock` to the `Packaging` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderProduct" DROP CONSTRAINT "OrderProduct_pkey",
ADD COLUMN     "packagingId" INTEGER NOT NULL,
ADD CONSTRAINT "OrderProduct_pkey" PRIMARY KEY ("orderId", "productId", "packagingId");

-- AlterTable
ALTER TABLE "Packaging" ADD COLUMN     "currentStock" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Packaging_type_key" ON "Packaging"("type");

-- AddForeignKey
ALTER TABLE "OrderProduct" ADD CONSTRAINT "OrderProduct_packagingId_fkey" FOREIGN KEY ("packagingId") REFERENCES "Packaging"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
