CREATE TYPE "Moneda" AS ENUM ('COP', 'USD');

CREATE TABLE "planes" (
    "id" UUID NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "limite_cuentas" INTEGER NOT NULL,
    "limite_transacciones_mes" INTEGER NOT NULL,
    "limite_creditos" INTEGER NOT NULL,
    "limite_consultas_ia_mes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "moneda_base" "Moneda" NOT NULL DEFAULT 'COP',
    "plan_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "planes_codigo_key" ON "planes"("codigo");
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
CREATE INDEX "usuarios_plan_id_idx" ON "usuarios"("plan_id");

ALTER TABLE "usuarios"
ADD CONSTRAINT "usuarios_plan_id_fkey"
FOREIGN KEY ("plan_id") REFERENCES "planes"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
