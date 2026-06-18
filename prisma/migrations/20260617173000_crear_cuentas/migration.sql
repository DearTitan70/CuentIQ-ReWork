CREATE TYPE "TipoCuenta" AS ENUM ('bancaria', 'billetera');

CREATE TABLE "cuentas" (
    "usuario_id" UUID NOT NULL,
    "id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoCuenta" NOT NULL,
    "moneda" "Moneda" NOT NULL,
    "saldo_inicial" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cuentas_pkey" PRIMARY KEY ("usuario_id", "id")
);

CREATE INDEX "cuentas_usuario_id_idx" ON "cuentas"("usuario_id");

ALTER TABLE "cuentas"
ADD CONSTRAINT "cuentas_usuario_id_fkey"
FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
