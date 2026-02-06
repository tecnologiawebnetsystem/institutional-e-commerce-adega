-- AdegaExpress Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (both store owners and customers)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'owner', 'admin')),
  phone VARCHAR(20),
  avatar_url TEXT,
  cep VARCHAR(10),
  street VARCHAR(255),
  number VARCHAR(20),
  complement VARCHAR(255),
  neighborhood VARCHAR(255),
  city VARCHAR(255),
  state VARCHAR(2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores (Adegas)
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  cep VARCHAR(10),
  street VARCHAR(255),
  number VARCHAR(20),
  complement VARCHAR(255),
  neighborhood VARCHAR(255),
  city VARCHAR(255),
  state VARCHAR(2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products (Beverages)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  image_url_1 TEXT,
  image_url_2 TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  unit VARCHAR(20) DEFAULT 'un',
  volume VARCHAR(50),
  alcohol_content VARCHAR(20),
  brand VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promotions
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promotion-Product relation
CREATE TABLE IF NOT EXISTS promotion_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(promotion_id, product_id)
);

-- Combos
CREATE TABLE IF NOT EXISTS combos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  combo_price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Combo items
CREATE TABLE IF NOT EXISTS combo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_id UUID NOT NULL REFERENCES combos(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase DECIMAL(10, 2) DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  coupon_id UUID REFERENCES coupons(id),
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  subtotal DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  combo_id UUID REFERENCES combos(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL
);

-- Accounts Payable (Contas a Pagar)
CREATE TABLE IF NOT EXISTS accounts_payable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  category VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accounts Receivable (Contas a Receber)
CREATE TABLE IF NOT EXISTS accounts_receivable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  received_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'overdue', 'cancelled')),
  category VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock movements (for inventory tracking)
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  author VARCHAR(255) DEFAULT 'AdegaExpress',
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table for auth
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- Insert sample blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, image_url, tags, is_published, published_at) VALUES
('Os 10 Melhores Vinhos Tintos para Iniciantes', 'melhores-vinhos-tintos-iniciantes', 'Descubra os vinhos tintos mais acessiveis e saborosos para quem esta comecando no mundo dos vinhos.', 'Se voce esta comecando a explorar o mundo dos vinhos, os tintos sao uma otima porta de entrada. Aqui estao nossas recomendacoes dos 10 melhores vinhos tintos para iniciantes, com opcoes que vao do frutado ao encorpado, todos com precos acessiveis e sabores incriveis.', '/images/blog/vinhos-tintos.jpg', ARRAY['vinhos', 'iniciantes', 'tintos'], true, NOW()),
('Como Montar o Combo Perfeito para Churrasco', 'combo-perfeito-churrasco', 'Cerveja, vinho ou destilado? Saiba como escolher as bebidas ideais para acompanhar seu churrasco.', 'Churrasco e bebida boa sao uma combinacao que todo brasileiro ama. Neste artigo, vamos te ajudar a montar o combo perfeito de bebidas para o seu proximo churrasco, desde cervejas artesanais ate vinhos e destilados.', '/images/blog/churrasco.jpg', ARRAY['churrasco', 'combos', 'cerveja'], true, NOW()),
('Guia Completo de Cervejas Artesanais', 'guia-cervejas-artesanais', 'Tudo que voce precisa saber sobre cervejas artesanais: estilos, sabores e como escolher.', 'As cervejas artesanais conquistaram o Brasil. De IPAs a Stouts, descubra os principais estilos, como apreciar cada um e quais sao as melhores opcoes disponiveis nas adegas parceiras do AdegaExpress.', '/images/blog/cervejas-artesanais.jpg', ARRAY['cerveja', 'artesanal', 'guia'], true, NOW()),
('5 Drinks Faceis para Fazer em Casa', 'drinks-faceis-casa', 'Aprenda a preparar 5 drinks deliciosos com ingredientes simples que voce encontra em qualquer adega.', 'Nao precisa ser barman para fazer drinks incriveis em casa. Com poucos ingredientes e muita criatividade, voce pode surpreender seus convidados. Confira 5 receitas faceis e deliciosas.', '/images/blog/drinks-casa.jpg', ARRAY['drinks', 'receitas', 'casa'], true, NOW()),
('Whisky: Como Escolher e Apreciar', 'whisky-como-escolher-apreciar', 'Do single malt ao blended, aprenda a escolher o whisky ideal para cada ocasiao.', 'O mundo do whisky e vasto e fascinante. Neste guia, voce vai aprender sobre os diferentes tipos, como apreciar corretamente e quais sao os melhores whiskys custo-beneficio disponiveis.', '/images/blog/whisky.jpg', ARRAY['whisky', 'destilados', 'guia'], true, NOW()),
('Harmonizacao de Vinhos e Queijos', 'harmonizacao-vinhos-queijos', 'Descubra as melhores combinacoes de vinhos e queijos para impressionar em qualquer ocasiao.', 'Vinho e queijo e uma combinacao classica que nunca sai de moda. Aprenda as regras basicas de harmonizacao e descubra combinacoes surpreendentes que vao elevar sua experiencia gastronomica.', '/images/blog/vinhos-queijos.jpg', ARRAY['vinhos', 'queijos', 'harmonizacao'], true, NOW()),
('Tendencias de Bebidas para 2026', 'tendencias-bebidas-2026', 'Confira as principais tendencias no mercado de bebidas para este ano.', 'O mercado de bebidas esta sempre em evolucao. De drinks com baixo teor alcoolico a cervejas com sabores exoticos, descubra o que vai bombar em 2026 e fique por dentro das novidades.', '/images/blog/tendencias-2026.jpg', ARRAY['tendencias', 'mercado', '2026'], true, NOW()),
('Como Armazenar Suas Bebidas Corretamente', 'armazenar-bebidas-corretamente', 'Temperatura, luminosidade e posicao: aprenda a conservar suas bebidas da forma ideal.', 'Armazenar bebidas corretamente e essencial para manter sua qualidade. Neste artigo, ensinamos as melhores praticas para conservar vinhos, cervejas, destilados e outras bebidas.', '/images/blog/armazenamento.jpg', ARRAY['armazenamento', 'dicas', 'conservacao'], true, NOW()),
('Os Melhores Espumantes para Celebrar', 'melhores-espumantes-celebrar', 'De champagne a prosecco, descubra os espumantes ideais para cada celebracao.', 'Toda celebracao merece um bom espumante. Descubra os diferentes tipos, de onde vem e como escolher o espumante perfeito para cada momento especial da sua vida.', '/images/blog/espumantes.jpg', ARRAY['espumantes', 'celebracao', 'champagne'], true, NOW()),
('Receitas de Coqueteis Tropicais', 'receitas-coqueteis-tropicais', 'Sabores do Brasil em coqueteis refrescantes perfeitos para o verao.', 'O Brasil e conhecido por suas frutas tropicais incriveis. Aprenda a transformar essas frutas em coqueteis refrescantes e surpreendentes que vao fazer sucesso nas suas festas de verao.', '/images/blog/coqueteis-tropicais.jpg', ARRAY['coqueteis', 'tropical', 'verao'], true, NOW()),
('Cachaca: O Destilado Brasileiro', 'cachaca-destilado-brasileiro', 'Conheca a historia e os segredos da cachaca, o destilado mais brasileiro que existe.', 'A cachaca e mais do que o ingrediente da caipirinha. Descubra a rica historia deste destilado, os diferentes tipos de envelhecimento e como apreciar uma boa cachaca.', '/images/blog/cachaca.jpg', ARRAY['cachaca', 'destilados', 'brasil'], true, NOW()),
('Gin Tonico: A Arte do Drink Perfeito', 'gin-tonico-arte-drink-perfeito', 'Aprenda os segredos para preparar o gin tonico perfeito com botanicos e especiarias.', 'O gin tonico pode parecer simples, mas ha toda uma arte por tras do drink perfeito. Descubra os melhores gins, aguas tonicas e botanicos para criar combinacoes unicas.', '/images/blog/gin-tonico.jpg', ARRAY['gin', 'drinks', 'receitas'], true, NOW()),
('Cervejas para Cada Estacao do Ano', 'cervejas-cada-estacao', 'Descubra quais estilos de cerveja combinam melhor com cada estacao.', 'Assim como roupas, cervejas tambem tem suas estacoes. No verao, as lagers refrescantes; no inverno, as stouts encorpadas. Descubra o estilo ideal para cada momento do ano.', '/images/blog/cervejas-estacao.jpg', ARRAY['cerveja', 'estacoes', 'dicas'], true, NOW()),
('Como Organizar uma Degustacao em Casa', 'organizar-degustacao-casa', 'Dicas praticas para organizar uma degustacao de vinhos ou cervejas na sua casa.', 'Organizar uma degustacao em casa e mais facil do que voce imagina. Com algumas dicas simples de organizacao, servico e selecao de bebidas, voce pode criar uma experiencia memoravel para seus amigos.', '/images/blog/degustacao.jpg', ARRAY['degustacao', 'eventos', 'dicas'], true, NOW()),
('Bebidas Zero Alcool: A Nova Tendencia', 'bebidas-zero-alcool-tendencia', 'Conheca as melhores opcoes de bebidas sem alcool que estao conquistando o mercado.', 'O mercado de bebidas zero alcool esta em plena expansao. De cervejas a destilados, descubra as melhores opcoes para quem quer curtir sem alcool mas com muito sabor.', '/images/blog/zero-alcool.jpg', ARRAY['zero-alcool', 'tendencias', 'saudavel'], true, NOW()),
('Tequila e Mezcal: Diferencas e Como Apreciar', 'tequila-mezcal-diferencas', 'Entenda as diferencas entre tequila e mezcal e aprenda a apreciar esses destilados mexicanos.', 'Tequila e mezcal sao dois destilados mexicanos fascinantes. Neste artigo, explicamos suas diferencas, como sao produzidos e as melhores formas de aprecia-los.', '/images/blog/tequila-mezcal.jpg', ARRAY['tequila', 'mezcal', 'destilados'], true, NOW()),
('Sake: O Guia Definitivo', 'sake-guia-definitivo', 'Tudo sobre sake: tipos, como servir e harmonizar com comida japonesa e brasileira.', 'O sake e uma bebida milenar que esta ganhando cada vez mais espaco no Brasil. Descubra os diferentes tipos, temperaturas de servico e harmonizacoes surpreendentes.', '/images/blog/sake.jpg', ARRAY['sake', 'japones', 'guia'], true, NOW()),
('Licores Artesanais: Sabores Unicos', 'licores-artesanais-sabores-unicos', 'Descubra o mundo dos licores artesanais e seus sabores surpreendentes.', 'Os licores artesanais brasileiros estao ganhando reconhecimento mundial. De licores de frutas tropicais a especiarias unicas, descubra os sabores que estao encantando paladares.', '/images/blog/licores.jpg', ARRAY['licores', 'artesanal', 'sabores'], true, NOW()),
('Vodka: Muito Alem da Caipiroska', 'vodka-alem-caipiroska', 'Conheca os diferentes tipos de vodka e drinks sofisticados para ir alem do basico.', 'A vodka e uma das bebidas mais versateis do mundo. Alem da famosa caipiroska, descubra drinks sofisticados e as melhores vodkas artesanais disponiveis no mercado.', '/images/blog/vodka.jpg', ARRAY['vodka', 'drinks', 'destilados'], true, NOW()),
('Como Ler Rotulos de Vinho', 'como-ler-rotulos-vinho', 'Aprenda a interpretar as informacoes dos rotulos de vinho e faca escolhas mais seguras.', 'Os rotulos de vinho contem informacoes valiosas sobre a bebida. Aprenda a interpretar safra, regiao, tipo de uva, teor alcoolico e outras informacoes que vao te ajudar a fazer melhores escolhas.', '/images/blog/rotulos-vinho.jpg', ARRAY['vinhos', 'rotulos', 'dicas'], true, NOW())
ON CONFLICT (slug) DO NOTHING;
