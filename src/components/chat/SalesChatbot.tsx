import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Flame,
  ExternalLink,
  Store,
  HelpCircle,
  PhoneCall,
  Bot,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { Product, User } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  products?: Product[];
  timestamp: string;
  quickReplies?: string[];
  actionLink?: {
    label: string;
    url: string;
  };
}

interface SalesChatbotProps {
  products: Product[];
  user: User | null;
  onSelectProduct: (product: Product) => void;
  onOpenSellerSection: () => void;
  onOpenAuth: () => void;
}

const POP_INITIAL_QUICK_REPLIES = [
  'Quero comprar',
  'Quero cadastrar minha loja',
  'Espaço do vendedor',
  'Consultar cadastro de vendedor',
  'Rastrear pedido',
  'Pagamento / Pix / Cartão',
  'Entrega e frete',
  'Trocas e devoluções',
  'Minha conta',
  'Falar com atendimento'
];

const normalizeText = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export const SalesChatbot: React.FC<SalesChatbotProps> = ({
  products,
  user,
  onSelectProduct,
  onOpenSellerSection,
  onOpenAuth
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Ref keeps context synchronized synchronously across rapid messages without stale closures
  const dialogContextRef = useRef<
    'idle' | 'awaiting_seller_clarification' | 'awaiting_seller_status'
  >('idle');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'bot',
      text: 'Olá! Sou o Pop, o assistente inteligente do Comércio Popular. Como posso te ajudar hoje?',
      timestamp: 'Agora',
      quickReplies: POP_INITIAL_QUICK_REPLIES
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [isOpen, messages]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const norm = normalizeText(text);
      const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      let botResponse: Message;
      const currentContext = dialogContextRef.current;

      // Detect explicit intent keywords that override conversational context
      const isTracking =
        norm.includes('rastrear') ||
        norm.includes('rastreio') ||
        norm.includes('onde esta meu pedido') ||
        norm.includes('status do pedido') ||
        (norm.includes('pedido') && !norm.includes('vender') && !norm.includes('loja'));

      const isPayment =
        norm.includes('pagamento') ||
        norm.includes('pix') ||
        norm.includes('cartao') ||
        norm.includes('boleto') ||
        norm.includes('parcelar') ||
        norm.includes('parcelamento') ||
        norm.includes('forma de pagamento');

      const isDelivery =
        norm.includes('entrega') ||
        norm.includes('frete') ||
        norm.includes('prazo de entrega') ||
        norm.includes('valor do frete') ||
        norm.includes('cep') ||
        norm.includes('envio') ||
        norm.includes('correios') ||
        norm.includes('transportadora');

      const isReturn =
        norm.includes('troca') ||
        norm.includes('devolu') ||
        norm.includes('trocar') ||
        norm.includes('devolver') ||
        norm.includes('defeito') ||
        norm.includes('cancelar') ||
        norm.includes('reembolso') ||
        norm.includes('garantia') ||
        norm.includes('arrependimento');

      const isAccount =
        norm.includes('minha conta') ||
        norm.includes('meu cadastro') ||
        norm.includes('meu perfil') ||
        norm.includes('minha senha') ||
        norm.includes('favoritos');

      const isSupport =
        norm.includes('falar com atendimento') ||
        norm.includes('atendimento') ||
        norm.includes('suporte') ||
        norm.includes('falar no whatsapp') ||
        norm.includes('whatsapp') ||
        norm.includes('humano') ||
        norm.includes('contato');

      const isBuying =
        norm === 'quero comprar' ||
        norm.includes('como compro') ||
        norm.includes('como comprar') ||
        norm.includes('fazer compras') ||
        norm.includes('adquirir');

      const isAmbiguousSeller =
        norm.includes('vender minha loja') ||
        norm.includes('vender a minha loja') ||
        norm === 'vender loja' ||
        norm === 'quero vender loja' ||
        norm.includes('vender meu estabelecimento') ||
        norm.includes('passar minha loja') ||
        norm.includes('passar meu ponto');

      const isSellerIntent =
        norm.includes('quero vender') ||
        norm.includes('como vendo aqui') ||
        norm.includes('como vendo') ||
        norm.includes('como vender') ||
        norm.includes('quero colocar meus produtos') ||
        norm.includes('colocar meus produtos') ||
        norm.includes('quero cadastrar meu comercio') ||
        norm.includes('cadastrar meu comercio') ||
        norm.includes('cadastrar comercio') ||
        norm.includes('quero abrir minha loja') ||
        norm.includes('abrir minha loja') ||
        norm.includes('abrir loja') ||
        norm.includes('quero cadastrar minha loja') ||
        norm.includes('cadastrar minha loja') ||
        norm.includes('cadastrar loja') ||
        norm.includes('quero vender meus produtos') ||
        norm.includes('vender meus produtos') ||
        norm.includes('vender produtos') ||
        norm.includes('ser vendedor') ||
        norm.includes('virar vendedor') ||
        norm.includes('anunciar produtos') ||
        norm.includes('plano de vendedor') ||
        norm.includes('planos de vendedor');

      const isSellerMenu =
        norm.includes('espaco do vendedor') ||
        norm.includes('area do vendedor') ||
        norm.includes('ajuda para vendedor');

      const isSellerStatus =
        norm.includes('consultar cadastro') ||
        norm.includes('status do cadastro') ||
        norm.includes('analise do cadastro') ||
        norm.includes('cadastro em analise') ||
        norm.includes('cadastro aprovado') ||
        norm.includes('minha loja foi aprovada');

      const isSellerDocuments =
        norm.includes('documentos necessarios') ||
        norm.includes('documentacao') ||
        norm.includes('cnpj') ||
        norm.includes('dados bancarios');

      const isSellerReputation =
        norm.includes('reputacao') ||
        norm.includes('score da loja') ||
        norm.includes('score do vendedor') ||
        norm.includes('qualidade da loja');

      const isSellerSalesSummary =
        norm.includes('resumo de vendas') ||
        norm.includes('minhas vendas') ||
        norm.includes('meu faturamento') ||
        norm.includes('recebimentos') ||
        norm.includes('saldo do vendedor');

      const isSellerCatalog =
        norm.includes('meus anuncios') ||
        norm.includes('gerenciar anuncios') ||
        norm.includes('estoque do vendedor') ||
        norm.includes('cadastrar produto');

      // 1. Tratamento quando está aguardando esclarecimento da ambiguidade (loja vs estabelecimento)
      if (currentContext === 'awaiting_seller_clarification' && !isTracking && !isPayment && !isDelivery && !isReturn && !isAccount && !isSupport && !isBuying) {
        const wantsProducts =
          norm.includes('produto') ||
          norm.includes('cadastrar') ||
          norm.includes('comercio popular') ||
          norm.includes('vender no') ||
          norm.includes('vender na') ||
          norm.includes('mercadoria') ||
          norm.includes('primeir') ||
          norm === '1';

        const wantsPhysicalStore =
          norm.includes('estabelecimento') ||
          norm.includes('proprio') ||
          norm.includes('ponto') ||
          norm.includes('imovel') ||
          norm.includes('fisica') ||
          norm.includes('segund') ||
          norm === '2';

        if (wantsProducts) {
          botResponse = {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: 'Ótimo! Posso te ajudar a começar. Você já possui cadastro como vendedor ou quer criar um novo?',
            timestamp: currentTime,
            quickReplies: ['Já possuo cadastro', 'Quero criar um novo', 'Ver planos de vendedor']
          };
          dialogContextRef.current = 'awaiting_seller_status';
        } else if (wantsPhysicalStore) {
          botResponse = {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: 'Entendi! O Comércio Popular é uma plataforma para lojistas anunciarem e venderem seus produtos para clientes de todo o Brasil. Não intermediamos a compra, venda ou repasse de estabelecimentos comerciais físicos ou pontos comerciais.',
            timestamp: currentTime,
            quickReplies: ['Quero vender meus produtos', 'Quero comprar', 'Falar com atendimento']
          };
          dialogContextRef.current = 'idle';
        } else {
          botResponse = {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: 'Você quer cadastrar sua loja para vender produtos no Comércio Popular ou está falando sobre vender o próprio estabelecimento?',
            timestamp: currentTime,
            quickReplies: ['Vender produtos no Comércio Popular', 'Vender o próprio estabelecimento']
          };
          dialogContextRef.current = 'awaiting_seller_clarification';
        }
      }
      // 2. Tratamento quando está aguardando resposta sobre possuir ou não cadastro de vendedor
      else if (currentContext === 'awaiting_seller_status' && !isTracking && !isPayment && !isDelivery && !isReturn && !isAccount && !isSupport && !isBuying) {
        const alreadyRegistered =
          norm.includes('ja possuo') ||
          norm.includes('ja tenho') ||
          norm.includes('ja sou') ||
          norm.includes('tenho cadastro') ||
          norm.includes('sou vendedor') ||
          norm.includes('sou lojista') ||
          norm.includes('login') ||
          norm.includes('entrar');

        const wantsNewRegistration =
          norm.includes('criar') ||
          norm.includes('novo') ||
          norm.includes('nova') ||
          norm.includes('nao tenho') ||
          norm.includes('nao possuo') ||
          norm.includes('comecar agora') ||
          norm.includes('cadastrar') ||
          norm.includes('quero abrir');

        if (alreadyRegistered) {
          botResponse = {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: 'Perfeito! Se você já é cadastrado, basta clicar em "Painel Lojista" ou "Área do Vendedor" no menu superior da página para gerenciar seu catálogo, estoque e acompanhar suas vendas.',
            timestamp: currentTime,
            quickReplies: ['Ver planos de vendedor', 'Minha conta', 'Falar com atendimento']
          };
          dialogContextRef.current = 'idle';
        } else if (wantsNewRegistration) {
          botResponse = {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: 'Excelente! Para cadastrar sua loja e começar a vender, basta acessar a "Área do Vendedor" no menu superior ou clicar no botão abaixo para conhecer nossos planos com taxa zero por venda e suporte completo.',
            timestamp: currentTime,
            quickReplies: ['Ver planos de vendedor', 'Falar com atendimento']
          };
          dialogContextRef.current = 'idle';
        } else {
          botResponse = {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: 'Ótimo! Posso te ajudar a começar. Você já possui cadastro como vendedor ou quer criar um novo?',
            timestamp: currentTime,
            quickReplies: ['Já possuo cadastro', 'Quero criar um novo', 'Ver planos de vendedor']
          };
          dialogContextRef.current = 'awaiting_seller_status';
        }
      }
      // 3. Central de ajuda do vendedor
      else if (isSellerMenu) {
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: 'No Espaço do Vendedor você acompanha ativação, plano contratado, anúncios, estoque, pedidos, faturamento, recebimentos, score e reputação. Qual informação deseja consultar?',
          timestamp: currentTime,
          quickReplies: ['Consultar cadastro de vendedor', 'Documentos necessários', 'Ver planos de vendedor', 'Reputação e score', 'Resumo de vendas', 'Anúncios e estoque']
        };
        dialogContextRef.current = 'idle';
      }
      // 4. Consulta protegida do cadastro de vendedor
      else if (isSellerStatus) {
        const planNames = { iniciante: 'Plano Parceiro Iniciante', pro: 'Plano Pro Comércio', empresa: 'Plano Destaque Premium' };
        const statusText = !user
          ? 'Para consultar o andamento do seu cadastro, entre primeiro na sua conta. Por segurança, não mostramos informações de cadastro sem autenticação.'
          : user.isSeller
            ? `Cadastro de vendedor localizado para ${user.name}. Situação: ativo. Plano: ${user.sellerPlan ? planNames[user.sellerPlan] : 'a confirmar'}. Identidade facial: ${user.isVerifiedFace ? 'verificada' : 'pendente'}. Telefone por SMS: ${user.isVerifiedSMS ? 'verificado' : 'pendente'}.`
            : `A conta de ${user.name} está ativa como comprador, mas ainda não possui perfil de vendedor. Você pode conhecer os requisitos e escolher um plano para iniciar a ativação.`;
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: statusText,
          timestamp: currentTime,
          quickReplies: !user ? ['Entrar para consultar', 'Quero criar um novo', 'Documentos necessários'] : ['Abrir Espaço do Vendedor', 'Ver planos de vendedor', 'Falar com atendimento']
        };
        dialogContextRef.current = 'idle';
      }
      // 5. Documentação e análise cadastral
      else if (isSellerDocuments) {
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: 'Para análise do cadastro solicitamos: CPF do responsável, telefone e e-mail válidos, biometria facial, endereço da operação e dados de recebimento. Para empresa, também serão solicitados CNPJ e dados do negócio. A aprovação depende da validação dos dados; nunca envie documentos ou dados bancários pelo chat.',
          timestamp: currentTime,
          quickReplies: ['Consultar cadastro de vendedor', 'Ver planos de vendedor', 'Falar com atendimento']
        };
        dialogContextRef.current = 'idle';
      }
      // 6. Reputação e score
      else if (isSellerReputation) {
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: 'O score considera atendimento, reclamações, cancelamentos, envios no prazo e avaliações. A faixa de reputação começa a ser calculada após 10 vendas. Quanto melhor o desempenho, maior a confiança do comprador e a possibilidade de destaque dos anúncios.',
          timestamp: currentTime,
          quickReplies: ['Abrir Espaço do Vendedor', 'Resumo de vendas', 'Anúncios e estoque']
        };
        dialogContextRef.current = 'idle';
      }
      // 7. Vendas e recebimentos
      else if (isSellerSalesSummary) {
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: user?.isSeller
            ? `Resumo disponível no seu painel: vendas, pedidos em aberto, faturamento e saldo. Saldo atual registrado: ${formatCurrency(user.balance || 0)}. Abra o Espaço do Vendedor para consultar os detalhes da sua conta.`
            : 'O resumo de vendas é uma consulta privada. Entre com uma conta de vendedor para visualizar pedidos, faturamento, saldo e recebimentos.',
          timestamp: currentTime,
          quickReplies: user?.isSeller ? ['Abrir Espaço do Vendedor', 'Anúncios e estoque', 'Falar com atendimento'] : ['Entrar para consultar', 'Quero criar um novo', 'Ver planos de vendedor']
        };
        dialogContextRef.current = 'idle';
      }
      // 8. Catálogo, anúncios e estoque
      else if (isSellerCatalog) {
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: 'No painel do vendedor você pode cadastrar produtos, editar preços e fotos, acompanhar estoque, pausar anúncios e verificar pedidos. O limite de produtos depende do plano: até 25 no Iniciante e ilimitados nos planos Pró Comércio e Destaque Premium.',
          timestamp: currentTime,
          quickReplies: ['Abrir Espaço do Vendedor', 'Ver planos de vendedor', 'Reputação e score']
        };
        dialogContextRef.current = 'idle';
      }
      // 9. Ambiguidade explícita: "Quero vender minha loja"
      else if (isAmbiguousSeller) {
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: 'Você quer cadastrar sua loja para vender produtos no Comércio Popular ou está falando sobre vender o próprio estabelecimento?',
          timestamp: currentTime,
          quickReplies: ['Vender produtos no Comércio Popular', 'Vender o próprio estabelecimento']
        };
        dialogContextRef.current = 'awaiting_seller_clarification';
      }
      // 4. Variações naturais que levam ao fluxo de vendedor (Requisito 4 e 6)
      else if (isSellerIntent) {
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: 'Ótimo! Posso te ajudar a começar. Você já possui cadastro como vendedor ou quer criar um novo?',
          timestamp: currentTime,
          quickReplies: ['Já possuo cadastro', 'Quero criar um novo', 'Ver planos de vendedor']
        };
        dialogContextRef.current = 'awaiting_seller_status';
      }
      // 5. Intenção: Quero comprar
      else if (isBuying) {
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: 'Para comprar no Comércio Popular é simples e seguro! Você pode explorar as ofertas da página inicial, navegar pelas categorias ou digitar o produto na barra de buscas. Ao escolher o item, basta clicar em "Comprar Agora" para ir direto ao checkout ou "Adicionar ao Carrinho" para continuar navegando.',
          timestamp: currentTime,
          quickReplies: ['🔥 Achadinhos do dia', '💡 Produtos abaixo de R$ 50', 'Pagamento / Pix / Cartão']
        };
        dialogContextRef.current = 'idle';
      }
      // 6. Intenção: Rastrear pedido (Requisito 9: não fingir consulta ao backend)
      else if (isTracking) {
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: 'Para acompanhar suas compras e obter o código de rastreamento dos Correios ou da transportadora, acesse a aba "Meus Pedidos" no menu superior (necessário estar conectado em sua conta). Como nosso chat não realiza consultas automáticas ao banco de pedidos, o status atualizado do envio fica disponível diretamente no painel da sua compra.',
          timestamp: currentTime,
          quickReplies: ['Entrega e frete', 'Trocas e devoluções', 'Minha conta']
        };
        dialogContextRef.current = 'idle';
      }
      // 7. Intenção: Pagamento / Pix / Cartão (Requisito 9: informações objetivas)
      else if (isPayment) {
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: 'Disponibilizamos opções seguras e práticas de pagamento:\n\n• Pix: Aprovação imediata para agilizar o envio;\n• Cartão de Crédito: Parcelamento em até 12x;\n• Boleto Bancário: Compensação em 1 a 2 dias úteis.\n\nTodas as transações contam com a proteção de compra do Comércio Popular.',
          timestamp: currentTime,
          quickReplies: ['Entrega e frete', 'Rastrear pedido', 'Quero comprar']
        };
        dialogContextRef.current = 'idle';
      }
      // 8. Intenção: Entrega e frete
      else if (isDelivery) {
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: 'O valor do frete e o prazo de entrega são calculados automaticamente com base no seu CEP na página de cada produto ou no carrinho. Você pode optar por entrega econômica (PAC) ou expressa (Sedex e transportadoras parceiras).',
          timestamp: currentTime,
          quickReplies: ['Rastrear pedido', 'Pagamento / Pix / Cartão', 'Trocas e devoluções']
        };
        dialogContextRef.current = 'idle';
      }
      // 9. Intenção: Trocas e devoluções
      else if (isReturn) {
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: 'Você pode solicitar a troca ou devolução do produto em até 7 dias corridos após o recebimento em caso de arrependimento, ou até 30 dias se houver defeito ou avaria (conforme o CDC). Entre em contato com nosso atendimento para receber as instruções e a etiqueta de postagem reversa.',
          timestamp: currentTime,
          quickReplies: ['Falar com atendimento', 'Rastrear pedido', 'Minha conta']
        };
        dialogContextRef.current = 'idle';
      }
      // 10. Intenção: Minha conta
      else if (isAccount) {
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: 'Na aba "Minha Conta" no menu superior, você pode consultar e atualizar seus dados cadastrais, gerenciar endereços de entrega salvos, ver seus produtos favoritos e acompanhar alertas de preço.',
          timestamp: currentTime,
          quickReplies: ['Quero cadastrar minha loja', 'Rastrear pedido', 'Falar com atendimento']
        };
        dialogContextRef.current = 'idle';
      }
      // 11. Intenção: Falar com atendimento
      else if (isSupport) {
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: 'Nosso time de atendimento está à disposição para esclarecer dúvidas sobre compras, pedidos ou parcerias comerciais. Você pode conversar diretamente com nossa equipe pelo canal oficial no WhatsApp:',
          timestamp: currentTime,
          actionLink: {
            label: 'Abrir WhatsApp Oficial (41) 99618-4115',
            url: 'https://wa.me/5541996184115?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20no%20Com%C3%A9rcio%20Popular!'
          },
          quickReplies: ['Rastrear pedido', 'Trocas e devoluções', 'Quero comprar']
        };
        dialogContextRef.current = 'idle';
      }
      // 12. Intenção: Achadinhos do dia
      else if (norm.includes('achadinho') || norm.includes('oferta') || norm.includes('promo')) {
        const topAchadinhos = products.filter((p) => p.isAchadinho).slice(0, 3);
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: 'Aqui estão achadinhos em destaque com descontos imperdíveis e envio rápido:',
          products: topAchadinhos,
          timestamp: currentTime,
          quickReplies: ['Mais achadinhos', 'Produtos até R$ 50', 'Falar com atendimento']
        };
        dialogContextRef.current = 'idle';
      }
      // 13. Intenção: Produtos abaixo de R$ 50
      else if (norm.includes('50') || norm.includes('barato') || norm.includes('baratinho')) {
        const cheap = products.filter((p) => p.price <= 50).slice(0, 3);
        botResponse = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: 'Separei estas opções incríveis abaixo de R$ 50,00 com excelente custo-benefício:',
          products: cheap,
          timestamp: currentTime,
          quickReplies: ['🔥 Achadinhos do dia', 'Quero comprar']
        };
        dialogContextRef.current = 'idle';
      }
      // 14. Busca por nome/termo de produto no catálogo
      else {
        const matching = products.filter(
          (p) =>
            normalizeText(p.title).includes(norm) ||
            normalizeText(p.category).includes(norm) ||
            normalizeText(p.description).includes(norm)
        ).slice(0, 3);

        if (matching.length > 0) {
          botResponse = {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: `Encontrei ${matching.length} produto(s) correspondente(s) à sua busca:`,
            products: matching,
            timestamp: currentTime,
            quickReplies: ['Quero comprar', 'Falar com atendimento']
          };
          dialogContextRef.current = 'idle';
        } else {
          // 15. Fallback padrão quando não compreender a pergunta (Requisito 8)
          botResponse = {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: 'Não entendi completamente. Você quer ajuda com compras, vendas, pedidos, pagamentos, entrega ou sua conta?',
            timestamp: currentTime,
            quickReplies: POP_INITIAL_QUICK_REPLIES
          };
          dialogContextRef.current = 'idle';
        }
      }

      setIsTyping(false);
      setMessages((prev) => [...prev, botResponse]);
    }, 450);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          id="btn-open-chatbot"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Abrir assistente Pop"
          className="relative w-14 h-14 rounded-full bg-teal-700 hover:bg-teal-800 text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer border-2 border-white"
        >
          {isOpen ? <X size={24} /> : <Bot size={26} />}
          {hasUnread && !isOpen && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-coral-600 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
      </div>

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          id="chatbot-window"
          className="fixed bottom-22 right-4 sm:right-6 w-[92vw] sm:w-96 h-[520px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-neutral-200 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6"
        >
          {/* Header */}
          <div className="bg-teal-900 text-white px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-700 border border-teal-500 flex items-center justify-center text-teal-100">
                <Bot size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold flex items-center gap-1.5">
                  Pop • Assistente Comércio Popular
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                </h4>
                <p className="text-[10px] text-teal-300">
                  Online • Pronto para ajudar
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-teal-300 hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50/60 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-teal-700 text-white rounded-br-xs'
                      : 'bg-white text-neutral-800 border border-neutral-200/80 rounded-bl-xs'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line">{m.text}</p>

                  {/* Embedded product cards in chat */}
                  {m.products && m.products.length > 0 && (
                    <div className="mt-2.5 space-y-2">
                      {m.products.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setIsOpen(false);
                            onSelectProduct(p);
                          }}
                          className="bg-neutral-50 hover:bg-teal-50/80 border border-neutral-200 rounded-xl p-2 flex items-center gap-2.5 cursor-pointer transition-colors"
                        >
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[11px] text-neutral-900 line-clamp-1">
                              {p.title}
                            </p>
                            <p className="text-[11px] font-bold text-teal-800">
                              {formatCurrency(p.price)}
                            </p>
                          </div>
                          <ChevronRight size={14} className="text-neutral-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* External WhatsApp button */}
                  {m.actionLink && (
                    <a
                      href={m.actionLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl shadow-xs transition-colors"
                    >
                      <PhoneCall size={12} />
                      <span>{m.actionLink.label}</span>
                    </a>
                  )}
                </div>

                <span className="text-[9px] text-neutral-400 mt-1 px-1">{m.timestamp}</span>

                {/* Quick Reply Pills */}
                {m.quickReplies && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.quickReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (reply === 'Entrar para consultar') {
                            setIsOpen(false);
                            onOpenAuth();
                          } else if (reply === 'Ver planos de vendedor' || reply === 'Abrir Espaço do Vendedor') {
                            setIsOpen(false);
                            onOpenSellerSection();
                          } else {
                            handleSend(reply);
                          }
                        }}
                        className="bg-white hover:bg-teal-50 text-neutral-700 hover:text-teal-900 border border-neutral-200 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer shadow-2xs"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-neutral-400 text-xs italic bg-white p-2.5 rounded-xl border border-neutral-200 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce delay-200" />
                <span className="text-[11px] ml-1">Pop está digitando...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-neutral-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Digite sua dúvida ou produto..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-neutral-100 px-3 py-2 text-xs rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-teal-700"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
