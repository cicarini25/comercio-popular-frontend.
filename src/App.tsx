import { mapApiUser } from './services/api';
import { useAuth } from './context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PWAInstallButton } from './components/common/PWAInstallButton';
import { HeroBanner } from './components/home/HeroBanner';
import { AchadinhosSection } from './components/achadinhos/AchadinhosSection';
import { SellerSection } from './components/sellers/SellerSection';
import { SellerDashboard } from './components/sellers/SellerDashboard';
import { ProductCard } from './components/products/ProductCard';
import { ProductDetailModal } from './components/products/ProductDetailModal';
import { AffiliateModal } from './components/products/AffiliateModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { AuthModal } from './components/auth/AuthModal';
import { SalesChatbot } from './components/chat/SalesChatbot';
import { OrdersView } from './components/orders/OrdersView';
import { WishlistView } from './components/wishlist/WishlistView';
import { BarcodeScannerModal } from './components/scanner/BarcodeScannerModal';
import { PriceRangeSlider } from './components/products/PriceRangeSlider';

import { Product, CartItem, User, Order, SellerPlan, PriceAlert, ProductReview } from './types';
import { INITIAL_PRODUCTS, CATEGORIES } from './data/mockProducts';
import { getOrGenerateReviews } from './data/mockReviews';
import { formatCurrency } from './utils/formatters';
import { Flame, Store, Sparkles, Filter, CheckCircle2, SlidersHorizontal, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { notifyWishlistPriceDrop } from './services/notificationService';

export default function App() {
  // Products catalog
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cp_products');
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
        return parsed.map((p) => {
          const init = INITIAL_PRODUCTS.find((item) => item.id === p.id);
          if (init) {
            return { ...p, images: init.images, ean: p.ean || init.ean };
          }
          return p;
        });
      } catch {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const { user: sessionUser, loading, logout } = useAuth();
  const user: User | null = sessionUser ? mapApiUser(sessionUser) : null;
  const navigate = useNavigate();
  const location = useLocation();
  const tabPaths: Record<string, string> = { home: '/', achadinhos: '/achadinhos', vendedores: '/lojas', pedidos: '/pedidos', favoritos: '/favoritos' };
  const routeTabs: Record<string, string> = { '/': 'home', '/achadinhos': 'achadinhos', '/lojas': 'vendedores', '/vender': 'vendedores', '/pedidos': 'pedidos', '/favoritos': 'favoritos' };
  const activeTab = routeTabs[location.pathname] || 'home';
  const setActiveTab = (tab: string) => navigate(tabPaths[tab] || '/');

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cp_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('cp_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Price Alerts state
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    const saved = localStorage.getItem('cp_price_alerts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Wishlist state (persisted in LocalStorage)
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('cp_wishlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Navigation & Filters
  const [selectedCategory, setSelectedCategory] = useState('Todas as Categorias');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic price bounds of full catalog and Price Range Filter State
  const catalogMinPrice = useMemo(() => {
    if (products.length === 0) return 0;
    return Math.floor(Math.min(...products.map((p) => p.price)));
  }, [products]);

  const catalogMaxPrice = useMemo(() => {
    if (products.length === 0) return 300;
    return Math.ceil(Math.max(...products.map((p) => p.price)));
  }, [products]);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);

  // Synchronize initial price range when catalog boundaries are ready
  useEffect(() => {
    if (catalogMinPrice !== undefined && catalogMaxPrice !== undefined) {
      setPriceRange((prev) => {
        if (prev[0] === 0 && prev[1] === 300) {
          return [catalogMinPrice, catalogMaxPrice];
        }
        return prev;
      });
    }
  }, [catalogMinPrice, catalogMaxPrice]);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [affiliateProduct, setAffiliateProduct] = useState<Product | null>(null);
  const isAuthOpen = !loading && (['/login', '/cadastro'].includes(location.pathname) || (!user && ['/conta', '/vendedor'].includes(location.pathname)));
  const setIsAuthOpen = (open: boolean) => navigate(open ? '/login' : '/');
  const isCartOpen = location.pathname === '/sacola';
  const setIsCartOpen = (open: boolean) => navigate(open ? '/sacola' : '/');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const isSellerDashboardOpen = location.pathname === '/vendedor';
  const setIsSellerDashboardOpen = (open: boolean) => navigate(open ? '/vendedor' : '/lojas');
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);

  // Direct product URL deep-linking support (?produto=... or #produto=...)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const prodParam =
      searchParams.get('produto') ||
      searchParams.get('p') ||
      window.location.hash.replace('#produto=', '').replace('#produto-', '').replace('#p=', '');

    if (prodParam) {
      const match = products.find((p) => p.id === prodParam);
      if (match) {
        setSelectedProduct(match);
      }
    }
  }, [products]);

  // Keep URL search parameters updated when modal is opened or closed
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (selectedProduct) {
        url.searchParams.set('produto', selectedProduct.id);
        window.history.replaceState(window.history.state, '', url.toString());
      } else if (url.searchParams.has('produto')) {
        url.searchParams.delete('produto');
        window.history.replaceState(window.history.state, '', url.toString());
      }
    } catch {
      // safe fallback if in restricted iframe
    }
  }, [selectedProduct]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('cp_products', JSON.stringify(products));
  }, [products]);



  useEffect(() => {
    localStorage.setItem('cp_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('cp_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('cp_price_alerts', JSON.stringify(priceAlerts));
  }, [priceAlerts]);

  useEffect(() => {
    localStorage.setItem('cp_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  // Keep priceAlerts synchronized with actual product catalog prices
  useEffect(() => {
    setPriceAlerts((prev) => {
      let changed = false;
      const updated = prev.map((alert) => {
        const prod = products.find((p) => p.id === alert.productId);
        if (prod) {
          const isTriggered = prod.price <= alert.targetPrice;
          if (
            alert.currentPrice !== prod.price ||
            alert.isTriggered !== isTriggered ||
            alert.productTitle !== prod.title
          ) {
            changed = true;
            return {
              ...alert,
              currentPrice: prod.price,
              productTitle: prod.title,
              productImage: prod.images[0] || alert.productImage,
              isTriggered
            };
          }
        }
        return alert;
      });
      return changed ? updated : prev;
    });
  }, [products]);

  // Price Alert Actions
  const handleSavePriceAlert = (productId: string, targetPrice: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const isTriggered = prod.price <= targetPrice;

    setPriceAlerts((prev) => {
      const existingIndex = prev.findIndex((a) => a.productId === productId);
      const newAlert: PriceAlert = {
        id: existingIndex >= 0 ? prev[existingIndex].id : `alert-${Date.now()}`,
        productId,
        productTitle: prod.title,
        productImage: prod.images[0] || '',
        targetPrice,
        currentPrice: prod.price,
        initialPrice: existingIndex >= 0 ? prev[existingIndex].initialPrice : prod.price,
        createdAt: new Date().toISOString(),
        isTriggered
      };

      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = newAlert;
        return copy;
      }
      return [newAlert, ...prev];
    });

    if (isTriggered) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.2 }
      });
    }
  };

  const handleRemovePriceAlert = (productId: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.productId !== productId));
  };

  const handleSimulatePriceDrop = (productId: string) => {
    const alert = priceAlerts.find((a) => a.productId === productId);
    const target = alert ? alert.targetPrice : 0;
    const targetProd = products.find((p) => p.id === productId);

    if (targetProd) {
      const simulatedPrice = target > 0 ? Math.max(5, target - 5) : Math.round(targetProd.price * 0.8);
      const orig = targetProd.price;
      // Trigger Service Worker notification for price drop on wishlist items
      notifyWishlistPriceDrop(targetProd, orig, simulatedPrice);
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const simulatedPrice = target > 0 ? Math.max(5, target - 5) : Math.round(p.price * 0.8);
          const orig = p.originalPrice || p.price;
          return {
            ...p,
            price: simulatedPrice,
            originalPrice: orig,
            discountPercentage: Math.round(((orig - simulatedPrice) / orig) * 100)
          };
        }
        return p;
      })
    );

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.15 }
    });
  };

  // Customer Review & 1-5 Star Evaluation Action
  const handleAddReview = (
    productId: string,
    review: { rating: number; comment: string; authorName: string }
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const currentReviews =
            p.reviews && p.reviews.length > 0
              ? p.reviews
              : getOrGenerateReviews(p.id, p.title, p.rating);

          const newReview: ProductReview = {
            id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            productId,
            authorName: review.authorName || 'Cliente Verificado',
            rating: review.rating,
            comment: review.comment,
            date: new Date().toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }),
            verifiedPurchase: true,
            likes: 0
          };

          const updatedReviews = [newReview, ...currentReviews];
          const prevTotal = p.rating * p.reviewCount;
          const newReviewCount = p.reviewCount + 1;
          const newRating = Number(((prevTotal + review.rating) / newReviewCount).toFixed(1));

          const updatedProduct: Product = {
            ...p,
            rating: newRating,
            reviewCount: newReviewCount,
            reviews: updatedReviews
          };

          if (selectedProduct && selectedProduct.id === productId) {
            setSelectedProduct(updatedProduct);
          }

          return updatedProduct;
        }
        return p;
      })
    );
  };

  // Wishlist Actions
  const handleToggleFavorite = (product: Product) => {
    setWishlistIds((prev) => {
      const isAlreadyFavorite = prev.includes(product.id);
      if (isAlreadyFavorite) {
        return prev.filter((id) => id !== product.id);
      } else {
        try {
          confetti({
            particleCount: 30,
            spread: 45,
            origin: { y: 0.8 },
            colors: ['#f43f5e', '#fb7185', '#fda4af', '#0d9488']
          });
        } catch {
          // safe fallback
        }
        return [...prev, product.id];
      }
    });
  };

  const handleClearWishlist = () => {
    setWishlistIds([]);
  };

  const handleAddAllWishlistToCart = (items: Product[]) => {
    items.forEach((item) => {
      handleAddToCart(item, 1);
    });
    setIsCartOpen(true);
  };

  // Cart actions
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleBuyNow = (product: Product) => {
    handleAddToCart(product, 1);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Checkout & Payment completion
  const handlePaymentComplete = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
  };

  // Seller plan subscription
  const handleSubscribePlan = (plan: SellerPlan) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setIsSellerDashboardOpen(true);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  const handleAddNewProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Filtered products for home and category views
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'Todas as Categorias' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.ean && p.ean.toLowerCase().includes(q)) ||
        (p.upc && p.upc.toLowerCase().includes(q));
      const matchesPrice =
        p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesCategory && matchesSearch && matchesPrice;
    });
  }, [products, selectedCategory, searchQuery, priceRange]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 selection:bg-teal-100 selection:text-teal-900">
      {/* Mobile PWA Install Announcement Banner */}
      <PWAInstallButton variant="banner" />

      {/* Primary Header */}
      <Navbar
        user={user}
        cartItems={cartItems}
        favoritesCount={wishlistIds.length}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSellerDashboard={() => setIsSellerDashboardOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveTab('home');
        }}
        onLogout={() => { logout(); navigate('/'); }}
        priceAlerts={priceAlerts}
        onOpenProductDetail={(prodId) => {
          const p = products.find((prod) => prod.id === prodId);
          if (p) setSelectedProduct(p);
        }}
        onRemovePriceAlert={handleRemovePriceAlert}
        onSimulatePriceDrop={handleSimulatePriceDrop}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        favorites={products.filter((p) => wishlistIds.includes(p.id))}
        ordersCount={orders.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* Hero Banner */}
            <HeroBanner
              onExploreAchadinhos={() => {
                setActiveTab('achadinhos');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onExploreSellers={() => {
                setActiveTab('vendedores');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectTag={(tag) => {
                setSearchQuery(tag);
              }}
            />

            {/* Fixed Section: "Achadinhos do Dia" */}
            <AchadinhosSection
              products={products}
              onAddToCart={handleAddToCart}
              onViewDetails={setSelectedProduct}
              onAffiliateClick={setAffiliateProduct}
              wishlistIds={wishlistIds}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Marketplace Próprio / Comerciantes Parceiros Section */}
            <SellerSection
              products={products}
              user={user}
              onSubscribePlan={handleSubscribePlan}
              onOpenDashboard={() => setIsSellerDashboardOpen(true)}
              onAddToCart={handleAddToCart}
              onViewDetails={setSelectedProduct}
              wishlistIds={wishlistIds}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* General Products Catalog Grid */}
            <section className="py-8 max-w-7xl mx-auto px-4 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 font-display">
                    Catálogo Completo • {selectedCategory}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
                    {(priceRange[0] > catalogMinPrice || priceRange[1] < catalogMaxPrice) && (
                      <span className="text-teal-700 font-semibold ml-1">
                        entre {formatCurrency(priceRange[0])} e {formatCurrency(priceRange[1])}
                      </span>
                    )}
                  </p>
                </div>

                {/* Category Pills Slider */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-teal-700 text-white font-bold'
                          : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider Filter */}
              <PriceRangeSlider
                min={catalogMinPrice}
                max={catalogMaxPrice}
                value={priceRange}
                onChange={setPriceRange}
                onReset={() => setPriceRange([catalogMinPrice, catalogMaxPrice])}
                matchingCount={filteredProducts.length}
              />

              {/* Grid or Empty State */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {filteredProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      isFavorite={wishlistIds.includes(p.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onAddToCart={handleAddToCart}
                      onViewDetails={setSelectedProduct}
                      onDirectAffiliateClick={setAffiliateProduct}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 px-4 text-center bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <SlidersHorizontal size={28} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-neutral-800">
                      Nenhum produto encontrado nesta faixa de preço
                    </h4>
                    <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
                      Não há itens entre {formatCurrency(priceRange[0])} e {formatCurrency(priceRange[1])} para {selectedCategory}. Experimente ajustar os valores no controle deslizante.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPriceRange([catalogMinPrice, catalogMaxPrice])}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Resetar faixa de preço ({formatCurrency(catalogMinPrice)} a {formatCurrency(catalogMaxPrice)})</span>
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: DEDICATED ACHADINHOS PAGE (/achadinhos) */}
        {activeTab === 'achadinhos' && (
          <div className="py-2">
            <AchadinhosSection
              products={products}
              onAddToCart={handleAddToCart}
              onViewDetails={setSelectedProduct}
              onAffiliateClick={setAffiliateProduct}
              isDedicatedPage={true}
              wishlistIds={wishlistIds}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        )}

        {/* TAB 3: DEDICATED SELLERS PAGE */}
        {activeTab === 'vendedores' && (
          <div className="py-2">
            <SellerSection
              products={products}
              user={user}
              onSubscribePlan={handleSubscribePlan}
              onOpenDashboard={() => setIsSellerDashboardOpen(true)}
              onAddToCart={handleAddToCart}
              onViewDetails={setSelectedProduct}
              wishlistIds={wishlistIds}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        )}

        {/* TAB 4: MY ORDERS & TRACKING */}
        {activeTab === 'pedidos' && (
          <OrdersView
            orders={orders}
            onExploreProducts={() => setActiveTab('home')}
          />
        )}

        {/* TAB 5: WISHLIST / MEUS FAVORITOS */}
        {activeTab === 'favoritos' && (
          <WishlistView
            favorites={products.filter((p) => wishlistIds.includes(p.id))}
            onToggleFavorite={handleToggleFavorite}
            onClearFavorites={handleClearWishlist}
            onAddToCart={handleAddToCart}
            onAddAllToCart={handleAddAllWishlistToCart}
            onViewDetails={setSelectedProduct}
            onDirectAffiliateClick={setAffiliateProduct}
            onExploreProducts={() => {
              setActiveTab('achadinhos');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Primary Footer */}
      <Footer
        onSelectTab={(tab) => {
          setActiveTab(tab as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSellerSection={() => {
          setActiveTab('vendedores');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Floating Sales Chatbot "Pop" */}
      <SalesChatbot
        products={products}
        user={user}
        onSelectProduct={setSelectedProduct}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSellerSection={() => {
          setActiveTab('vendedores');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={
            products.find((p) => p.id === selectedProduct.id) || selectedProduct
          }
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onAffiliateRedirect={(prod) => {
            setSelectedProduct(null);
            setAffiliateProduct(prod);
          }}
          priceAlerts={priceAlerts}
          onSavePriceAlert={handleSavePriceAlert}
          onRemovePriceAlert={handleRemovePriceAlert}
          onAddReview={handleAddReview}
          currentUserName={user?.name}
          isFavorite={wishlistIds.includes(selectedProduct.id)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Affiliate Transparency Redirect Modal */}
      {affiliateProduct && (
        <AffiliateModal
          product={affiliateProduct}
          onClose={() => setAffiliateProduct(null)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Integrated Checkout Modal (Mercado Pago / Pix / Cartão / Boleto) */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cartItems}
          user={user}
          onPaymentComplete={handlePaymentComplete}
          onRequireAuth={() => setIsAuthOpen(true)}
        />
      )}

      {/* Two-layer Auth Modal (KYC Facial Biometrics + SMS) */}
      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          initialMode={location.pathname === '/cadastro' ? 'signup' : 'login'}
          onSuccess={() => {
            if (!['/conta', '/vendedor'].includes(location.pathname)) navigate('/');
          }}
        />
      )}

      {/* Barcode Scanner Modal (EAN/UPC Camera Reader) */}
      {isBarcodeScannerOpen && (
        <BarcodeScannerModal
          isOpen={isBarcodeScannerOpen}
          onClose={() => setIsBarcodeScannerOpen(false)}
          products={products}
          onProductFound={(product) => {
            setSelectedProduct(product);
          }}
          onManualSearch={(code) => {
            setSearchQuery(code);
            setActiveTab('home');
          }}
        />
      )}

      {/* Partner Seller Dashboard */}
      {isSellerDashboardOpen && user && (
        <SellerDashboard
          isOpen={isSellerDashboardOpen}
          onClose={() => setIsSellerDashboardOpen(false)}
          user={user}
          products={products}
          onAddNewProduct={handleAddNewProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )}
    </div>
  );
}
