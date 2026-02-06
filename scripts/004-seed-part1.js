const { neon } = require("@neondatabase/serverless");
const crypto = require("crypto");

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function seed() {
  const sql = neon(process.env.DATABASE_URL);

  console.log("Limpando dados antigos...");
  await sql`DELETE FROM accounts_payable`;
  await sql`DELETE FROM accounts_receivable`;
  await sql`DELETE FROM order_items`;
  await sql`DELETE FROM orders`;
  await sql`DELETE FROM stock_movements`;
  await sql`DELETE FROM combo_items`;
  await sql`DELETE FROM combos`;
  await sql`DELETE FROM promotion_products`;
  await sql`DELETE FROM promotions`;
  await sql`DELETE FROM coupons`;
  await sql`DELETE FROM products`;
  await sql`DELETE FROM categories`;
  await sql`DELETE FROM stores`;
  await sql`DELETE FROM sessions`;
  await sql`DELETE FROM blog_posts`;
  await sql`DELETE FROM users`;
  console.log("Dados antigos removidos.");

  console.log("Criando usuarios...");
  const pwHash = hashPassword("123456");
  const pinHash = hashPassword("1234");

  const ownerData = [
    // --- Sao Jose dos Campos (10) ---
    { name: "Carlos Mendes", email: "carlos@adega1.com", phone: "(12) 99100-0001", city: "Sao Jose dos Campos", state: "SP", cep: "12210-000", street: "Av. Dr. Nelson D'Avila", number: "120", neighborhood: "Centro" },
    { name: "Fernanda Oliveira", email: "fernanda@adega2.com", phone: "(12) 99100-0002", city: "Sao Jose dos Campos", state: "SP", cep: "12243-000", street: "Rua Euclides Miragaia", number: "450", neighborhood: "Jardim Aquarius" },
    { name: "Roberto Silva", email: "roberto@adega3.com", phone: "(12) 99100-0003", city: "Sao Jose dos Campos", state: "SP", cep: "12220-000", street: "Av. Nove de Julho", number: "88", neighborhood: "Vila Adyana" },
    { name: "Ana Beatriz Costa", email: "ana@adega4.com", phone: "(12) 99100-0004", city: "Sao Jose dos Campos", state: "SP", cep: "12230-000", street: "Rua Rubiao Junior", number: "200", neighborhood: "Vila Ema" },
    { name: "Marcos Pereira", email: "marcos@adega5.com", phone: "(12) 99100-0005", city: "Sao Jose dos Campos", state: "SP", cep: "12245-000", street: "Av. Cassiano Ricardo", number: "601", neighborhood: "Jardim Aquarius" },
    { name: "Juliana Santos", email: "juliana@adega6.com", phone: "(12) 99100-0006", city: "Sao Jose dos Campos", state: "SP", cep: "12216-000", street: "Rua Vilaca", number: "320", neighborhood: "Centro" },
    { name: "Pedro Almeida", email: "pedro@adega7.com", phone: "(12) 99100-0007", city: "Sao Jose dos Campos", state: "SP", cep: "12235-000", street: "Av. Andromeda", number: "750", neighborhood: "Jardim Satelite" },
    { name: "Lucia Ferreira", email: "lucia@adega8.com", phone: "(12) 99100-0008", city: "Sao Jose dos Campos", state: "SP", cep: "12233-000", street: "Rua Paraibuna", number: "180", neighborhood: "Jardim Paulista" },
    { name: "Ricardo Nunes", email: "ricardo@adega9.com", phone: "(12) 99100-0009", city: "Sao Jose dos Campos", state: "SP", cep: "12211-000", street: "Rua XV de Novembro", number: "55", neighborhood: "Centro" },
    { name: "Marina Rodrigues", email: "marina@adega10.com", phone: "(12) 99100-0010", city: "Sao Jose dos Campos", state: "SP", cep: "12242-000", street: "Av. Sao Joao", number: "1400", neighborhood: "Jardim das Industrias" },
    // --- Cacapava (5) ---
    { name: "Antonio Barbosa", email: "antonio@adega11.com", phone: "(12) 99200-0011", city: "Cacapava", state: "SP", cep: "12281-000", street: "Rua Cel. Alfredo Guedes", number: "100", neighborhood: "Centro" },
    { name: "Patricia Gomes", email: "patricia@adega12.com", phone: "(12) 99200-0012", city: "Cacapava", state: "SP", cep: "12282-000", street: "Av. Brasil", number: "350", neighborhood: "Jardim Italia" },
    { name: "Eduardo Martins", email: "eduardo@adega13.com", phone: "(12) 99200-0013", city: "Cacapava", state: "SP", cep: "12283-000", street: "Rua Sao Jose", number: "220", neighborhood: "Vila Sao Jose" },
    { name: "Renata Souza", email: "renata@adega14.com", phone: "(12) 99200-0014", city: "Cacapava", state: "SP", cep: "12284-000", street: "Rua Voluntarios da Patria", number: "88", neighborhood: "Centro" },
    { name: "Fabio Carvalho", email: "fabio@adega15.com", phone: "(12) 99200-0015", city: "Cacapava", state: "SP", cep: "12285-000", street: "Rua Major Novaes", number: "450", neighborhood: "Jardim Paraiso" },
    // --- Taubate (15) ---
    { name: "Gustavo Lima", email: "gustavo@adega16.com", phone: "(12) 99300-0016", city: "Taubate", state: "SP", cep: "12010-000", street: "Rua Jacques Felix", number: "300", neighborhood: "Centro" },
    { name: "Claudia Ribeiro", email: "claudia@adega17.com", phone: "(12) 99300-0017", city: "Taubate", state: "SP", cep: "12020-000", street: "Av. Charles Schnneider", number: "600", neighborhood: "Vila Costa" },
    { name: "Rafael Teixeira", email: "rafael@adega18.com", phone: "(12) 99300-0018", city: "Taubate", state: "SP", cep: "12030-000", street: "Rua Visconde do Rio Branco", number: "150", neighborhood: "Centro" },
    { name: "Simone Dias", email: "simone@adega19.com", phone: "(12) 99300-0019", city: "Taubate", state: "SP", cep: "12040-000", street: "Av. Independencia", number: "800", neighborhood: "Independencia" },
    { name: "Leandro Moreira", email: "leandro@adega20.com", phone: "(12) 99300-0020", city: "Taubate", state: "SP", cep: "12050-000", street: "Rua Dr. Souza Alves", number: "250", neighborhood: "Centro" },
    { name: "Vanessa Pinto", email: "vanessa@adega21.com", phone: "(12) 99300-0021", city: "Taubate", state: "SP", cep: "12060-000", street: "Av. Nove de Julho", number: "1200", neighborhood: "Vila Aparecida" },
    { name: "Thiago Rocha", email: "thiago@adega22.com", phone: "(12) 99300-0022", city: "Taubate", state: "SP", cep: "12070-000", street: "Rua Conselheiro Moreira de Barros", number: "500", neighborhood: "Centro" },
    { name: "Amanda Freitas", email: "amanda@adega23.com", phone: "(12) 99300-0023", city: "Taubate", state: "SP", cep: "12080-000", street: "Rua Baronesa de Itapetininga", number: "380", neighborhood: "Jardim das Nacoes" },
    { name: "Bruno Azevedo", email: "bruno@adega24.com", phone: "(12) 99300-0024", city: "Taubate", state: "SP", cep: "12090-000", street: "Av. Granadeiro Guimaraes", number: "900", neighborhood: "Quiririm" },
    { name: "Daniela Campos", email: "daniela@adega25.com", phone: "(12) 99300-0025", city: "Taubate", state: "SP", cep: "12011-000", street: "Praca Santa Terezinha", number: "15", neighborhood: "Centro" },
    { name: "Henrique Lopes", email: "henrique@adega26.com", phone: "(12) 99300-0026", city: "Taubate", state: "SP", cep: "12012-000", street: "Rua Sao Bento", number: "430", neighborhood: "Sao Bento" },
    { name: "Isabella Monteiro", email: "isabella@adega27.com", phone: "(12) 99300-0027", city: "Taubate", state: "SP", cep: "12013-000", street: "Av. do Povo", number: "1800", neighborhood: "Estiva" },
    { name: "Rodrigo Nascimento", email: "rodrigo@adega28.com", phone: "(12) 99300-0028", city: "Taubate", state: "SP", cep: "12014-000", street: "Rua Marechal Deodoro", number: "275", neighborhood: "Centro" },
    { name: "Larissa Cunha", email: "larissa@adega29.com", phone: "(12) 99300-0029", city: "Taubate", state: "SP", cep: "12015-000", street: "Rua Padre Faria", number: "650", neighborhood: "Vila Sao Jose" },
    { name: "Felipe Araujo", email: "felipe@adega30.com", phone: "(12) 99300-0030", city: "Taubate", state: "SP", cep: "12016-000", street: "Rua Professor Augusto Guedes", number: "100", neighborhood: "Parque Urup" },
    // --- Tremembe (5) ---
    { name: "Marcelo Vieira", email: "marcelo@adega31.com", phone: "(12) 99400-0031", city: "Tremembe", state: "SP", cep: "12120-000", street: "Rua Cel. Jose Benedito", number: "200", neighborhood: "Centro" },
    { name: "Tatiana Correia", email: "tatiana@adega32.com", phone: "(12) 99400-0032", city: "Tremembe", state: "SP", cep: "12121-000", street: "Av. Prefeito Niels Kristensen", number: "500", neighborhood: "Vila Sao Geraldo" },
    { name: "Wagner Fonseca", email: "wagner@adega33.com", phone: "(12) 99400-0033", city: "Tremembe", state: "SP", cep: "12122-000", street: "Rua Capitao Jose Marcondes", number: "85", neighborhood: "Centro" },
    { name: "Elaine Cardoso", email: "elaine@adega34.com", phone: "(12) 99400-0034", city: "Tremembe", state: "SP", cep: "12123-000", street: "Rua Santo Antonio", number: "340", neighborhood: "Vila Santo Antonio" },
    { name: "Diego Menezes", email: "diego@adega35.com", phone: "(12) 99400-0035", city: "Tremembe", state: "SP", cep: "12124-000", street: "Rua Benedito Jose de Camargo", number: "150", neighborhood: "Jardim America" },
    // --- Pindamonhangaba (9) ---
    { name: "Adriana Batista", email: "adriana@adega36.com", phone: "(12) 99500-0036", city: "Pindamonhangaba", state: "SP", cep: "12400-000", street: "Rua Maj. Jose dos Santos Moreira", number: "230", neighborhood: "Centro" },
    { name: "Sergio Ramos", email: "sergio@adega37.com", phone: "(12) 99500-0037", city: "Pindamonhangaba", state: "SP", cep: "12401-000", street: "Av. Nossa Senhora do Bom Sucesso", number: "800", neighborhood: "Bom Sucesso" },
    { name: "Monica Castro", email: "monica@adega38.com", phone: "(12) 99500-0038", city: "Pindamonhangaba", state: "SP", cep: "12402-000", street: "Rua Dr. Lucio Malta", number: "110", neighborhood: "Centro" },
    { name: "Alexandre Moura", email: "alexandre@adega39.com", phone: "(12) 99500-0039", city: "Pindamonhangaba", state: "SP", cep: "12403-000", street: "Av. Deputado Cunha Bueno", number: "1500", neighborhood: "Bosque da Princesa" },
    { name: "Priscila Nogueira", email: "priscila@adega40.com", phone: "(12) 99500-0040", city: "Pindamonhangaba", state: "SP", cep: "12404-000", street: "Rua Monsenhor Jose", number: "320", neighborhood: "Centro" },
    { name: "Vinicius Barros", email: "vinicius@adega41.com", phone: "(12) 99500-0041", city: "Pindamonhangaba", state: "SP", cep: "12405-000", street: "Rua Cel. Moreira Cesar", number: "60", neighborhood: "Mombaca" },
    { name: "Camila Andrade", email: "camila.a@adega42.com", phone: "(12) 99500-0042", city: "Pindamonhangaba", state: "SP", cep: "12406-000", street: "Av. Trabalhadores", number: "950", neighborhood: "Araretama" },
    { name: "Leonardo Guimaraes", email: "leonardo@adega43.com", phone: "(12) 99500-0043", city: "Pindamonhangaba", state: "SP", cep: "12407-000", street: "Rua Saldanha Marinho", number: "180", neighborhood: "Centro" },
    { name: "Fernanda Lima", email: "fernanda.l@adega44.com", phone: "(12) 99500-0044", city: "Pindamonhangaba", state: "SP", cep: "12408-000", street: "Rua Padre Anchieta", number: "400", neighborhood: "Santa Clara" },
  ];

  // Insert all owners in parallel
  const ownerResults = await Promise.all(
    ownerData.map((o) =>
      sql`INSERT INTO users (name, email, password_hash, pin_hash, role, phone, cep, street, number, neighborhood, city, state)
          VALUES (${o.name}, ${o.email}, ${pwHash}, ${pinHash}, 'owner', ${o.phone}, ${o.cep}, ${o.street}, ${o.number}, ${o.neighborhood}, ${o.city}, ${o.state})
          RETURNING id`
    )
  );
  const owners = ownerResults.map((rows, i) => ({ id: rows[0].id, ...ownerData[i] }));

  const customerData = [
    { name: "Joao da Silva", email: "joao@email.com", phone: "(12) 98100-1111", city: "Sao Jose dos Campos", state: "SP", cep: "12210-100", street: "Rua Paraibuna", number: "500", neighborhood: "Jardim Paulista" },
    { name: "Maria Souza", email: "maria@email.com", phone: "(12) 98200-2222", city: "Taubate", state: "SP", cep: "12020-100", street: "Rua Visconde do Rio Branco", number: "200", neighborhood: "Centro" },
    { name: "Paulo Costa", email: "paulo@email.com", phone: "(12) 98300-3333", city: "Pindamonhangaba", state: "SP", cep: "12400-100", street: "Rua Dr. Lucio Malta", number: "80", neighborhood: "Centro" },
    { name: "Camila Lima", email: "camila@email.com", phone: "(12) 98400-4444", city: "Cacapava", state: "SP", cep: "12281-100", street: "Rua Cel. Alfredo Guedes", number: "300", neighborhood: "Centro" },
    { name: "Lucas Martins", email: "lucas@email.com", phone: "(12) 98500-5555", city: "Tremembe", state: "SP", cep: "12120-100", street: "Rua Cel. Jose Benedito", number: "70", neighborhood: "Centro" },
  ];

  const customerResults = await Promise.all(
    customerData.map((c) =>
      sql`INSERT INTO users (name, email, password_hash, pin_hash, role, phone, cep, street, number, neighborhood, city, state)
          VALUES (${c.name}, ${c.email}, ${pwHash}, ${pinHash}, 'customer', ${c.phone}, ${c.cep}, ${c.street}, ${c.number}, ${c.neighborhood}, ${c.city}, ${c.state})
          RETURNING id`
    )
  );
  const customers = customerResults.map((rows, i) => ({ id: rows[0].id, ...customerData[i] }));
  console.log(`Criados ${owners.length} donos e ${customers.length} clientes.`);

  // Store configs
  const storeConfigs = [
    { ownIdx: 0, name: "Adega do Carlos", slug: "adega-do-carlos", description: "A melhor selecao de vinhos nacionais e importados em Sao Jose dos Campos." },
    { ownIdx: 1, name: "Adega Aquarius", slug: "adega-aquarius", description: "Cervejas artesanais e destilados premium no Jardim Aquarius." },
    { ownIdx: 2, name: "Adega Villa", slug: "adega-villa", description: "Vinhos importados e nacionais na Vila Adyana." },
    { ownIdx: 3, name: "Emporio das Bebidas SJC", slug: "emporio-bebidas-sjc", description: "Destilados finos, cervejas especiais e vinhos selecionados." },
    { ownIdx: 4, name: "Adega Cassiano", slug: "adega-cassiano", description: "As melhores bebidas com entrega rapida na Av. Cassiano Ricardo." },
    { ownIdx: 5, name: "Bebidas Express SJC", slug: "bebidas-express-sjc", description: "Entrega rapida de cervejas, vinhos e destilados no centro de SJC." },
    { ownIdx: 6, name: "Adega Satelite", slug: "adega-satelite", description: "A adega do Jardim Satelite. Precos acessiveis e variedade." },
    { ownIdx: 7, name: "Adega Premium SJC", slug: "adega-premium-sjc", description: "Vinhos premium, whiskies single malt e cervejas importadas." },
    { ownIdx: 8, name: "Adega XV", slug: "adega-xv", description: "Tradicao no centro de SJC. Cachacas artesanais e vinhos." },
    { ownIdx: 9, name: "Adega das Industrias", slug: "adega-das-industrias", description: "Bebidas para o dia a dia no Jardim das Industrias." },
    { ownIdx: 10, name: "Adega Cacapava", slug: "adega-cacapava", description: "A principal adega de Cacapava." },
    { ownIdx: 11, name: "Emporio Italia Cacapava", slug: "emporio-italia-cacapava", description: "Vinhos italianos e cervejas importadas no Jardim Italia." },
    { ownIdx: 12, name: "Bebidas Sao Jose", slug: "bebidas-sao-jose", description: "Cervejas geladas e vinhos na Vila Sao Jose." },
    { ownIdx: 13, name: "Adega Central Cacapava", slug: "adega-central-cacapava", description: "A melhor selecao de bebidas no centro de Cacapava." },
    { ownIdx: 14, name: "Adega Paraiso", slug: "adega-paraiso", description: "Vinhos, cervejas e destilados no Jardim Paraiso." },
    { ownIdx: 15, name: "Adega Jacques Felix", slug: "adega-jacques-felix", description: "Vinhos premiados e cervejas artesanais em Taubate." },
    { ownIdx: 16, name: "Adega Vila Costa", slug: "adega-vila-costa", description: "Cervejas artesanais e importadas na Vila Costa." },
    { ownIdx: 17, name: "Emporio do Vinho Taubate", slug: "emporio-vinho-taubate", description: "Especialistas em vinhos no centro de Taubate." },
    { ownIdx: 18, name: "Adega Independencia", slug: "adega-independencia", description: "Bebidas premium na Av. Independencia." },
    { ownIdx: 19, name: "Bebidas Express Taubate", slug: "bebidas-express-taubate", description: "Entrega rapida de bebidas em Taubate." },
    { ownIdx: 20, name: "Adega Aparecida", slug: "adega-aparecida", description: "Vinhos, cervejas e destilados na Vila Aparecida." },
    { ownIdx: 21, name: "Adega Moreira de Barros", slug: "adega-moreira-barros", description: "Destilados premium no centro historico de Taubate." },
    { ownIdx: 22, name: "Adega das Nacoes", slug: "adega-das-nacoes", description: "Bebidas de todo o mundo no Jardim das Nacoes." },
    { ownIdx: 23, name: "Adega Quiririm", slug: "adega-quiririm", description: "Vinhos e grappas artesanais no bairro italiano." },
    { ownIdx: 24, name: "Emporio Santa Terezinha", slug: "emporio-santa-terezinha", description: "Vinhos, espumantes e cervejas artesanais." },
    { ownIdx: 25, name: "Adega Sao Bento", slug: "adega-sao-bento", description: "Cachacas artesanais e cervejas no Sao Bento." },
    { ownIdx: 26, name: "Adega Estiva", slug: "adega-estiva", description: "Bebidas para churrascos e festas na Estiva." },
    { ownIdx: 27, name: "Adega Imperial Taubate", slug: "adega-imperial-taubate", description: "A adega mais completa de Taubate." },
    { ownIdx: 28, name: "Adega Padre Faria", slug: "adega-padre-faria", description: "Cervejas geladas na Vila Sao Jose." },
    { ownIdx: 29, name: "Adega Urup", slug: "adega-urup", description: "Vinhos e cervejas artesanais no Parque Urup." },
    { ownIdx: 30, name: "Adega Tremembe", slug: "adega-tremembe", description: "A adega do centro de Tremembe." },
    { ownIdx: 31, name: "Emporio Sao Geraldo", slug: "emporio-sao-geraldo", description: "Bebidas selecionadas na Vila Sao Geraldo." },
    { ownIdx: 32, name: "Adega do Vale Tremembe", slug: "adega-vale-tremembe", description: "A melhor selecao de bebidas do Vale do Paraiba." },
    { ownIdx: 33, name: "Bebidas Santo Antonio", slug: "bebidas-santo-antonio", description: "Cachacas artesanais e cervejas em Tremembe." },
    { ownIdx: 34, name: "Adega America Tremembe", slug: "adega-america-tremembe", description: "Cervejas importadas e vinhos no Jardim America." },
    { ownIdx: 35, name: "Adega Pinda", slug: "adega-pinda", description: "A maior adega de Pindamonhangaba." },
    { ownIdx: 36, name: "Adega Bom Sucesso", slug: "adega-bom-sucesso", description: "Bebidas de qualidade no bairro Bom Sucesso." },
    { ownIdx: 37, name: "Emporio Central Pinda", slug: "emporio-central-pinda", description: "Vinhos importados e nacionais no centro de Pinda." },
    { ownIdx: 38, name: "Adega Bosque da Princesa", slug: "adega-bosque-princesa", description: "Cervejas artesanais no Bosque da Princesa." },
    { ownIdx: 39, name: "Bebidas Express Pinda", slug: "bebidas-express-pinda", description: "Entrega rapida de bebidas em Pindamonhangaba." },
    { ownIdx: 40, name: "Adega Mombaca", slug: "adega-mombaca", description: "Destilados finos e cervejas no bairro Mombaca." },
    { ownIdx: 41, name: "Adega Araretama", slug: "adega-araretama", description: "Vinhos, espumantes e cervejas no Araretama." },
    { ownIdx: 42, name: "Emporio do Vinho Pinda", slug: "emporio-vinho-pinda", description: "A referencia em vinhos de Pinda." },
    { ownIdx: 43, name: "Adega Santa Clara", slug: "adega-santa-clara", description: "Bebidas artesanais e importadas no Santa Clara." },
  ];

  console.log("Criando adegas...");
  const storeResults = await Promise.all(
    storeConfigs.map((s) => {
      const own = owners[s.ownIdx];
      return sql`INSERT INTO stores (owner_id, name, slug, description, phone, email, cep, street, number, neighborhood, city, state, is_active)
                 VALUES (${own.id}, ${s.name}, ${s.slug}, ${s.description}, ${own.phone}, ${own.email}, ${own.cep}, ${own.street}, ${own.number}, ${own.neighborhood}, ${own.city}, ${own.state}, true)
                 RETURNING id`;
    })
  );
  const storeIds = storeResults.map((r) => r[0].id);
  console.log(`Criadas ${storeIds.length} adegas.`);

  // Categories
  console.log("Criando categorias...");
  const categoryNames = [
    { name: "Vinhos Tintos", slug: "vinhos-tintos" },
    { name: "Vinhos Brancos", slug: "vinhos-brancos" },
    { name: "Espumantes", slug: "espumantes" },
    { name: "Cervejas Artesanais", slug: "cervejas-artesanais" },
    { name: "Cervejas Importadas", slug: "cervejas-importadas" },
    { name: "Cervejas Tradicionais", slug: "cervejas-tradicionais" },
    { name: "Whisky", slug: "whisky" },
    { name: "Vodka", slug: "vodka" },
    { name: "Gin", slug: "gin" },
    { name: "Cachaca", slug: "cachaca" },
    { name: "Tequila e Mezcal", slug: "tequila-mezcal" },
    { name: "Rum", slug: "rum" },
    { name: "Licores", slug: "licores" },
    { name: "Drinks Prontos", slug: "drinks-prontos" },
    { name: "Sem Alcool", slug: "sem-alcool" },
  ];

  const storeCats = {};
  // Process 5 stores at a time to avoid overwhelming Neon
  for (let batch = 0; batch < storeIds.length; batch += 5) {
    const batchEnd = Math.min(batch + 5, storeIds.length);
    const batchPromises = [];
    for (let si = batch; si < batchEnd; si++) {
      storeCats[si] = {};
      for (const cat of categoryNames) {
        batchPromises.push(
          sql`INSERT INTO categories (store_id, name, slug, description)
              VALUES (${storeIds[si]}, ${cat.name}, ${cat.slug}, ${cat.name})
              RETURNING id`.then((rows) => ({ si, slug: cat.slug, id: rows[0].id }))
        );
      }
    }
    const results = await Promise.all(batchPromises);
    for (const r of results) {
      storeCats[r.si][r.slug] = r.id;
    }
  }
  console.log("Categorias criadas.");

  // Products - reduced set for faster seeding (20 key products)
  console.log("Criando produtos...");
  const productTemplates = [
    { catSlug: "vinhos-tintos", name: "Casillero del Diablo Cabernet Sauvignon", price: 49.90, originalPrice: 59.90, volume: "750ml", alcohol: "13.5%", brand: "Concha y Toro", stock: 48, desc: "Vinho tinto chileno encorpado com notas de frutas vermelhas." },
    { catSlug: "vinhos-tintos", name: "Malbec Reserva Catena Zapata", price: 129.90, originalPrice: 149.90, volume: "750ml", alcohol: "14%", brand: "Catena Zapata", stock: 24, desc: "Malbec argentino de alta qualidade." },
    { catSlug: "vinhos-tintos", name: "Miolo Reserva Merlot", price: 59.90, originalPrice: null, volume: "750ml", alcohol: "13%", brand: "Miolo", stock: 36, desc: "Vinho gaucho elegante com taninos macios." },
    { catSlug: "vinhos-brancos", name: "Santa Helena Reservado Chardonnay", price: 34.90, originalPrice: 42.90, volume: "750ml", alcohol: "13.5%", brand: "Santa Helena", stock: 50, desc: "Chardonnay chileno leve e frutado." },
    { catSlug: "vinhos-brancos", name: "Cloudy Bay Sauvignon Blanc", price: 159.90, originalPrice: null, volume: "750ml", alcohol: "13%", brand: "Cloudy Bay", stock: 15, desc: "Sauvignon Blanc neozelandes fresco e vibrante." },
    { catSlug: "espumantes", name: "Chandon Brut Rose", price: 89.90, originalPrice: 109.90, volume: "750ml", alcohol: "12%", brand: "Chandon", stock: 25, desc: "Espumante rose elegante." },
    { catSlug: "espumantes", name: "Veuve Clicquot Brut", price: 499.90, originalPrice: null, volume: "750ml", alcohol: "12%", brand: "Veuve Clicquot", stock: 8, desc: "Champagne frances iconico." },
    { catSlug: "cervejas-artesanais", name: "Colorado Appia", price: 14.90, originalPrice: null, volume: "600ml", alcohol: "5.5%", brand: "Colorado", stock: 80, desc: "Cerveja de trigo com mel de laranjeira." },
    { catSlug: "cervejas-artesanais", name: "Wals Session Citra IPA", price: 12.90, originalPrice: null, volume: "355ml", alcohol: "4.7%", brand: "Wals", stock: 100, desc: "Session IPA leve e aromatica." },
    { catSlug: "cervejas-importadas", name: "Guinness Draught", price: 19.90, originalPrice: null, volume: "440ml", alcohol: "4.2%", brand: "Guinness", stock: 60, desc: "Stout irlandesa classica." },
    { catSlug: "cervejas-tradicionais", name: "Heineken", price: 6.90, originalPrice: null, volume: "350ml", alcohol: "5%", brand: "Heineken", stock: 200, desc: "Lager holandesa puro malte." },
    { catSlug: "cervejas-tradicionais", name: "Stella Artois", price: 7.90, originalPrice: null, volume: "350ml", alcohol: "5.2%", brand: "Stella Artois", stock: 180, desc: "Lager belga premium." },
    { catSlug: "whisky", name: "Johnnie Walker Black Label", price: 159.90, originalPrice: 189.90, volume: "1L", alcohol: "40%", brand: "Johnnie Walker", stock: 20, desc: "Blended Scotch Whisky 12 anos." },
    { catSlug: "whisky", name: "Jack Daniel's Old No.7", price: 129.90, originalPrice: null, volume: "1L", alcohol: "40%", brand: "Jack Daniel's", stock: 25, desc: "Tennessee Whiskey americano classico." },
    { catSlug: "vodka", name: "Absolut Original", price: 69.90, originalPrice: 79.90, volume: "1L", alcohol: "40%", brand: "Absolut", stock: 40, desc: "Vodka sueca premium." },
    { catSlug: "gin", name: "Tanqueray London Dry", price: 99.90, originalPrice: 119.90, volume: "750ml", alcohol: "47.3%", brand: "Tanqueray", stock: 30, desc: "Gin ingles classico." },
    { catSlug: "cachaca", name: "Cachaca Havana", price: 24.90, originalPrice: null, volume: "700ml", alcohol: "40%", brand: "Havana", stock: 50, desc: "Cachaca classica mineira." },
    { catSlug: "rum", name: "Bacardi Carta Blanca", price: 44.90, originalPrice: null, volume: "980ml", alcohol: "37.5%", brand: "Bacardi", stock: 50, desc: "Rum branco caribenho classico." },
    { catSlug: "licores", name: "Baileys Original", price: 89.90, originalPrice: null, volume: "750ml", alcohol: "17%", brand: "Baileys", stock: 25, desc: "Licor irlandes de creme e whisky." },
    { catSlug: "sem-alcool", name: "Heineken 0.0", price: 6.90, originalPrice: null, volume: "350ml", alcohol: "0%", brand: "Heineken", stock: 80, desc: "Versao zero alcool da Heineken." },
  ];

  const allStoreProducts = {};
  // Process 4 stores at a time
  for (let batch = 0; batch < storeIds.length; batch += 4) {
    const batchEnd = Math.min(batch + 4, storeIds.length);
    const batchPromises = [];
    for (let si = batch; si < batchEnd; si++) {
      allStoreProducts[si] = [];
      const mult = 0.95 + (Math.random() * 0.10);
      for (const p of productTemplates) {
        const catId = storeCats[si][p.catSlug];
        const price = Math.round(p.price * mult * 100) / 100;
        const origPrice = p.originalPrice ? Math.round(p.originalPrice * mult * 100) / 100 : null;
        const stock = Math.max(p.stock + Math.floor(Math.random() * 20) - 10, 0);
        const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
        batchPromises.push(
          sql`INSERT INTO products (store_id, category_id, name, slug, description, price, original_price, stock_quantity, min_stock, volume, alcohol_content, brand, is_active)
              VALUES (${storeIds[si]}, ${catId}, ${p.name}, ${slug}, ${p.desc}, ${price}, ${origPrice}, ${stock}, 5, ${p.volume}, ${p.alcohol}, ${p.brand}, true)
              RETURNING id`.then((rows) => ({ si, id: rows[0].id }))
        );
      }
    }
    const results = await Promise.all(batchPromises);
    for (const r of results) {
      allStoreProducts[r.si].push(r.id);
    }
    console.log(`  Produtos: ${batchEnd}/${storeIds.length} lojas...`);
  }

  // Stock movements in batches of 4 stores
  console.log("Registrando estoque...");
  for (let batch = 0; batch < storeIds.length; batch += 4) {
    const batchEnd = Math.min(batch + 4, storeIds.length);
    const batchPromises = [];
    for (let si = batch; si < batchEnd; si++) {
      for (let pi = 0; pi < allStoreProducts[si].length; pi++) {
        batchPromises.push(
          sql`INSERT INTO stock_movements (product_id, store_id, type, quantity, reason)
              VALUES (${allStoreProducts[si][pi]}, ${storeIds[si]}, 'in', ${productTemplates[pi].stock}, 'Estoque inicial')`
        );
      }
    }
    await Promise.all(batchPromises);
  }

  console.log("=== PARTE 1 COMPLETA ===");
  console.log(`${owners.length} donos, ${customers.length} clientes, ${storeIds.length} adegas`);
  console.log(`${productTemplates.length} produtos x ${storeIds.length} lojas = ${productTemplates.length * storeIds.length} registros`);
}

seed().catch(console.error);
