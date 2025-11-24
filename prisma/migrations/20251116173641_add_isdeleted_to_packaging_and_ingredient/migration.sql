-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "name" SET DEFAULT '',
ALTER COLUMN "address" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Packaging" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
