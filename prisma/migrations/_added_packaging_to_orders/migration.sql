-- AlterTable
ALTER TABLE "Packaging"
ADD COLUMN "currentStock" REAL NOT NULL,
ADD CONSTRAINT "Packaging_type_key" UNIQUE ("type");

-- AlterTable
ALTER TABLE "OrderProduct"
DROP CONSTRAINT "OrderProduct_pkey",
ADD COLUMN "packagingId" INTEGER NOT NULL,
ADD CONSTRAINT "OrderProduct_pkey" PRIMARY KEY (
    "orderId",
    "productId",
    "packagingId"
);

-- AddForeignKey
ALTER TABLE "OrderProduct"
ADD CONSTRAINT "OrderProduct_packagingId_fkey" FOREIGN KEY ("packagingId") REFERENCES "Packaging" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;