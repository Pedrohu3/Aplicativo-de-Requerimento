# Desenv Sistemas

Projeto full stack para a disciplina de Desenvolvimento de Sistemas — **FEMASS**.

Stack principal: **Spring Boot** (backend) + **React + Vite** (frontend).

---

## Índice

1. [Visão geral](#visão-geral)
2. [O que já foi feito](#o-que-já-foi-feito)
3. [Em desenvolvimento / próximos passos](#em-desenvolvimento--próximos-passos)
4. [Estrutura do projeto](#estrutura-do-projeto)
5. [Como executar](#como-executar)
6. [Credenciais de acesso (dev)](#credenciais-de-acesso-dev)
7. [Tecnologias utilizadas](#tecnologias-utilizadas)

---

## Visão geral

**Sistema de Requerimentos FEMASS** — permite criar tipos de requerimento com formulários dinâmicos (texto, select, radio, checkbox, data, número) e fluxos de aprovação personalizados (ex.: Professor → Coordenação → Diretor, ou apenas Coordenação).

Stack: API REST em Spring Boot + interface React com autenticação HTTP Basic.

---

## O que já foi feito

### Backend (Spring Boot + Maven)

| Item | Status | Descrição |
|------|--------|-----------|
| Projeto Maven Java 17 | ✅ Concluído | Spring Boot 3.2.5 |
| Spring Web | ✅ Concluído | API REST |
| Spring Data JPA | ✅ Concluído | Persistência configurada |
| PostgreSQL Driver | ✅ Concluído | Driver e `application.properties` |
| Lombok | ✅ Concluído | Dependência no `pom.xml` |
| Spring Security | ✅ Concluído | HTTP Basic + CORS para o frontend |
| Validation | ✅ Concluído | Dependência no `pom.xml` |
| Estrutura em camadas | ✅ Concluído | `controller`, `service`, `repository`, `entity`, `dto`, `config` |
| `application.properties` | ✅ Concluído | Conexão PostgreSQL + usuário padrão de dev |
| Endpoint de health | ✅ Concluído | `GET /api/public/health` |
| Endpoint de autenticação | ✅ Concluído | `GET /api/me` (usuário autenticado) |
| CORS | ✅ Concluído | Liberado para `http://localhost:5173` |
| Entidade `User` (JPA) | ✅ Concluído | Campos: id, nome, email, senha, role |
| Enum `Role` | ✅ Concluído | ALUNO, PROFESSOR, SECRETARIO, COORDENADOR, DIRETOR, ADMIN |
| CRUD de usuários | ✅ Concluído | Repository, Service, Controller e DTOs |
| Senha criptografada | ✅ Concluído | BCrypt via `PasswordEncoder` |
| Usuário admin inicial | ✅ Concluído | Seed automático no banco (`admin@femass.edu.br`) |
| Autenticação via banco | ✅ Concluído | `CustomUserDetailsService` com e-mail e senha do PostgreSQL |
| Tratamento de erros | ✅ Concluído | 404, 409, 403 e validação de campos |
| Sistema de Requerimentos | ✅ Concluído | Formulários dinâmicos + fluxo de aprovação |
| Entidades de requerimento | ✅ Concluído | TipoRequerimento, CampoFormulario, EtapaAprovacao, Requerimento, ValorCampo, HistoricoAprovacao |
| Usuários de demonstração | ✅ Concluído | Aluno, Professor, Coordenador, Diretor, Secretário e Admin |

### Frontend (React + Vite)

| Item | Status | Descrição |
|------|--------|-----------|
| Projeto Vite + React | ✅ Concluído | Pasta `frontend/` |
| React Router | ✅ Concluído | Rotas públicas e protegidas |
| Axios | ✅ Concluído | Cliente HTTP com interceptors |
| TailwindCSS v4 | ✅ Concluído | Estilização utilitária |
| Tela de login | ✅ Concluído | Autenticação com perfil (role) |
| Dashboard | ✅ Concluído | Ações rápidas do sistema de requerimentos |
| Tipos de Requerimento | ✅ Concluído | Criar formulários e fluxos de aprovação |
| Novo Requerimento | ✅ Concluído | Formulário dinâmico + envio/rascunho |
| Meus Requerimentos | ✅ Concluído | Listagem e acompanhamento de status |
| Fila de Aprovação | ✅ Concluído | Análise por perfil (professor, coordenador, etc.) |
| Detalhe do Requerimento | ✅ Concluído | Visualização, histórico, aprovar/rejeitar |
| Sidebar por perfil | ✅ Concluído | Menu adaptado conforme role do usuário |

---

## Em desenvolvimento / próximos passos

| Item | Status | Descrição |
|------|--------|-----------|
| Página de Usuários (frontend) | 🔲 Pendente | CRUD visual de usuários |
| Notificações por e-mail | 🔲 Pendente | Avisar aprovadores sobre novos requerimentos |
| Anexos de arquivos | 🔲 Pendente | Upload de documentos nos requerimentos |
| JWT / OAuth2 | 🔲 Pendente | Substituir HTTP Basic por token JWT |
| Testes automatizados | 🔲 Pendente | Unitários e integração |
| Deploy | 🔲 Pendente | Ambiente de produção |

---

## Fluxo do sistema

1. **Coordenador/Admin** cria um **tipo de requerimento** definindo:
   - Campos do formulário (texto, select, radio, checkbox, data, número)
   - Etapas de aprovação em ordem (ex.: `PROFESSOR` → `COORDENADOR` → `DIRETOR`)
2. **Qualquer usuário** (ex.: aluno) preenche o formulário e envia.
3. O requerimento entra em **EM_APROVACAO** na primeira etapa.
4. O usuário com a **role da etapa atual** aprova ou rejeita.
5. Se aprovado, avança para a próxima etapa; na última etapa, status **APROVADO**.
6. Todo o histórico fica registrado com observações.

### Tipos de campo disponíveis

`TEXTO` · `TEXTO_LONGO` · `SELECAO` · `OPCAO_UNICA` · `CHECKBOX` · `DATA` · `NUMERO`

### Status do requerimento

`RASCUNHO` · `EM_APROVACAO` · `APROVADO` · `REJEITADO` · `CANCELADO`

---

## API de Requerimentos

### Tipos de requerimento

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/tipos-requerimento` | Lista tipos ativos |
| `GET` | `/api/tipos-requerimento/todos` | Lista todos (gestão) |
| `GET` | `/api/tipos-requerimento/{id}` | Detalhe com campos e etapas |
| `POST` | `/api/tipos-requerimento` | Cria tipo (Secretário, Coordenador, Diretor, Admin) |
| `DELETE` | `/api/tipos-requerimento/{id}` | Desativa tipo |

### Requerimentos

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/requerimentos/meus` | Meus requerimentos |
| `GET` | `/api/requerimentos/pendentes` | Fila de aprovação do meu perfil |
| `GET` | `/api/requerimentos/{id}` | Detalhe completo |
| `POST` | `/api/requerimentos` | Cria requerimento (rascunho ou enviado) |
| `POST` | `/api/requerimentos/{id}/enviar` | Envia rascunho |
| `POST` | `/api/requerimentos/{id}/aprovar` | Aprova ou rejeita |
| `POST` | `/api/requerimentos/{id}/cancelar` | Cancela requerimento |

### Exemplo — criar tipo com fluxo customizado

```json
POST /api/tipos-requerimento
{
  "nome": "Declaração de Matrícula",
  "descricao": "Solicitação de declaração",
  "campos": [
    { "tipo": "TEXTO", "label": "Nome completo", "obrigatorio": true, "ordem": 0 },
    { "tipo": "SELECAO", "label": "Turno", "opcoes": ["Manhã", "Noite"], "obrigatorio": true, "ordem": 1 }
  ],
  "etapas": [
    { "ordem": 0, "role": "PROFESSOR", "descricao": "Validação do professor" },
    { "ordem": 1, "role": "COORDENADOR", "descricao": "Aprovação da coordenação" }
  ]
}
```

Base URL: `http://localhost:8081/api/users` (requer autenticação HTTP Basic)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/users` | Lista todos os usuários |
| `GET` | `/api/users/{id}` | Busca usuário por id |
| `POST` | `/api/users` | Cria novo usuário |
| `PUT` | `/api/users/{id}` | Atualiza usuário (senha opcional) |
| `DELETE` | `/api/users/{id}` | Remove usuário |

### Exemplo — criar usuário

```json
POST /api/users
{
  "nome": "Maria Silva",
  "email": "maria@femass.edu.br",
  "senha": "123456",
  "role": "ALUNO"
}
```

### Roles disponíveis

`ALUNO` · `PROFESSOR` · `SECRETARIO` · `COORDENADOR` · `DIRETOR` · `ADMIN`

---

## Estrutura do projeto

```
Aplicativo-de-Requerimento/
├── README.md                          # Este arquivo
├── pom.xml                            # Backend Maven
├── src/main/
│   ├── java/br/edu/femass/desenvsistemas/
│   │   ├── DesenvSistemasApplication.java
│   │   ├── config/                    # Security, CORS, seed de dados
│   │   ├── controller/                # REST controllers
│   │   ├── service/                   # Regras de negócio
│   │   ├── repository/                # Acesso ao banco
│   │   ├── entity/                    # Entidades JPA
│   │   ├── dto/                       # Objetos de transferência
│   │   └── exception/                 # Tratamento global de erros
│   └── resources/
│       └── application.properties
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── pages/                     # Telas da aplicação
        ├── components/                # Sidebar, formulários, badges
        ├── services/                  # api, authService, requerimentoService
        ├── layouts/                   # AuthLayout, AdminLayout
        ├── App.jsx                    # Rotas
        └── main.jsx
```

---

## Como executar

### Pré-requisitos

| Ferramenta | Versão mínima | Observação |
|------------|---------------|------------|
| Java (JDK) | 17+ | O Maven precisa usar JDK 17 ou superior (não Java 8) |
| Maven | 3.8+ | `mvn -version` deve mostrar Java 17+ |
| Node.js | 18+ | Para o frontend React |
| PostgreSQL | 14+ | Serviço em execução na porta 5432 |

> **Caminho do projeto (Windows):**  
> `C:\Users\ericr\OneDrive\Documentos\GitHub\Aplicativo-de-Requerimento`

### 1. Clonar / abrir o projeto

```powershell
cd "C:\Users\ericr\OneDrive\Documentos\GitHub\Aplicativo-de-Requerimento"
```

Se o `java -version` no terminal mostrar Java 8, mas o Maven usar outra versão, confira com `mvn -version`. O backend exige **JDK 17+**.

### 2. Banco de dados PostgreSQL

Crie o banco (se ainda não existir):

```sql
CREATE DATABASE desenv_sistemas;
```

Via terminal (PowerShell), substituindo `SUA_SENHA` pela senha do usuário `postgres`:

```powershell
$env:PGPASSWORD='SUA_SENHA'
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -d postgres -c "CREATE DATABASE desenv_sistemas;"
```

Configure a conexão em `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/desenv_sistemas
spring.datasource.username=postgres
spring.datasource.password=SUA_SENHA_AQUI
server.port=8081
```

> **Importante:** a senha em `application.properties` deve ser a mesma definida na instalação do PostgreSQL. No ambiente local deste projeto, a senha do usuário `postgres` é `ieremis0`.

Na primeira execução do backend, usuários de demonstração são criados automaticamente (veja [Credenciais de acesso](#credenciais-de-acesso-dev)).

### 3. Backend (Spring Boot)

Abra um terminal na **raiz do projeto** e execute:

```powershell
cd "C:\Users\ericr\OneDrive\Documentos\GitHub\Aplicativo-de-Requerimento"
mvn spring-boot:run
```

Aguarde a mensagem `Started DesenvSistemasApplication`.

- API: `http://localhost:8081`
- Health check: `http://localhost:8081/api/public/health`

> **Porta 8081:** o backend usa a porta **8081** porque a **8080** costuma estar ocupada pelo Oracle TNS Listener (`TNSLSNR.EXE`) em máquinas com Oracle Database. Se preferir outra porta, altere `server.port` em `application.properties` e o `target` do proxy em `frontend/vite.config.js`.

### 4. Frontend (React + Vite)

Em **outro terminal**:

```powershell
cd "C:\Users\ericr\OneDrive\Documentos\GitHub\Aplicativo-de-Requerimento\frontend"
npm install
npm run dev
```

Interface disponível em: `http://localhost:5173`

O Vite redireciona requisições `/api` para o backend em `http://localhost:8081`.

### 5. Acessar o sistema

1. Abra `http://localhost:5173` no navegador.
2. Faça login com uma das credenciais da tabela abaixo (ex.: `coordenador@femass.edu.br` / `senha123`).
3. Backend e frontend precisam estar rodando ao mesmo tempo.

### Resumo rápido (dois terminais)

| Terminal | Comando | URL |
|----------|---------|-----|
| 1 — Backend | `mvn spring-boot:run` (na raiz) | http://localhost:8081 |
| 2 — Frontend | `npm run dev` (em `frontend/`) | http://localhost:5173 |

---

## Credenciais de acesso (dev)

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Admin | `admin@femass.edu.br` | `admin123` |
| Aluno | `aluno@femass.edu.br` | `senha123` |
| Professor | `professor@femass.edu.br` | `senha123` |
| Coordenador | `coordenador@femass.edu.br` | `senha123` |
| Diretor | `diretor@femass.edu.br` | `senha123` |
| Secretário | `secretario@femass.edu.br` | `senha123` |

> Usuários criados automaticamente na primeira execução do backend.

### Roteiro de teste rápido

1. Login como **coordenador** → criar um tipo de requerimento com 2 etapas.
2. Login como **aluno** → criar e enviar um requerimento desse tipo.
3. Login como **professor** → aprovar na fila de aprovações.
4. Login como **coordenador** → aprovar a etapa final.

---

## Solução de problemas

### Erro: `autenticação do tipo senha falhou para o usuário "postgres"`

**Causa:** a senha em `application.properties` não coincide com a senha real do PostgreSQL.

**Como corrigir:**

1. Abra `src/main/resources/application.properties`
2. Ajuste a senha:
   ```properties
   spring.datasource.password=SUA_SENHA_REAL
   ```
3. Se necessário, redefina a senha pelo pgAdmin 4 ou pelo terminal:
   ```powershell
   $env:PGPASSWORD='SUA_SENHA_ATUAL'
   & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -d postgres -c "ALTER USER postgres PASSWORD 'nova_senha';"
   ```

### Erro: banco de dados não existe

Crie o banco antes de subir a aplicação:

```powershell
$env:PGPASSWORD='SUA_SENHA'
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -d postgres -c "CREATE DATABASE desenv_sistemas;"
```

Confirme que a URL JDBC usa o mesmo nome:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/desenv_sistemas
```

### Erro: `Port 8080 was already in use`

**Causa comum:** Oracle Database (processo `TNSLSNR.EXE`) ocupa a porta 8080.

**Solução:** este projeto já está configurado para usar a porta **8081**. Se ainda aparecer conflito de porta, altere `server.port` em `application.properties` e o proxy em `frontend/vite.config.js`.

Para ver o que está usando uma porta:

```powershell
netstat -ano | findstr ":8081"
```

### Erro: `UnsupportedClassVersionError` ou falha de compilação Java

**Causa:** Maven está usando Java 8 ou versão inferior a 17.

**Como corrigir:** instale JDK 17+ e confira com `mvn -version`. Se necessário, defina `JAVA_HOME` apontando para o JDK correto antes de rodar `mvn spring-boot:run`.

### Frontend não conecta na API

1. Confirme que o backend está rodando (`http://localhost:8081/api/public/health` deve retornar `{"status":"UP"}`).
2. Reinicie o `npm run dev` após alterar `vite.config.js`.
3. Backend e frontend devem rodar em terminais separados.

---

## Tecnologias utilizadas

### Backend
- Java 17
- Spring Boot 3.2.5
- Spring Web, Data JPA, Security, Validation
- PostgreSQL
- Lombok
- Maven

### Frontend
- React 19
- Vite 8
- React Router 7
- Axios
- TailwindCSS 4

---

## Scripts úteis

| Comando | Onde | Descrição |
|---------|------|-----------|
| `mvn spring-boot:run` | raiz | Inicia o backend |
| `mvn compile` | raiz | Compila o backend |
| `npm run dev` | `frontend/` | Inicia o frontend em modo dev |
| `npm run build` | `frontend/` | Gera build de produção |
| `npm run preview` | `frontend/` | Preview do build |

---

*Última atualização: junho/2026*