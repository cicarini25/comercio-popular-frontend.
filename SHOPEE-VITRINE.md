# Comércio Popular — vitrine Shopee

Esta atualização consulta GET /api/catalog/products?platform=shopee, em páginas de 100. A página inicial oferece Carregar mais; os filtros atuam nos produtos já carregados. Não requer token administrativo no navegador. Usa VITE_API_URL existente, com Railway como padrão.

Produtos reais substituem o catálogo de demonstração/localStorage. Imagens, descrição e preços vêm do banco. O botão utiliza o UUID da oferta em /api/catalog/offers/:id/go, que redireciona ao link de afiliado armazenado. Produtos afiliados não seguem para o carrinho interno. Estoque desconhecido permanece desconhecido. Os cards reais não mostram avaliações, verificação ou comparações inventadas; detalhes usam um modal próprio. Não há promessa de cupom ou preço mínimo. Categorias Home & Living e Sports & Outdoors são traduzidas.

Isto não agenda sincronização do feed, não gera novos links afiliados e não confirma comissão. O preço da vitrine é o último importado; a Shopee confirma preço final, frete e disponibilidade.

## Publicar

1. Faça backup do public_html atual na Hostinger.
2. O ZIP comercio-popular-shopee-hostinger.zip contém o site compilado: extraia seu conteúdo diretamente no public_html, onde fica index.html, substituindo os arquivos correspondentes. Não crie uma subpasta dist. Preserve arquivos próprios do domínio e configurações de hospedagem; se já houver .htaccess personalizado, preserve suas regras e incorpore somente o fallback SPA necessário.
3. Abra o site e atualize com Ctrl+F5. O service worker utiliza atualização automática, mas uma aba antiga pode precisar ser fechada e reaberta.
4. Confira armário e chuteira na vitrine, detalhes, favoritos, filtros e Comprar na Shopee.

O ZIP de atualização do GitHub contém apenas arquivos alterados/novos, com seus caminhos. O ZIP frontend completo é o código-fonte atualizado, não os arquivos para public_html. Não inclui node_modules nem segredos.

## Verificação

Build Vite e TypeScript aprovados. Testes específicos de catálogo/card/integração App aprovados; os 17 testes de rotas existentes também passaram. Dois testes antigos de Facebook falham porque montam AuthModal sem Router; falha reproduzida no ZIP original, sem alteração de autenticação nesta entrega. Não houve publicação na Hostinger nem validação visual em navegador de produção nesta etapa.
