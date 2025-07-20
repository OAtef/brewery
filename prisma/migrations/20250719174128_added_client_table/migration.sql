-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "client_number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "application_used" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_client_number_key" ON "Client"("client_number");
