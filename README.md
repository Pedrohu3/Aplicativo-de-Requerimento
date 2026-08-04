# Sistema de Requerimentos — FEMASS

Projeto full stack para a disciplina de Desenvolvimento de Sistemas — **FEMASS**.

Stack principal: **Spring Boot** (backend) + **React + Vite** (frontend), com PostgreSQL, autenticação JWT, upload de anexos em storage compatível com S3 e envio de e-mails transacionais.

---

## Índice

1. [Visão geral](#visão-geral)
2. [Funcionalidades implementadas](#funcionalidades-implementadas)
3. [Conceitos principais](#conceitos-principais)
4. [Fluxo de um requerimento](#fluxo-de-um-requerimento)
5. [Estrutura do projeto](#estrutura-do-projeto)
6. [Como executar](#como-executar)
7. [Variáveis de ambiente](#variáveis-de-ambiente)
8. [Credenciais de acesso (dev)](#credenciais-de-acesso-dev)
9. [API principal](#api-principal)
10. [Pontos de futura implementação](#pontos-de-futura-implementação)
11. [Tecnologias utilizadas](#tecnologias-utilizadas)
12. [Deploy](#deploy)
13. [Solução de problemas](#solução-de-problemas)

---

## Visão geral

**Sistema de Requerimentos FEMASS** — permite que a secretaria/coordenação cadastre **tipos de requerimento** com formulários dinâmicos (texto, texto longo, select, radio, checkbox, data, número, anexo) e fluxos de aprovação configuráveis em etapas (ex.: Professor → Coordenação → Diretor), e que qualquer usuário abra requerimentos desses tipos e acompanhe a aprovação até o resultado final.

O sistema já cobre o ciclo de vida completo de um requerimento: criação, envio, aprovação por etapas, rejeição com motivo, **solicitação de ajustes** (devolução para correção sem perder o histórico), cancelamento, anexos, prazos com aviso automático por e-mail e notificações por e-mail em cada etapa.

---

## Funcionalidades implementadas

### Autenticação e usuários
- Login/registro com **JWT** (`spring-security` + `jjwt`), senha com BCrypt.
- **Roles acumulativas**: um usuário pode ter mais de uma role ao mesmo tempo (ex.: Professor **e** Coordenador), exceto Aluno, que é exclusiva.
- **Admin como atributo lógico**: a flag `admin` pode ser combinada com qualquer role (exceto Aluno) — um Professor pode também ser administrador sem que isso apareça como uma "role" separada. `ADMIN` também continua existindo como role própria (para uma conta administrativa "pura", sem outra função — é o caso da conta master semeada na inicialização).
- Tela de **Usuários** (admin): edição de roles (multi-seleção), da flag admin e visualização do(s) curso(s) vinculado(s) de cada usuário — para Aluno é o curso matriculado; para Professor/Secretário/Coordenador/Diretor é derivado das disciplinas/cursos em que atuam.

### Cursos, disciplinas e responsáveis
- CRUD de **Cursos**.
- CRUD de **Disciplinas** (vinculadas a um curso e a um professor responsável).
- Atribuição de **responsáveis por curso e etapa** (Secretário, Coordenador, Diretor) — cada etapa de aprovação com escopo Curso é resolvida pelo responsável designado para aquele curso.

### Tipos de requerimento (formulário + fluxo configuráveis)
- Editor de **campos dinâmicos**: `TEXTO`, `TEXTO_LONGO`, `SELECAO`, `OPCAO_UNICA`, `CHECKBOX`, `DATA`, `NUMERO`, `ANEXO` — com opção de obrigatoriedade e (quando aplicável) lista de opções.
- Campos fixos automáticos por **escopo** (Nome, Matrícula, e Curso/Disciplina quando aplicável).
- **Escopo** do tipo (`DISCIPLINA`, `CURSO` ou `ADMINISTRATIVO`) — define como o aprovador de cada etapa é resolvido (professor da disciplina escolhida, responsável do curso do solicitante, ou qualquer usuário com a role da etapa, respectivamente).
- **Fluxo de aprovação** com N etapas em ordem, cada uma com uma role responsável, descrição e prazo (dias) opcional.
- **Quem pode solicitar** (`rolesPermitidas`): cada tipo pode ser restrito a um subconjunto de roles (ex.: ACG só para Aluno) — vazio significa liberado para todos. Validado tanto na listagem (o aluno só vê o que pode pedir) quanto na criação (bloqueado no backend mesmo via chamada direta à API).
- Remoção de campos/etapas individuais no editor (com no mínimo 1 de cada, conforme exigido pelo backend), e desativação (soft delete) de tipos.

### Requerimentos
- Criação como **rascunho** (editável antes de enviar) ou envio direto.
- **Aprovação por etapas**: cada aprovador só decide sobre a etapa atual e apenas se for a pessoa/role designada (ou admin, que pode agir em qualquer etapa).
- Três ações possíveis em cada etapa:
  - **Aprovar** → avança para a próxima etapa, ou finaliza como `APROVADO` na última.
  - **Rejeitar** → finaliza como `REJEITADO`, com motivo obrigatório (`MotivoRejeicao`) e observação quando o motivo é "Outro".
  - **Solicitar ajustes** → devolve o requerimento para o solicitante corrigir, com observação obrigatória descrevendo o que precisa ser corrigido. Ao reenviar, o requerimento **volta direto para a mesma etapa/aprovador que pediu o ajuste** — não reinicia o fluxo do zero. Pode haver múltiplas idas e voltas na mesma etapa; o histórico completo de cada rodada fica registrado.
- **Cancelamento** pelo próprio solicitante (ou admin), permitido em qualquer status não finalizado.
- **Edição de valores**: por admin em qualquer requerimento, ou pelo próprio solicitante quando o status é "Ajustes solicitados".
- **Anexos**: upload de arquivo para storage compatível com S3 (`POST /api/anexos`), com link de download no detalhe do requerimento.
- **Prazos**: cada etapa pode ter um prazo em dias; um job agendado (`PrazoAprovacaoScheduler`, diário às 8h) avisa por e-mail o aprovador quando o prazo está próximo do vencimento.
- **E-mails automáticos** (via SMTP Brevo): confirmação de envio, aviso de pendência para o próximo aprovador, resultado final (aprovado/rejeitado), aviso de ajustes solicitados e aviso de prazo próximo.
- Histórico completo por requerimento (quem, quando, ação, observação, motivo).

### Frontend
- Sidebar com menu adaptado por role/admin.
- Dashboard com atalhos e indicadores rápidos.
- Telas: Login, Registro, Dashboard, Novo Requerimento, Meus Requerimentos, Aprovações (fila do meu perfil), Detalhe do Requerimento (com timeline do fluxo de aprovação, incluindo o histórico de "ajustes solicitados" por etapa), Editar Requerimento, Tipos de Requerimento, Usuários, Novo Usuário, Cursos, Disciplinas, Como Funciona.

---

## Conceitos principais

| Conceito | Valores |
|---|---|
| `Role` (roles do usuário, acumulativas) | `ALUNO` · `PROFESSOR` · `SECRETARIO` · `COORDENADOR` · `DIRETOR` · `ADMIN` |
| Flag `admin` | booleano independente da(s) role(s); combinável com qualquer role exceto `ALUNO` |
| `EscopoRequerimento` (do tipo) | `DISCIPLINA` · `CURSO` · `ADMINISTRATIVO` |
| `StatusRequerimento` | `RASCUNHO` · `EM_APROVACAO` · `AJUSTES_SOLICITADOS` · `APROVADO` · `REJEITADO` · `CANCELADO` |
| `AcaoAprovacao` | `APROVADO` · `REJEITADO` · `AJUSTES_SOLICITADOS` |
| `MotivoRejeicao` | `DOCUMENTACAO_INCOMPLETA` · `DADOS_INCONSISTENTES` · `NAO_ATENDE_CRITERIOS` · `FORA_DO_PRAZO` · `DUPLICADO` · `OUTRO` |
| `CampoTipo` (campos do formulário) | `TEXTO` · `TEXTO_LONGO` · `SELECAO` · `OPCAO_UNICA` · `CHECKBOX` · `DATA` · `NUMERO` · `ANEXO` |

---

## Fluxo de um requerimento

1. Um usuário com permissão (Secretário/Coordenador/Diretor/Admin) cria um **tipo de requerimento**: campos do formulário, escopo, fluxo de etapas e quem pode solicitar.
2. Um usuário permitido preenche o formulário — pode **salvar como rascunho** ou **enviar** direto.
3. Ao enviar, o requerimento entra em `EM_APROVACAO` na primeira etapa; o aprovador correspondente é notificado por e-mail.
4. O aprovador da etapa atual decide: **aprovar** (avança), **rejeitar** (finaliza) ou **solicitar ajustes** (devolve pro solicitante, mesma etapa).
5. Se ajustes foram solicitados, o solicitante edita e reenvia — volta para a mesma etapa/aprovador, sem perder o histórico.
6. Na última etapa aprovada, o requerimento vira `APROVADO` e o solicitante é notificado.
7. Todo o percurso (quem decidiu, quando, o quê) fica no histórico, visível no detalhe do requerimento.

---

## Estrutura do projeto

```
Aplicativo-de-Requerimento/
├── README.md
├── pom.xml                            # Backend Maven
├── Dockerfile                         # Build do backend (multi-stage, JDK 21)
├── docker-compose.yml                 # backend + PostgreSQL para rodar localmente
├── render.yaml                        # Deploy do backend (Render)
├── src/main/
│   ├── java/br/edu/femass/desenvsistemas/
│   │   ├── DesenvSistemasApplication.java
│   │   ├── config/                    # JWT, Security, CORS, storage, seed do admin
│   │   ├── controller/                # REST controllers
│   │   ├── service/                   # Regras de negócio (Requerimento, TipoRequerimento, Curso, Disciplina, User, Email, Storage...)
│   │   ├── repository/                # Spring Data JPA
│   │   ├── entity/                    # Entidades JPA e enums
│   │   ├── dto/                       # Request/Response
│   │   └── exception/                 # Tratamento global de erros
│   ├── resources/
│   │   ├── application.properties
│   │   └── db/                        # Scripts de migração manual (ddl-auto=update não cobre tudo — ver comentários nos próprios .sql)
│   └── test/                          # Testes (JUnit + MockMvc)
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── vercel.json                    # Deploy do frontend (Vercel)
    └── src/
        ├── pages/                     # Telas da aplicação
        ├── components/                # Sidebar, Navbar, DynamicForm, StatusBadge, ConfirmDialog...
        ├── services/                  # api, authService, requerimentoService, userService, cursosService, disciplinasService, anexoService
        ├── layouts/                   # AuthLayout, AdminLayout
        ├── App.jsx                    # Rotas
        └── main.jsx
```

---

## Como executar

### Opção A — Docker Compose (recomendado)

Sobe o backend e o PostgreSQL juntos, sem precisar instalar Java/Maven/Postgres localmente.

```bash
docker compose up -d --build
```

- API: `http://localhost:8081`
- Health check: `http://localhost:8081/api/public/health`
- Banco Postgres exposto em `localhost:5433` (usuário/senha `postgres`/`admin`, database `desenv_sistemas`)

Sempre que alterar código Java, é preciso **rebuildar a imagem** (o container não faz hot reload):

```bash
docker compose build backend && docker compose up -d backend
```

Depois, em outro terminal, suba o frontend (veja abaixo) apontando pra essa API.

### Opção B — Manual (sem Docker)

**Pré-requisitos:** JDK 17+ (a imagem Docker usa 21), Maven 3.8+, Node 18+, PostgreSQL 14+ rodando localmente.

```bash
# 1. Criar o banco
psql -U postgres -c "CREATE DATABASE desenv_sistemas;"

# 2. Ajustar credenciais em src/main/resources/application.properties
#    (ou exportar DATABASE_URL / DATABASE_USERNAME / DATABASE_PASSWORD)

# 3. Backend
mvn spring-boot:run
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Interface em `http://localhost:5173`; o Vite faz proxy de `/api` para `http://localhost:8081` (ou usa `VITE_API_URL`, ver `.env.example`).

---

## Variáveis de ambiente

Veja `.env.example` (raiz) e `frontend/.env.example`. As principais:

| Variável | Uso |
|---|---|
| `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` | Conexão PostgreSQL |
| `APP_MASTER_NAME`, `APP_MASTER_EMAIL`, `APP_MASTER_PASSWORD` | Conta admin semeada na primeira execução (default: `Master Admin` / `master@femass.edu.br` / `Master@123!`) |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM` | SMTP (Brevo) para os e-mails automáticos |
| `STORAGE_ENDPOINT`, `STORAGE_REGION`, `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY`, `STORAGE_BUCKET_NAME`, `STORAGE_PUBLIC_URL` | Storage compatível com S3 (Supabase Storage) para anexos |
| `PRAZO_AVISO_DIAS_ANTES` | Dias de antecedência do aviso de prazo (default 2) |
| `VITE_API_URL` (frontend) | URL base da API em produção |

Sem as credenciais de e-mail/storage configuradas, o sistema continua funcionando normalmente — só o envio de e-mail e o upload de anexo real ficam indisponíveis (falhas são logadas, não travam o fluxo).

---

## Credenciais de acesso (dev)

Na primeira execução, o `UserDataLoader` semeia **apenas a conta master**, configurável por env var:

| Campo | Default |
|---|---|
| Nome | `Master Admin` |
| E-mail | `master@femass.edu.br` |
| Senha | `Master@123!` |

A partir dela (role `ADMIN`), crie os demais usuários pela tela **Usuários → Novo usuário**, ou deixe alunos se cadastrarem por `/register`.

### Roteiro de teste rápido

1. Login como **master** → cadastrar um Curso, uma Disciplina (com professor) e um Tipo de Requerimento com fluxo de etapas.
2. Registrar/criar um **aluno** vinculado a esse curso → abrir e enviar um requerimento.
3. Login como o aprovador da etapa (ou como master, que pode agir em qualquer etapa) → aprovar, rejeitar ou solicitar ajustes.
4. Se ajustes forem solicitados, logar como o aluno, editar e reenviar (**Meus Requerimentos** → "Editar e reenviar").

---

## API principal

Autenticação: `Authorization: Bearer <token>` obtido em `/api/auth/login` ou `/api/auth/register`.

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/register` | Cadastro de aluno (auto-serviço) |
| `POST` | `/api/auth/login` | Login (e-mail ou matrícula + senha) |

### Usuários
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/users` | Lista usuários (staff) |
| `GET` | `/api/users/{id}` | Busca por id |
| `POST` | `/api/users` | Cria usuário (admin) |
| `PUT` | `/api/users/{id}` | Atualiza roles/admin/curso/senha (admin) |
| `DELETE` | `/api/users/{id}` | Remove usuário (admin) |

### Cursos e disciplinas
| Método | Rota | Descrição |
|---|---|---|
| `GET`/`POST`/`PUT`/`DELETE` | `/api/cursos[/{id}]` | CRUD de cursos (escrita: admin) |
| `PUT`/`DELETE` | `/api/cursos/{id}/responsaveis[/{role}]` | Atribui/remove responsável por etapa do curso (admin) |
| `GET`/`POST`/`PUT`/`DELETE` | `/api/disciplinas[/{id}]` (aceita `?cursoId=`) | CRUD de disciplinas (escrita: admin) |

### Tipos de requerimento
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/tipos-requerimento` | Lista tipos ativos |
| `GET` | `/api/tipos-requerimento/todos` | Lista todos, incluindo inativos (gestão) |
| `GET` | `/api/tipos-requerimento/{id}` | Detalhe com campos e etapas |
| `POST` | `/api/tipos-requerimento` | Cria tipo (Secretário, Coordenador, Diretor ou admin) |
| `PUT` | `/api/tipos-requerimento/{id}` | Atualiza tipo |
| `DELETE` | `/api/tipos-requerimento/{id}` | Desativa tipo (soft delete) |

### Requerimentos
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/requerimentos/meus` | Meus requerimentos |
| `GET` | `/api/requerimentos/pendentes` | Fila de aprovação do meu perfil |
| `GET` | `/api/requerimentos/{id}` | Detalhe completo + histórico |
| `POST` | `/api/requerimentos` | Cria requerimento (rascunho ou já enviado) |
| `PUT` | `/api/requerimentos/{id}` | Edita valores (admin, ou solicitante se `AJUSTES_SOLICITADOS`) |
| `POST` | `/api/requerimentos/{id}/enviar` | Envia rascunho, ou reenvia após ajustes |
| `POST` | `/api/requerimentos/{id}/aprovar` | Decide a etapa atual: `APROVADO`, `REJEITADO` ou `AJUSTES_SOLICITADOS` |
| `POST` | `/api/requerimentos/{id}/cancelar` | Cancela requerimento |

### Anexos
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/anexos` | Upload de arquivo (`multipart/form-data`, campo `file`) → retorna URL pública |

---

## Pontos de futura implementação

O sistema está funcionalmente completo para o fluxo de requerimentos, mas para uso real pela universidade alguns dados hoje mantidos manualmente deveriam vir de um sistema acadêmico oficial (ex.: **WebAcademico**). Os pontos exatos já estão marcados com comentários `FUTURA IMPLEMENTAÇÃO` no código, explicando o desenho sugerido — nada disso está implementado de fato, é só a documentação de como fazer:

- **Usuários** (alunos/professores) — `UserService.create()`: hoje cadastro manual pelo admin; deveria vir de sincronização com o WebAcademico.
- **Cursos** — `CursoService.criar()`.
- **Disciplinas** — `DisciplinaService.criar()`.
- **Matrícula do aluno por disciplina** — `RequerimentoService.vincularDisciplina()`: hoje um aluno pode abrir requerimento para **qualquer disciplina do seu curso**, não só as que ele está de fato cursando no período, porque não existe o conceito de matrícula por disciplina no modelo atual. O comentário no código detalha a entidade e a validação necessárias (nova entidade `MatriculaDisciplina`, populada por sincronização com o WebAcademico).
- No frontend, `NovoRequerimentoPage.jsx` tem o ponto correspondente (troca de `listarDisciplinas(cursoId)` por um endpoint filtrado por matrícula real).

---

## Tecnologias utilizadas

### Backend
- Java 17 (compilado; imagem Docker roda em Eclipse Temurin 21)
- Spring Boot 3.2.5 — Web, Data JPA, Security, Validation, Mail
- PostgreSQL
- JWT (`io.jsonwebtoken` / jjwt)
- AWS SDK v2 (`software.amazon.awssdk:s3`) para storage de anexos compatível com S3
- Lombok
- Maven

### Frontend
- React 19
- Vite 8
- React Router 7
- Axios
- TailwindCSS 4

---

## Deploy

- **Backend**: Render (`render.yaml`), build via Docker (`Dockerfile`), health check em `/api/public/health`.
- **Frontend**: Vercel (`frontend/vercel.json`), SPA com rewrite para `index.html`; usa `VITE_API_URL` para apontar pra API em produção.
- **Storage de anexos**: Supabase Storage (compatível com S3).
- **E-mail**: Brevo (SMTP relay, porta 465/SSL).

---

## Solução de problemas

### `DataIntegrityViolationException` / erro 403 sem corpo ao criar ou aprovar algo
Esse comportamento (uma violação de constraint no banco aparecendo como um 403 vazio, em vez de 500) já apareceu duas vezes neste projeto: quando o modelo de `role` do usuário mudou pra multi-valor, e ao adicionar o status `AJUSTES_SOLICITADOS`. A causa raiz nas duas vezes foi uma **`CHECK` constraint** gerada automaticamente pelo Hibernate na criação da tabela, presa aos valores antigos do enum — `spring.jpa.hibernate.ddl-auto=update` cria colunas/tabelas novas, mas **nunca** atualiza constraints existentes. Sempre que um enum ganhar um valor novo (`Role`, `StatusRequerimento`, `AcaoAprovacao` etc.), confira se existe uma `CHECK` constraint desatualizada na coluna correspondente e ajuste via script em `src/main/resources/db/` (veja `migration_user_roles.sql` e `migration_ajustes_solicitados.sql` como exemplo).

### Erro de conexão com o PostgreSQL
Confira `DATABASE_URL` / `DATABASE_USERNAME` / `DATABASE_PASSWORD` (ou os defaults em `application.properties`) e se o Postgres está de fato no ar na porta esperada (`5432` direto, ou `5433` via `docker compose`).

### Porta 8081 ocupada
Altere `server.port` em `application.properties` (ou a env var `PORT`) e o proxy correspondente em `frontend/vite.config.js`.

### Frontend não conecta na API
1. Confirme que o backend responde em `/api/public/health`.
2. Reinicie `npm run dev` após alterar `vite.config.js` ou `.env`.
3. Em produção, confira se `VITE_API_URL` está configurada no ambiente do Vercel.

### Alterei um `.java` e o Docker não reflete a mudança
O `docker-compose.yml` builda a imagem do backend a partir do código — não há hot reload. Rebuilde e reinicie:
```bash
docker compose build backend && docker compose up -d backend
```

---

Gabriel Bertussi.
