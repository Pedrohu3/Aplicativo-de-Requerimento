-- Novo status/ação "AJUSTES_SOLICITADOS" (devolver requerimento pro solicitante
-- corrigir, em vez de só aprovar/rejeitar). As CHECK constraints abaixo foram
-- geradas pelo Hibernate com os valores fixos do enum no momento em que a
-- tabela foi criada e NÃO são atualizadas automaticamente por ddl-auto=update
-- — sem isso, todo INSERT/UPDATE com o novo valor falha com
-- "violates check constraint" (mesmo problema já visto em users.role).
ALTER TABLE requerimentos DROP CONSTRAINT IF EXISTS requerimentos_status_check;
ALTER TABLE historico_aprovacao DROP CONSTRAINT IF EXISTS historico_aprovacao_acao_check;
