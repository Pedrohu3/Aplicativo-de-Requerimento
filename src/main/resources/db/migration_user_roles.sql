-- Migra o modelo de role única (users.role) para roles acumulativas.
-- A coluna users.role fica sem uso pela aplicação (não é removida).

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role    VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role)
);

INSERT INTO user_roles (user_id, role)
SELECT id, role FROM users
WHERE role IS NOT NULL
ON CONFLICT DO NOTHING;

-- A entidade não grava mais nessa coluna; sem isso, todo INSERT de usuário
-- falha com "null value in column role violates not-null constraint".
ALTER TABLE users ALTER COLUMN role DROP NOT NULL;
