# Comércio Popular — frontend restaurado

## Abrir no VS Code

Extraia este ZIP em uma pasta nova, mantendo a versão anterior como backup.
Abra a pasta comercio-popular-frontend no VS Code e execute:

```sh
npm ci
npm run dev
```

Acesse http://localhost:5173/. O backend padrão é:
https://comercio-popular-backend-production.up.railway.app/api

Para mudar o endereço, copie .env.example para .env e ajuste VITE_API_URL.
Não coloque JWT_SECRET, senha do banco ou segredo OAuth no frontend.

## Recuperação

Base visual: cópia de 11/09/2026, commit
5fe44140ad8adb5f62eee5e9e71ae49a1d4fcf72 do frontend original.
Os 35 componentes TSX, imagens e logos foram recuperados dessa base.
O ZIP atual enviado foi usado como referência da integração AuthContext/api.
O repositório cicarini25/comercio-popular-frontend retornou vazio na consulta,
portanto não foi possível recuperar versões anteriores dele.

Mantidos: cabeçalho, categorias, ícones, logos das plataformas, banners,
produtos, sacola, favoritos, pedidos e componentes da área do vendedor.
Restaurados o acesso a Minha Conta e Sair. O status da conta é Conectado.

A integração usa AuthContext, token cp_token e os endpoints
POST /auth/login, POST /auth/signup e GET /auth/me.
Corrigidos: BrowserRouter, argumento de login e leitura do envelope {user}
na recuperação de sessão. O cadastro mantém nome, email, CPF, telefone e senha
em duas etapas.

## Rotas

- / — início
- /achadinhos — ofertas
- /lojas e /vender — comerciantes
- /favoritos — favoritos
- /pedidos — pedidos
- /sacola — sacola
- /login e /cadastro — autenticação
- /conta — Minha Conta, exige sessão
- /vendedor — área do vendedor, exige sessão

## Validação realizada em 15/09/2026

```sh
npm test
npm run typecheck
npm run build
```

15 testes passaram: renderização das rotas, proteção das telas de conta e
vendedor, restauração da sessão, logout, navegação e contrato de login.
Os testes usam respostas simuladas: não criam usuários reais nem comprovam
um novo login ponta a ponta no Railway. O cadastro real anterior foi relatado
pelo proprietário. TypeScript e build de produção concluíram sem erro.
Há aviso de bundle maior que 500 kB, sem impedir o build.

O navegador de validação bloqueou acesso ao servidor local; falta conferir
visualmente desktop/celular e realizar login/cadastro real após a restauração.

## Publicação pendente

A pasta dist contém o build produzido, mas esta entrega não foi publicada.
Antes de publicar, conferir as telas e o login no navegador. O host precisa
servir index.html para rotas do frontend (fallback SPA), inclusive /conta e
/vendedor. Configurar no backend a origem autorizada do frontend publicado.
Depois, conectar comerciopopular.shop e validar HTTPS, CORS e acesso direto
às rotas. Não foram feitas alterações de DNS.

## Limites preservados da base original

Google, Facebook e Apple continuam em preparação. A recuperação não ativa
login social. Pagamentos e operações comerciais ainda não integradas continuam
com os avisos e comportamentos existentes; recuperar a interface não as torna
serviços reais. Carrinho, favoritos e outros dados locais mantêm o mecanismo
existente. A validação de sessão não substitui autorização no backend.


## Atualização de provedores — 15/09/2026

Apple removida. Ordem visual: Google, Facebook, TikTok, Instagram.
O frontend agora usa o botão oficial Google Identity Services e envia o token
como idToken para POST /api/auth/google. O Client ID público é configurável por VITE_GOOGLE_CLIENT_ID.
A sessão continua no AuthContext. CPF, telefone e senha são preservados no
cadastro complementar; vincular conta existente exige senha local.

ATENÇÃO: a integração Google do backend ainda não foi publicada. A tentativa
anterior de publicação foi rejeitada pela revisão automática por limite de uso.
Este pacote atualiza somente o frontend e não ativa o Google no Railway.
Facebook e TikTok dependem de configuração dos respectivos apps e backend.
Instagram oferece API para contas profissionais; o botão informa essa limitação.

Para testar Google localmente depois de ativar o backend, incluir
http://localhost:5173 nas origens JavaScript autorizadas do cliente Google e
na configuração de origem aceita pelo backend. Não usar o endereço IP da rede
como substituto. Manter o Client ID já criado; não colocar segredos no frontend.
As mudanças deste pacote ainda precisam de teste com uma conta Google real.


## Facebook v5
Consulte LEIA-PRIMEIRO.md na raiz do pacote. O backend exige FACEBOOK_APP_ID e FACEBOOK_APP_SECRET. O frontend carrega somente configuração pública. Teste Facebook em HTTPS autorizado na Meta.
