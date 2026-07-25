-- O WhatsApp de contato passou a ser o telefone de "Dados do restaurante".
-- Antes de remover a coluna, aproveita o número antigo em quem ainda não tinha
-- telefone preenchido (quem já tinha mantém o dele, que é o que o painel mostra).
UPDATE "restaurants" SET "phone" = "whatsapp" WHERE trim("phone") = '' AND trim("whatsapp") <> '';--> statement-breakpoint
ALTER TABLE "restaurants" DROP COLUMN "whatsapp";
