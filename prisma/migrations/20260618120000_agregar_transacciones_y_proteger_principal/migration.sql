CREATE TYPE "TipoTransaccion" AS ENUM ('ingreso', 'gasto');

CREATE TABLE "transacciones" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "cuenta_id" INTEGER NOT NULL,
    "tipo" "TipoTransaccion" NOT NULL,
    "monto" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transacciones_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "transacciones_monto_positivo" CHECK ("monto" > 0),
    CONSTRAINT "transacciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
    CONSTRAINT "transacciones_cuenta_fkey" FOREIGN KEY ("usuario_id", "cuenta_id") REFERENCES "cuentas"("usuario_id", "id") ON DELETE RESTRICT
);

CREATE INDEX "transacciones_usuario_id_cuenta_id_idx" ON "transacciones"("usuario_id", "cuenta_id");

CREATE FUNCTION impedir_borrado_cuenta_principal() RETURNS trigger AS $$
BEGIN
  IF OLD.id = 0 AND EXISTS (SELECT 1 FROM usuarios WHERE id = OLD.usuario_id) THEN
    RAISE EXCEPTION 'La cuenta principal no se puede eliminar';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cuentas_principal_no_eliminable
BEFORE DELETE ON cuentas
FOR EACH ROW EXECUTE FUNCTION impedir_borrado_cuenta_principal();
