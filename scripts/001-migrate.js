const { neon } = require("@neondatabase/serverless");

async function migrate() {
  const sql = neon(process.env.DATABASE_URL);

  // Create tables
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

  await sql`
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
    )
  `;

  await sql`
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
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  await sql`
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
    )
  `;

  await sql`
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
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS promotion_products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(promotion_id, product_id)
    )
  `;

  await sql`
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
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS combo_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      combo_id UUID NOT NULL REFERENCES combos(id) ON DELETE CASCADE,
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1
    )
  `;

  await sql`
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
    )
  `;

  await sql`
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
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id UUID REFERENCES products(id) ON DELETE SET NULL,
      combo_id UUID REFERENCES combos(id) ON DELETE SET NULL,
      product_name VARCHAR(255) NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price DECIMAL(10, 2) NOT NULL,
      total_price DECIMAL(10, 2) NOT NULL
    )
  `;

  await sql`
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
    )
  `;

  await sql`
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
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      type VARCHAR(20) NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
      quantity INTEGER NOT NULL,
      reason VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  await sql`
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
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code)`;

  // Insert sample blog posts
  const blogPosts = [
    { title: 'Os 10 Melhores Vinhos Tintos para Iniciantes', slug: 'melhores-vinhos-tintos-iniciantes', excerpt: 'Descubra os vinhos tintos mais acessiveis e saborosos para quem esta comecando no mundo dos vinhos.', content: 'Se voce esta comecando a explorar o mundo dos vinhos, os tintos sao uma otima porta de entrada. Aqui estao nossas recomendacoes dos 10 melhores vinhos tintos para iniciantes, com opcoes que vao do frutado ao encorpado, todos com precos acessiveis e sabores incriveis. Os vinhos chilenos e argentinos sao excelentes opcoes para comecar, oferecendo qualidade excepcional por precos justos. Experimente um Carmenere chileno ou um Malbec argentino para uma introducao perfeita ao mundo dos tintos.', tags: ['vinhos', 'iniciantes', 'tintos'] },
    { title: 'Como Montar o Combo Perfeito para Churrasco', slug: 'combo-perfeito-churrasco', excerpt: 'Cerveja, vinho ou destilado? Saiba como escolher as bebidas ideais para acompanhar seu churrasco.', content: 'Churrasco e bebida boa sao uma combinacao que todo brasileiro ama. Neste artigo, vamos te ajudar a montar o combo perfeito de bebidas para o seu proximo churrasco, desde cervejas artesanais ate vinhos e destilados que harmonizam perfeitamente com carnes grelhadas.', tags: ['churrasco', 'combos', 'cerveja'] },
    { title: 'Guia Completo de Cervejas Artesanais', slug: 'guia-cervejas-artesanais', excerpt: 'Tudo que voce precisa saber sobre cervejas artesanais: estilos, sabores e como escolher.', content: 'As cervejas artesanais conquistaram o Brasil. De IPAs a Stouts, descubra os principais estilos, como apreciar cada um e quais sao as melhores opcoes disponiveis nas adegas parceiras do AdegaExpress.', tags: ['cerveja', 'artesanal', 'guia'] },
    { title: '5 Drinks Faceis para Fazer em Casa', slug: 'drinks-faceis-casa', excerpt: 'Aprenda a preparar 5 drinks deliciosos com ingredientes simples que voce encontra em qualquer adega.', content: 'Nao precisa ser barman para fazer drinks incriveis em casa. Com poucos ingredientes e muita criatividade, voce pode surpreender seus convidados com coqueteis profissionais.', tags: ['drinks', 'receitas', 'casa'] },
    { title: 'Whisky: Como Escolher e Apreciar', slug: 'whisky-como-escolher-apreciar', excerpt: 'Do single malt ao blended, aprenda a escolher o whisky ideal para cada ocasiao.', content: 'O mundo do whisky e vasto e fascinante. Neste guia, voce vai aprender sobre os diferentes tipos, como apreciar corretamente e quais sao os melhores whiskys custo-beneficio.', tags: ['whisky', 'destilados', 'guia'] },
    { title: 'Harmonizacao de Vinhos e Queijos', slug: 'harmonizacao-vinhos-queijos', excerpt: 'Descubra as melhores combinacoes de vinhos e queijos para impressionar em qualquer ocasiao.', content: 'Vinho e queijo e uma combinacao classica que nunca sai de moda. Aprenda as regras basicas de harmonizacao e descubra combinacoes surpreendentes.', tags: ['vinhos', 'queijos', 'harmonizacao'] },
    { title: 'Tendencias de Bebidas para 2026', slug: 'tendencias-bebidas-2026', excerpt: 'Confira as principais tendencias no mercado de bebidas para este ano.', content: 'O mercado de bebidas esta sempre em evolucao. De drinks com baixo teor alcoolico a cervejas com sabores exoticos, descubra o que vai bombar em 2026.', tags: ['tendencias', 'mercado', '2026'] },
    { title: 'Como Armazenar Suas Bebidas Corretamente', slug: 'armazenar-bebidas-corretamente', excerpt: 'Temperatura, luminosidade e posicao: aprenda a conservar suas bebidas da forma ideal.', content: 'Armazenar bebidas corretamente e essencial para manter sua qualidade. Neste artigo, ensinamos as melhores praticas para conservar vinhos, cervejas e destilados.', tags: ['armazenamento', 'dicas', 'conservacao'] },
    { title: 'Os Melhores Espumantes para Celebrar', slug: 'melhores-espumantes-celebrar', excerpt: 'De champagne a prosecco, descubra os espumantes ideais para cada celebracao.', content: 'Toda celebracao merece um bom espumante. Descubra os diferentes tipos e como escolher o espumante perfeito para cada momento especial.', tags: ['espumantes', 'celebracao', 'champagne'] },
    { title: 'Receitas de Coqueteis Tropicais', slug: 'receitas-coqueteis-tropicais', excerpt: 'Sabores do Brasil em coqueteis refrescantes perfeitos para o verao.', content: 'O Brasil e conhecido por suas frutas tropicais incriveis. Aprenda a transformar essas frutas em coqueteis refrescantes e surpreendentes.', tags: ['coqueteis', 'tropical', 'verao'] },
    { title: 'Cachaca: O Destilado Brasileiro', slug: 'cachaca-destilado-brasileiro', excerpt: 'Conheca a historia e os segredos da cachaca, o destilado mais brasileiro que existe.', content: 'A cachaca e mais do que o ingrediente da caipirinha. Descubra a rica historia deste destilado e os diferentes tipos de envelhecimento.', tags: ['cachaca', 'destilados', 'brasil'] },
    { title: 'Gin Tonico: A Arte do Drink Perfeito', slug: 'gin-tonico-arte-drink-perfeito', excerpt: 'Aprenda os segredos para preparar o gin tonico perfeito com botanicos e especiarias.', content: 'O gin tonico pode parecer simples, mas ha toda uma arte por tras do drink perfeito. Descubra os melhores gins e aguas tonicas.', tags: ['gin', 'drinks', 'receitas'] },
    { title: 'Cervejas para Cada Estacao do Ano', slug: 'cervejas-cada-estacao', excerpt: 'Descubra quais estilos de cerveja combinam melhor com cada estacao.', content: 'Assim como roupas, cervejas tambem tem suas estacoes. No verao, as lagers refrescantes; no inverno, as stouts encorpadas.', tags: ['cerveja', 'estacoes', 'dicas'] },
    { title: 'Como Organizar uma Degustacao em Casa', slug: 'organizar-degustacao-casa', excerpt: 'Dicas praticas para organizar uma degustacao de vinhos ou cervejas na sua casa.', content: 'Organizar uma degustacao em casa e mais facil do que voce imagina. Com algumas dicas simples voce pode criar uma experiencia memoravel.', tags: ['degustacao', 'eventos', 'dicas'] },
    { title: 'Bebidas Zero Alcool: A Nova Tendencia', slug: 'bebidas-zero-alcool-tendencia', excerpt: 'Conheca as melhores opcoes de bebidas sem alcool que estao conquistando o mercado.', content: 'O mercado de bebidas zero alcool esta em plena expansao. Descubra as melhores opcoes para quem quer curtir sem alcool mas com muito sabor.', tags: ['zero-alcool', 'tendencias', 'saudavel'] },
    { title: 'Tequila e Mezcal: Diferencas e Como Apreciar', slug: 'tequila-mezcal-diferencas', excerpt: 'Entenda as diferencas entre tequila e mezcal e aprenda a apreciar esses destilados mexicanos.', content: 'Tequila e mezcal sao dois destilados mexicanos fascinantes. Neste artigo, explicamos suas diferencas e as melhores formas de aprecia-los.', tags: ['tequila', 'mezcal', 'destilados'] },
    { title: 'Sake: O Guia Definitivo', slug: 'sake-guia-definitivo', excerpt: 'Tudo sobre sake: tipos, como servir e harmonizar com comida japonesa e brasileira.', content: 'O sake e uma bebida milenar que esta ganhando cada vez mais espaco no Brasil. Descubra os diferentes tipos e temperaturas de servico.', tags: ['sake', 'japones', 'guia'] },
    { title: 'Licores Artesanais: Sabores Unicos', slug: 'licores-artesanais-sabores-unicos', excerpt: 'Descubra o mundo dos licores artesanais e seus sabores surpreendentes.', content: 'Os licores artesanais brasileiros estao ganhando reconhecimento mundial. Descubra os sabores que estao encantando paladares.', tags: ['licores', 'artesanal', 'sabores'] },
    { title: 'Vodka: Muito Alem da Caipiroska', slug: 'vodka-alem-caipiroska', excerpt: 'Conheca os diferentes tipos de vodka e drinks sofisticados para ir alem do basico.', content: 'A vodka e uma das bebidas mais versateis do mundo. Descubra drinks sofisticados e as melhores vodkas artesanais do mercado.', tags: ['vodka', 'drinks', 'destilados'] },
    { title: 'Como Ler Rotulos de Vinho', slug: 'como-ler-rotulos-vinho', excerpt: 'Aprenda a interpretar as informacoes dos rotulos de vinho e faca escolhas mais seguras.', content: 'Os rotulos de vinho contem informacoes valiosas sobre a bebida. Aprenda a interpretar safra, regiao, tipo de uva e teor alcoolico.', tags: ['vinhos', 'rotulos', 'dicas'] },
  ];

  for (const post of blogPosts) {
    await sql`
      INSERT INTO blog_posts (title, slug, excerpt, content, tags, is_published, published_at)
      VALUES (${post.title}, ${post.slug}, ${post.excerpt}, ${post.content}, ${post.tags}, true, NOW())
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  console.log("Migration completed successfully!");
}

migrate().catch(console.error);
