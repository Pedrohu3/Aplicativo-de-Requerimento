-- Coluna admin na tabela users (adicionada à entidade mas não ao banco)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Cria a tabela de cursos
CREATE TABLE IF NOT EXISTS cursos (
    id      BIGSERIAL    PRIMARY KEY,
    nome    VARCHAR(120) NOT NULL
);

-- Cria a tabela de responsáveis por etapa de cada curso
CREATE TABLE IF NOT EXISTS curso_responsaveis (
    id        BIGSERIAL   PRIMARY KEY,
    curso_id  BIGINT      NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    role      VARCHAR(50) NOT NULL,
    user_id   BIGINT      NOT NULL REFERENCES users(id),
    UNIQUE (curso_id, role)
);

-- Adiciona curso_id na tabela de usuários (nullable — só relevante para ALUNO)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS curso_id BIGINT REFERENCES cursos(id);

-- Adiciona curso_id na tabela de requerimentos (snapshot do curso no momento do envio)
ALTER TABLE requerimentos
    ADD COLUMN IF NOT EXISTS curso_id BIGINT REFERENCES cursos(id);

-- Amplia a coluna de valores para suportar anexos em base64
ALTER TABLE valores_campo ALTER COLUMN valor TYPE TEXT;
