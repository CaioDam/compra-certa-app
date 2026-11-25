# Compra Certa — App Mobile (React Native / Expo)

App mobile em React Native/Expo com API em Django REST Framework.

## Telas

1. **Login e cadastro** — autenticação e criação de conta pela API.
2. **Recuperação de senha** — solicita um código demonstrativo e permite cadastrar uma nova senha.
3. **Recomendação de produtos** — Gemini no nível gratuito, sem consulta a preços ou lojas ao vivo.
4. **System Design** — visão da arquitetura, fluxo de autenticação e responsabilidades dos componentes.
5. **Home, Categoria, Produto e Comparar** — produtos cadastrados pela própria pessoa e salvos no backend.
6. **Lista de compras e Favoritos** — dados vinculados à conta e persistidos no backend.
7. **Perfil** — consulta, edição e exclusão da própria conta; foto de perfil local.

## Arquitetura e navegação

- **App:** telas em `src/screens/`, navegação em `src/navigation/` e chamadas HTTP em `src/servicos/api.js`.
- **API:** Django REST Framework em `backend/`, autenticação por token, recomendações Gemini e SQLite para desenvolvimento.
- **Stack:** Login, Cadastro, EsqueceuSenha, SystemDesign, BuscaProdutos, Abas, Categoria, Produto e Comparar.
- **Abas:** Início, Lista, Favoritos e Perfil.

## API de contas

| Método | Endpoint | Acesso | Função |
|---|---|---|---|
| POST | `/api/auth/register/` | Público | Criar conta e receber token |
| POST | `/api/auth/login/` | Público | Entrar |
| POST | `/api/auth/logout/` | Autenticado | Revogar token |
| POST | `/api/auth/password-reset/request/` | Público | Solicitar código demonstrativo |
| POST | `/api/auth/password-reset/confirm/` | Público | Validar código e alterar senha |
| POST | `/api/products/search/` | Autenticado | Pedir orientação geral de produto ao Gemini |
| GET/PATCH/DELETE | `/api/account/` | Dono da conta | Ler, editar ou excluir a própria conta |
| GET/POST/PUT/PATCH/DELETE | `/api/users/` | Administrador | CRUD administrativo de contas |
| GET/POST | `/api/products/` | Autenticado | Consultar e cadastrar produtos próprios |
| GET/PATCH/DELETE | `/api/products/<id>/` | Dono do produto | Editar ou excluir produto |
| GET | `/api/products/favorites/` | Autenticado | Listar os próprios favoritos |
| GET | `/api/products/shopping-list/` | Autenticado | Listar os próprios itens de compras |
| GET | `/api/health/` | Público | Verificar disponibilidade da API |

O token é enviado no cabeçalho `Authorization: Token <token>`. O CRUD administrativo exige
uma conta com permissão de staff; cada usuário só consegue consultar, editar e excluir a
própria conta pela rota `/api/account/`.

### Produtos e privacidade

Cada usuário cadastra seus próprios produtos; nome, categoria, descrição, favoritos e lista de
compras ficam no banco SQLite do backend (`backend/db.sqlite3` durante o desenvolvimento).
As categorias são escolhidas de uma lista fixa, e cada produto pode ter uma imagem de até 5 MB.
Não há preços de lojas nem produtos de exemplo no catálogo. O cadastro exige o aceite do aviso
de privacidade, e a API registra a data e a versão aceita. Excluir a conta também exclui seus
produtos e suas imagens. As imagens dos produtos ficam em `backend/media/`; a foto de perfil
continua apenas no dispositivo. Ao usar a recomendação Gemini, o texto da consulta é enviado ao
Google para gerar uma orientação; não são consultados preços ou lojas.

### Gemini no nível gratuito

1. Crie uma chave no [Google AI Studio](https://aistudio.google.com/apikey).
2. Copie `backend/.env.example` para `backend/.env` e preencha `GEMINI_API_KEY`.
3. Reinicie o backend. A chave permanece no servidor e não é enviada ao app.

O endpoint usa `gemini-3.6-flash` sem Google Search grounding. Assim, ele pode oferecer
orientação geral, mas **não pesquisa lojas, não consulta preços atuais e não confirma a melhor
oferta**. O uso está limitado a 10 chamadas por hora por usuário. Mantenha o projeto do Google
AI Studio no nível gratuito e não habilite faturamento; os limites gratuitos podem variar e,
ao excedê-los, a chamada pode ser recusada.

### Recuperação demonstrativa

O projeto não envia e-mails. Com `DEBUG=true`, o endpoint de solicitação inclui `demo_token`
na resposta e a tela preenche o código automaticamente para facilitar testes. Em produção,
`DEBUG` deve ser `false` e o fluxo precisa ser integrado a um provedor de e-mail antes de uso.

## Como iniciar o backend

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py makemigrations accounts
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

Para desenvolvimento no celular, crie um `.env` na raiz do app com o endereço IP da máquina
na rede local (emuladores/dispositivos não acessam o `localhost` do computador):

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:8000/api
```

Configure `DJANGO_ALLOWED_HOSTS` com `localhost,127.0.0.1,SEU_IP_LOCAL` antes de iniciar o
servidor e reinicie o Expo após alterar `.env`. O padrão da API é
`http://127.0.0.1:8000/api`, adequado para web local/simulador que compartilha o host.
O backend permite por padrão as origens web locais `localhost:8081` e `127.0.0.1:8081`;
use `CORS_ALLOWED_ORIGINS` para ajustar a lista quando a porta/endereço do Expo mudar.
Antes de publicar, configure `DJANGO_SECRET_KEY` e `DJANGO_ALLOWED_HOSTS`, use HTTPS e
desative `DJANGO_DEBUG`.

## Como rodar o app

Pré-requisitos: Node.js instalado e Expo Go no celular.

```bash
npm install
npx expo start
```

## Outros recursos do protótipo

## Listagem otimizada — FlatList

Toda lista de itens do app usa `FlatList` (não `.map()` dentro de uma `View`/`ScrollView`),
porque ela só renderiza os itens visíveis na tela, otimizando listas grandes. Está em:
Home (categorias), Categoria (produtos), Produto (ofertas), Lista de compras (itens),
Favoritos (listas salvas) e Comparar (lista horizontal).

## Recursos nativos usados

- **Câmera e galeria** (`expo-image-picker`) — foto de perfil, armazenada somente no dispositivo.

As telas de produto, categorias, lista de compras e favoritos usam os dados cadastrados pela
pessoa e persistidos no backend. Não há integração com lojas ou consulta de preços atuais; a
foto do perfil ainda fica somente no dispositivo.
