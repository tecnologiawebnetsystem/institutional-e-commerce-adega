const { neon, neonConfig } = require("@neondatabase/serverless");
const crypto = require("crypto");

neonConfig.fetchConnectionCache = true;

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

  // ============================================================
  // USUARIOS - 44 donos de adega + 5 clientes
  // Senha padrao: "123456" | PIN padrao: "1234"
  // Cidades: SJC(10), Cacapava(5), Taubate(15), Tremembe(5), Pindamonhangaba(9)
  // ============================================================
  console.log("Criando usuarios...");
  const pwHash = hashPassword("123456");
  const pinHash = hashPassword("1234");

  const owners = [];
  const ownerData = [
    // --- Sao Jose dos Campos (10) ---
    { name: "Carlos Mendes", email: "carlos@adega1.com", phone: "(12) 99100-0001", city: "Sao Jose dos Campos", state: "SP", cep: "12210-000", street: "Av. Dr. Nelson D'Avila", number: "120", neighborhood: "Centro" },
    { name: "Fernanda Oliveira", email: "fernanda@adega2.com", phone: "(12) 99100-0002", city: "Sao Jose dos Campos", state: "SP", cep: "12243-000", street: "Rua Euclides Miragaia", number: "450", neighborhood: "Jardim Aquarius" },
    { name: "Roberto Silva", email: "roberto@adega3.com", phone: "(12) 99100-0003", city: "Sao Jose dos Campos", state: "SP", cep: "12220-000", street: "Av. Nove de Julho", number: "88", neighborhood: "Vila Adyana" },
    { name: "Ana Beatriz Costa", email: "ana@adega4.com", phone: "(12) 99100-0004", city: "Sao Jose dos Campos", state: "SP", cep: "12230-000", street: "Rua Rubiao Junior", number: "200", neighborhood: "Vila Ema" },
    { name: "Marcos Pereira", email: "marcos@adega5.com", phone: "(12) 99100-0005", city: "Sao Jose dos Campos", state: "SP", cep: "12245-000", street: "Av. Cassiano Ricardo", number: "601", neighborhood: "Jardim Aquarius" },
    { name: "Juliana Santos", email: "juliana@adega6.com", phone: "(12) 99100-0006", city: "Sao Jose dos Campos", state: "SP", cep: "12216-000", street: "Rua Vilaça", number: "320", neighborhood: "Centro" },
    { name: "Pedro Almeida", email: "pedro@adega7.com", phone: "(12) 99100-0007", city: "Sao Jose dos Campos", state: "SP", cep: "12235-000", street: "Av. Andrômeda", number: "750", neighborhood: "Jardim Satelite" },
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
    { name: "Vinicius Barros", email: "vinicius@adega41.com", phone: "(12) 99500-0041", city: "Pindamonhangaba", state: "SP", cep: "12405-000", street: "Rua Cel. Moreira Cesar", number: "60", neighborhood: "Mombaça" },
    { name: "Camila Andrade", email: "camila.a@adega42.com", phone: "(12) 99500-0042", city: "Pindamonhangaba", state: "SP", cep: "12406-000", street: "Av. Trabalhadores", number: "950", neighborhood: "Araretama" },
    { name: "Leonardo Guimaraes", email: "leonardo@adega43.com", phone: "(12) 99500-0043", city: "Pindamonhangaba", state: "SP", cep: "12407-000", street: "Rua Saldanha Marinho", number: "180", neighborhood: "Centro" },
    { name: "Fernanda Lima", email: "fernanda.l@adega44.com", phone: "(12) 99500-0044", city: "Pindamonhangaba", state: "SP", cep: "12408-000", street: "Rua Padre Anchieta", number: "400", neighborhood: "Santa Clara" },
  ];

  for (const o of ownerData) {
    const rows = await sql`
      INSERT INTO users (name, email, password_hash, pin_hash, role, phone, cep, street, number, neighborhood, city, state)
      VALUES (${o.name}, ${o.email}, ${pwHash}, ${pinHash}, 'owner', ${o.phone}, ${o.cep}, ${o.street}, ${o.number}, ${o.neighborhood}, ${o.city}, ${o.state})
      RETURNING id
    `;
    owners.push({ id: rows[0].id, ...o });
  }

  const customers = [];
  const customerData = [
    { name: "Joao da Silva", email: "joao@email.com", phone: "(12) 98100-1111", city: "Sao Jose dos Campos", state: "SP", cep: "12210-100", street: "Rua Paraibuna", number: "500", neighborhood: "Jardim Paulista" },
    { name: "Maria Souza", email: "maria@email.com", phone: "(12) 98200-2222", city: "Taubate", state: "SP", cep: "12020-100", street: "Rua Visconde do Rio Branco", number: "200", neighborhood: "Centro" },
    { name: "Paulo Costa", email: "paulo@email.com", phone: "(12) 98300-3333", city: "Pindamonhangaba", state: "SP", cep: "12400-100", street: "Rua Dr. Lucio Malta", number: "80", neighborhood: "Centro" },
    { name: "Camila Lima", email: "camila@email.com", phone: "(12) 98400-4444", city: "Cacapava", state: "SP", cep: "12281-100", street: "Rua Cel. Alfredo Guedes", number: "300", neighborhood: "Centro" },
    { name: "Lucas Martins", email: "lucas@email.com", phone: "(12) 98500-5555", city: "Tremembe", state: "SP", cep: "12120-100", street: "Rua Cel. Jose Benedito", number: "70", neighborhood: "Centro" },
  ];

  for (const c of customerData) {
    const rows = await sql`
      INSERT INTO users (name, email, password_hash, pin_hash, role, phone, cep, street, number, neighborhood, city, state)
      VALUES (${c.name}, ${c.email}, ${pwHash}, ${pinHash}, 'customer', ${c.phone}, ${c.cep}, ${c.street}, ${c.number}, ${c.neighborhood}, ${c.city}, ${c.state})
      RETURNING id
    `;
    customers.push({ id: rows[0].id, ...c });
  }
  console.log(`Criados ${owners.length} donos e ${customers.length} clientes.`);

  // ============================================================
  // LOJAS (ADEGAS) - 44 adegas no Vale do Paraiba
  // SJC(10), Cacapava(5), Taubate(15), Tremembe(5), Pindamonhangaba(9)
  // ============================================================
  console.log("Criando adegas...");
  const storeConfigs = [
    // --- Sao Jose dos Campos (10) ---
    { ownIdx: 0, name: "Adega do Carlos", slug: "adega-do-carlos", description: "A melhor selecao de vinhos nacionais e importados em Sao Jose dos Campos. Mais de 20 anos de experiencia no mercado de bebidas premium." },
    { ownIdx: 1, name: "Adega Aquarius", slug: "adega-aquarius", description: "Cervejas artesanais e destilados premium no Jardim Aquarius. Entrega rapida para toda SJC." },
    { ownIdx: 2, name: "Adega Villa", slug: "adega-villa", description: "Vinhos importados e nacionais na Vila Adyana. Curadoria especial para paladares exigentes." },
    { ownIdx: 3, name: "Emporio das Bebidas SJC", slug: "emporio-bebidas-sjc", description: "Destilados finos, cervejas especiais e vinhos selecionados. O melhor da Vila Ema." },
    { ownIdx: 4, name: "Adega Cassiano", slug: "adega-cassiano", description: "Localizada na Av. Cassiano Ricardo, oferecemos as melhores bebidas com entrega rapida." },
    { ownIdx: 5, name: "Bebidas Express SJC", slug: "bebidas-express-sjc", description: "Entrega rapida de cervejas, vinhos e destilados no centro de Sao Jose dos Campos." },
    { ownIdx: 6, name: "Adega Satelite", slug: "adega-satelite", description: "A adega do Jardim Satelite. Precos acessiveis e variedade para todos os gostos." },
    { ownIdx: 7, name: "Adega Premium SJC", slug: "adega-premium-sjc", description: "Vinhos premium, whiskies single malt e cervejas importadas. Sofisticacao em cada garrafa." },
    { ownIdx: 8, name: "Adega XV", slug: "adega-xv", description: "Tradicao no centro de SJC. Cachacas artesanais, vinhos e cervejas desde 2005." },
    { ownIdx: 9, name: "Adega das Industrias", slug: "adega-das-industrias", description: "Bebidas para o dia a dia e para ocasioes especiais no Jardim das Industrias." },
    // --- Cacapava (5) ---
    { ownIdx: 10, name: "Adega Cacapava", slug: "adega-cacapava", description: "A principal adega de Cacapava. Vinhos, cervejas artesanais e destilados com o melhor preco da regiao." },
    { ownIdx: 11, name: "Emporio Italia Cacapava", slug: "emporio-italia-cacapava", description: "Vinhos italianos, cervejas importadas e destilados premium no Jardim Italia." },
    { ownIdx: 12, name: "Bebidas Sao Jose", slug: "bebidas-sao-jose", description: "Cervejas geladas, vinhos acessiveis e destilados na Vila Sao Jose. Entrega rapida." },
    { ownIdx: 13, name: "Adega Central Cacapava", slug: "adega-central-cacapava", description: "No centro de Cacapava, oferecemos a melhor selecao de bebidas para sua festa." },
    { ownIdx: 14, name: "Adega Paraiso", slug: "adega-paraiso", description: "Vinhos, cervejas e destilados no Jardim Paraiso. Qualidade e bom atendimento." },
    // --- Taubate (15) ---
    { ownIdx: 15, name: "Adega Jacques Felix", slug: "adega-jacques-felix", description: "Na rua mais famosa de Taubate, oferecemos vinhos premiados e cervejas artesanais de todo o Brasil." },
    { ownIdx: 16, name: "Adega Vila Costa", slug: "adega-vila-costa", description: "Cervejas artesanais e importadas na Vila Costa. Entrega rapida em toda Taubate." },
    { ownIdx: 17, name: "Emporio do Vinho Taubate", slug: "emporio-vinho-taubate", description: "Especialistas em vinhos no centro de Taubate. Mais de 200 rotulos disponiveis." },
    { ownIdx: 18, name: "Adega Independencia", slug: "adega-independencia", description: "Bebidas premium e destilados finos na Av. Independencia. Tradacao e qualidade." },
    { ownIdx: 19, name: "Bebidas Express Taubate", slug: "bebidas-express-taubate", description: "Entrega rapida de bebidas em Taubate. Cervejas geladas na sua porta em minutos." },
    { ownIdx: 20, name: "Adega Aparecida", slug: "adega-aparecida", description: "Na Vila Aparecida, oferecemos vinhos, cervejas e destilados com precos justos." },
    { ownIdx: 21, name: "Adega Moreira de Barros", slug: "adega-moreira-barros", description: "Destilados premium e whiskies importados no centro historico de Taubate." },
    { ownIdx: 22, name: "Adega das Nacoes", slug: "adega-das-nacoes", description: "Bebidas de todo o mundo no Jardim das Nacoes. Vinhos, cervejas e licores importados." },
    { ownIdx: 23, name: "Adega Quiririm", slug: "adega-quiririm", description: "No bairro italiano de Taubate, oferecemos vinhos e grappas artesanais. Tradacao italiana." },
    { ownIdx: 24, name: "Emporio Santa Terezinha", slug: "emporio-santa-terezinha", description: "Vinhos, espumantes e cervejas artesanais na Praca Santa Terezinha. Charm e qualidade." },
    { ownIdx: 25, name: "Adega Sao Bento", slug: "adega-sao-bento", description: "Cachacas artesanais, cervejas especiais e vinhos no bairro Sao Bento de Taubate." },
    { ownIdx: 26, name: "Adega Estiva", slug: "adega-estiva", description: "Bebidas para churrascos e festas na Estiva. Precos populares e entrega gratis." },
    { ownIdx: 27, name: "Adega Imperial Taubate", slug: "adega-imperial-taubate", description: "A adega mais completa de Taubate. Vinhos, cervejas artesanais, whiskies e mais." },
    { ownIdx: 28, name: "Adega Padre Faria", slug: "adega-padre-faria", description: "Cervejas geladas e bebidas para o dia a dia na Vila Sao Jose. Atendimento amigo." },
    { ownIdx: 29, name: "Adega Urup", slug: "adega-urup", description: "Vinhos e cervejas artesanais no Parque Urup. Degustacao todo sabado." },
    // --- Tremembe (5) ---
    { ownIdx: 30, name: "Adega Tremembe", slug: "adega-tremembe", description: "A adega do centro de Tremembe. Vinhos, cervejas e destilados com otimos precos." },
    { ownIdx: 31, name: "Emporio Sao Geraldo", slug: "emporio-sao-geraldo", description: "Bebidas selecionadas na Vila Sao Geraldo. Cervejas artesanais e vinhos importados." },
    { ownIdx: 32, name: "Adega do Vale Tremembe", slug: "adega-vale-tremembe", description: "No coracao de Tremembe, a melhor selecao de bebidas do Vale do Paraiba." },
    { ownIdx: 33, name: "Bebidas Santo Antonio", slug: "bebidas-santo-antonio", description: "Cachacas artesanais, cervejas e vinhos na Vila Santo Antonio de Tremembe." },
    { ownIdx: 34, name: "Adega America Tremembe", slug: "adega-america-tremembe", description: "Cervejas importadas, vinhos e destilados no Jardim America. Entrega para toda Tremembe." },
    // --- Pindamonhangaba (9) ---
    { ownIdx: 35, name: "Adega Pinda", slug: "adega-pinda", description: "A maior adega de Pindamonhangaba. Vinhos, cervejas artesanais e destilados premium." },
    { ownIdx: 36, name: "Adega Bom Sucesso", slug: "adega-bom-sucesso", description: "Bebidas de qualidade no bairro Bom Sucesso. Entrega rapida em toda Pinda." },
    { ownIdx: 37, name: "Emporio Central Pinda", slug: "emporio-central-pinda", description: "Vinhos importados e nacionais no centro de Pindamonhangaba. Curadoria especial." },
    { ownIdx: 38, name: "Adega Bosque da Princesa", slug: "adega-bosque-princesa", description: "Cervejas artesanais e drinks prontos no Bosque da Princesa. Ambiente aconchegante." },
    { ownIdx: 39, name: "Bebidas Express Pinda", slug: "bebidas-express-pinda", description: "Entrega rapida de bebidas geladas em Pindamonhangaba. Cervejas, vinhos e mais." },
    { ownIdx: 40, name: "Adega Mombaca", slug: "adega-mombaca", description: "Destilados finos e cervejas importadas no bairro Mombaca. Qualidade garantida." },
    { ownIdx: 41, name: "Adega Araretama", slug: "adega-araretama", description: "Vinhos, espumantes e cervejas no Araretama. A adega da familia pindamonhangabense." },
    { ownIdx: 42, name: "Emporio do Vinho Pinda", slug: "emporio-vinho-pinda", description: "Mais de 150 rotulos de vinhos nacionais e importados. A referencia em vinhos de Pinda." },
    { ownIdx: 43, name: "Adega Santa Clara", slug: "adega-santa-clara", description: "Bebidas artesanais e importadas no bairro Santa Clara. Tradacao e qualidade." },
  ];

  const storeIds = [];
  for (const s of storeConfigs) {
    const own = owners[s.ownIdx];
    const rows = await sql`
      INSERT INTO stores (owner_id, name, slug, description, phone, email, cep, street, number, neighborhood, city, state, is_active)
      VALUES (${own.id}, ${s.name}, ${s.slug}, ${s.description}, ${own.phone}, ${own.email}, ${own.cep}, ${own.street}, ${own.number}, ${own.neighborhood}, ${own.city}, ${own.state}, true)
      RETURNING id
    `;
    storeIds.push(rows[0].id);
  }
  console.log(`Criadas ${storeIds.length} adegas.`);

  // ============================================================
  // CATEGORIAS - mesmas categorias para cada loja
  // ============================================================
  console.log("Criando categorias...");
  const categoryNames = [
    { name: "Vinhos Tintos", slug: "vinhos-tintos", description: "Selecao de vinhos tintos nacionais e importados" },
    { name: "Vinhos Brancos", slug: "vinhos-brancos", description: "Vinhos brancos frescos e elegantes" },
    { name: "Espumantes", slug: "espumantes", description: "Champagnes, proseccos e espumantes nacionais" },
    { name: "Cervejas Artesanais", slug: "cervejas-artesanais", description: "As melhores cervejas artesanais do Brasil" },
    { name: "Cervejas Importadas", slug: "cervejas-importadas", description: "Cervejas importadas de todo o mundo" },
    { name: "Cervejas Tradicionais", slug: "cervejas-tradicionais", description: "Cervejas tradicionais e populares" },
    { name: "Whisky", slug: "whisky", description: "Single malts, blends e bourbons" },
    { name: "Vodka", slug: "vodka", description: "Vodkas premium e artesanais" },
    { name: "Gin", slug: "gin", description: "Gins artesanais e importados" },
    { name: "Cachaca", slug: "cachaca", description: "Cachacas artesanais e envelhecidas" },
    { name: "Tequila e Mezcal", slug: "tequila-mezcal", description: "Destilados mexicanos premium" },
    { name: "Rum", slug: "rum", description: "Runs caribenhos e brasileiros" },
    { name: "Licores", slug: "licores", description: "Licores artesanais e importados" },
    { name: "Drinks Prontos", slug: "drinks-prontos", description: "Coqueteis prontos para beber" },
    { name: "Sem Alcool", slug: "sem-alcool", description: "Cervejas e bebidas sem alcool" },
  ];

  // store_id -> { slug -> catId }
  const storeCats = {};
  for (let si = 0; si < storeIds.length; si++) {
    storeCats[si] = {};
    const catPromises = categoryNames.map((cat) =>
      sql`
        INSERT INTO categories (store_id, name, slug, description)
        VALUES (${storeIds[si]}, ${cat.name}, ${cat.slug}, ${cat.description})
        RETURNING id
      `
    );
    const catResults = await Promise.all(catPromises);
    categoryNames.forEach((cat, idx) => {
      storeCats[si][cat.slug] = catResults[idx][0].id;
    });
  }
  console.log("Categorias criadas para todas as lojas.");

  // ============================================================
  // PRODUTOS - produtos reais para cada loja
  // ============================================================
  console.log("Criando produtos...");

  const productTemplates = [
    // Vinhos Tintos
    { catSlug: "vinhos-tintos", name: "Casillero del Diablo Cabernet Sauvignon", price: 49.90, originalPrice: 59.90, volume: "750ml", alcohol: "13.5%", brand: "Concha y Toro", stock: 48, desc: "Vinho tinto chileno encorpado com notas de frutas vermelhas maduras, baunilha e um toque de especiarias. Ideal para acompanhar carnes vermelhas e massas." },
    { catSlug: "vinhos-tintos", name: "Malbec Reserva Catena Zapata", price: 129.90, originalPrice: 149.90, volume: "750ml", alcohol: "14%", brand: "Catena Zapata", stock: 24, desc: "Malbec argentino de alta qualidade com aromas intensos de ameixa, chocolate e violetas. Envelhecido 12 meses em barricas de carvalho frances." },
    { catSlug: "vinhos-tintos", name: "Miolo Reserva Merlot", price: 59.90, originalPrice: null, volume: "750ml", alcohol: "13%", brand: "Miolo", stock: 36, desc: "Vinho gaúcho elegante com taninos macios e sabores de frutas negras. Excelente opcao nacional." },
    { catSlug: "vinhos-tintos", name: "Marques de Casa Concha Carmenere", price: 89.90, originalPrice: 109.90, volume: "750ml", alcohol: "14.5%", brand: "Concha y Toro", stock: 18, desc: "Carmenere premium com complexidade e elegancia. Notas de pimenta preta, chocolate amargo e frutas maduras." },
    { catSlug: "vinhos-tintos", name: "Perini Quorum Tannat", price: 39.90, originalPrice: null, volume: "750ml", alcohol: "12.5%", brand: "Perini", stock: 60, desc: "Tannat brasileiro do Rio Grande do Sul. Vinho robusto e frutado, excelente custo-beneficio." },
    // Vinhos Brancos
    { catSlug: "vinhos-brancos", name: "Cloudy Bay Sauvignon Blanc", price: 159.90, originalPrice: null, volume: "750ml", alcohol: "13%", brand: "Cloudy Bay", stock: 15, desc: "Sauvignon Blanc neozelandes fresco e vibrante com notas citricas e de maracuja. Um dos mais premiados do mundo." },
    { catSlug: "vinhos-brancos", name: "Santa Helena Reservado Chardonnay", price: 34.90, originalPrice: 42.90, volume: "750ml", alcohol: "13.5%", brand: "Santa Helena", stock: 50, desc: "Chardonnay chileno leve e frutado, com notas de abacaxi e toques de baunilha." },
    { catSlug: "vinhos-brancos", name: "Casa Valduga Leopoldina Riesling", price: 44.90, originalPrice: null, volume: "750ml", alcohol: "12%", brand: "Casa Valduga", stock: 30, desc: "Riesling brasileiro da Serra Gaucha. Fresco, aromatico e com boa acidez." },
    // Espumantes
    { catSlug: "espumantes", name: "Chandon Brut Rose", price: 89.90, originalPrice: 109.90, volume: "750ml", alcohol: "12%", brand: "Chandon", stock: 25, desc: "Espumante rose elegante com bolhas finas e persistentes. Notas de morango e framboesa." },
    { catSlug: "espumantes", name: "Salton Brut", price: 39.90, originalPrice: null, volume: "750ml", alcohol: "12.5%", brand: "Salton", stock: 45, desc: "Espumante brasileiro classico, leve e refrescante. Perfeito para celebracoes." },
    { catSlug: "espumantes", name: "Veuve Clicquot Brut", price: 499.90, originalPrice: null, volume: "750ml", alcohol: "12%", brand: "Veuve Clicquot", stock: 8, desc: "Champagne frances icônico. Elegante, complexo e com final longo e harmonioso." },
    // Cervejas Artesanais
    { catSlug: "cervejas-artesanais", name: "Colorado Appia", price: 14.90, originalPrice: null, volume: "600ml", alcohol: "5.5%", brand: "Colorado", stock: 80, desc: "Cerveja de trigo com mel de laranjeira. Refrescante e com leve doçura natural." },
    { catSlug: "cervejas-artesanais", name: "Wals Session Citra IPA", price: 12.90, originalPrice: null, volume: "355ml", alcohol: "4.7%", brand: "Wals", stock: 100, desc: "Session IPA leve e aromatica com lupulo Citra. Notas citricas e tropicais." },
    { catSlug: "cervejas-artesanais", name: "Dogma Hop Arabica Coffee Stout", price: 24.90, originalPrice: 29.90, volume: "355ml", alcohol: "7%", brand: "Dogma", stock: 40, desc: "Stout encorpada com cafe arabica brasileiro. Notas de chocolate, cafe e caramelo." },
    { catSlug: "cervejas-artesanais", name: "Bodebrown Perigosa Imperial IPA", price: 29.90, originalPrice: null, volume: "330ml", alcohol: "9.2%", brand: "Bodebrown", stock: 35, desc: "Imperial IPA intensa e lupulada. Uma das melhores IPAs brasileiras." },
    // Cervejas Importadas
    { catSlug: "cervejas-importadas", name: "Guinness Draught", price: 19.90, originalPrice: null, volume: "440ml", alcohol: "4.2%", brand: "Guinness", stock: 60, desc: "Stout irlandesa classica com espuma cremosa e sabor suave de cafe torrado." },
    { catSlug: "cervejas-importadas", name: "Hoegaarden", price: 14.90, originalPrice: null, volume: "330ml", alcohol: "4.9%", brand: "Hoegaarden", stock: 70, desc: "Witbier belga tradicional com casca de laranja e coentro. Refrescante e leve." },
    { catSlug: "cervejas-importadas", name: "Delirium Tremens", price: 39.90, originalPrice: null, volume: "330ml", alcohol: "8.5%", brand: "Huyghe Brewery", stock: 25, desc: "Belgian Strong Ale premiada mundialmente. Complexa com notas frutadas e especiadas." },
    // Cervejas Tradicionais
    { catSlug: "cervejas-tradicionais", name: "Heineken", price: 6.90, originalPrice: null, volume: "350ml", alcohol: "5%", brand: "Heineken", stock: 200, desc: "Lager holandesa puro malte conhecida mundialmente. Refrescante e equilibrada." },
    { catSlug: "cervejas-tradicionais", name: "Budweiser Long Neck", price: 5.90, originalPrice: null, volume: "343ml", alcohol: "5%", brand: "Budweiser", stock: 200, desc: "American Lager classica, leve e refrescante. A cerveja mais icônica dos EUA." },
    { catSlug: "cervejas-tradicionais", name: "Stella Artois", price: 7.90, originalPrice: null, volume: "350ml", alcohol: "5.2%", brand: "Stella Artois", stock: 180, desc: "Lager belga premium com tradicao desde 1366. Sabor suave e refinado." },
    // Whisky
    { catSlug: "whisky", name: "Johnnie Walker Black Label", price: 159.90, originalPrice: 189.90, volume: "1L", alcohol: "40%", brand: "Johnnie Walker", stock: 20, desc: "Blended Scotch Whisky 12 anos. Sabor defumado e complexo com notas de frutas secas e baunilha." },
    { catSlug: "whisky", name: "Jack Daniel's Old No.7", price: 129.90, originalPrice: null, volume: "1L", alcohol: "40%", brand: "Jack Daniel's", stock: 25, desc: "Tennessee Whiskey americano classico. Sabor suave com notas de caramelo e carvalho." },
    { catSlug: "whisky", name: "Glenfiddich 12 anos", price: 249.90, originalPrice: 289.90, volume: "750ml", alcohol: "40%", brand: "Glenfiddich", stock: 12, desc: "Single Malt escoces com notas de pera, noz-moscada e carvalho. Elegante e equilibrado." },
    { catSlug: "whisky", name: "Chivas Regal 12 anos", price: 139.90, originalPrice: null, volume: "1L", alcohol: "40%", brand: "Chivas Regal", stock: 22, desc: "Blend escoces premium com mel, baunilha e frutas maduras. Suave e harmonioso." },
    // Vodka
    { catSlug: "vodka", name: "Absolut Original", price: 69.90, originalPrice: 79.90, volume: "1L", alcohol: "40%", brand: "Absolut", stock: 40, desc: "Vodka sueca premium feita com trigo de inverno. Pura e versatil para drinks." },
    { catSlug: "vodka", name: "Grey Goose", price: 179.90, originalPrice: null, volume: "750ml", alcohol: "40%", brand: "Grey Goose", stock: 15, desc: "Vodka francesa ultra-premium destilada de trigo macio. Extremamente suave." },
    { catSlug: "vodka", name: "Smirnoff Red", price: 34.90, originalPrice: null, volume: "998ml", alcohol: "37.5%", brand: "Smirnoff", stock: 80, desc: "Vodka tri-destilada com sabor limpo e neutro. Otima para coqueteis." },
    // Gin
    { catSlug: "gin", name: "Tanqueray London Dry", price: 99.90, originalPrice: 119.90, volume: "750ml", alcohol: "47.3%", brand: "Tanqueray", stock: 30, desc: "Gin ingles classico com botanicos cuidadosamente selecionados. Perfeito para gin tonico." },
    { catSlug: "gin", name: "Hendrick's", price: 189.90, originalPrice: null, volume: "750ml", alcohol: "41.4%", brand: "Hendrick's", stock: 18, desc: "Gin escoces com infusao de pepino e petalas de rosa. Unico e aromatico." },
    { catSlug: "gin", name: "Amazzoni Gin", price: 89.90, originalPrice: null, volume: "750ml", alcohol: "42%", brand: "Amazzoni", stock: 25, desc: "Gin brasileiro com botanicos da Amazonia. Sabores unicos da floresta tropical." },
    // Cachaca
    { catSlug: "cachaca", name: "Cachaca Havana", price: 24.90, originalPrice: null, volume: "700ml", alcohol: "40%", brand: "Havana", stock: 50, desc: "Cachaca classica mineira, prata, ideal para caipirinha. Suave e encorpada." },
    { catSlug: "cachaca", name: "Weber Haus Organica Envelhecida", price: 69.90, originalPrice: null, volume: "750ml", alcohol: "40%", brand: "Weber Haus", stock: 20, desc: "Cachaca organica envelhecida em barris de carvalho. Complexa e premiada internacionalmente." },
    { catSlug: "cachaca", name: "Ypioca 160 Reserva Especial", price: 49.90, originalPrice: 59.90, volume: "750ml", alcohol: "39%", brand: "Ypioca", stock: 30, desc: "Cachaca cearense envelhecida com sabor suave e levemente adocicado." },
    // Tequila e Mezcal
    { catSlug: "tequila-mezcal", name: "Jose Cuervo Especial Gold", price: 89.90, originalPrice: null, volume: "750ml", alcohol: "38%", brand: "Jose Cuervo", stock: 25, desc: "Tequila gold mexicana classica. Equilibrada com notas de agave e carvalho." },
    { catSlug: "tequila-mezcal", name: "Patron Silver", price: 249.90, originalPrice: null, volume: "750ml", alcohol: "40%", brand: "Patron", stock: 10, desc: "Tequila premium 100% agave azul. Cristalina e ultra-suave com final citrico." },
    // Rum
    { catSlug: "rum", name: "Bacardi Carta Blanca", price: 44.90, originalPrice: null, volume: "980ml", alcohol: "37.5%", brand: "Bacardi", stock: 50, desc: "Rum branco caribenho classico. Leve e suave, perfeito para mojitos e daiquiris." },
    { catSlug: "rum", name: "Havana Club 7 Anos", price: 129.90, originalPrice: 149.90, volume: "750ml", alcohol: "40%", brand: "Havana Club", stock: 15, desc: "Rum cubano envelhecido 7 anos. Rico com notas de baunilha, tabaco e frutas tropicais." },
    // Licores
    { catSlug: "licores", name: "Baileys Original", price: 89.90, originalPrice: null, volume: "750ml", alcohol: "17%", brand: "Baileys", stock: 25, desc: "Licor irlandes de creme e whisky. Cremoso e indulgente, perfeito para sobremesas." },
    { catSlug: "licores", name: "Jagermeister", price: 79.90, originalPrice: 89.90, volume: "700ml", alcohol: "35%", brand: "Jagermeister", stock: 30, desc: "Licor alemao com 56 ervas e especiarias. Servir gelado em shots ou drinks." },
    { catSlug: "licores", name: "Amarula", price: 69.90, originalPrice: null, volume: "750ml", alcohol: "17%", brand: "Amarula", stock: 35, desc: "Licor de creme sul-africano feito com frutas marula. Exotico e suave." },
    // Drinks Prontos
    { catSlug: "drinks-prontos", name: "Easy Booze Gin Tonico Lata", price: 9.90, originalPrice: null, volume: "269ml", alcohol: "7.5%", brand: "Easy Booze", stock: 120, desc: "Gin tonico pronto em lata. Pratico e refrescante com botanicos naturais." },
    { catSlug: "drinks-prontos", name: "Mike's Hard Lemonade", price: 8.90, originalPrice: null, volume: "275ml", alcohol: "5%", brand: "Mike's", stock: 100, desc: "Limonada alcoolica pronta. Doce, refrescante e perfeita para o verao." },
    // Sem Alcool
    { catSlug: "sem-alcool", name: "Heineken 0.0", price: 6.90, originalPrice: null, volume: "350ml", alcohol: "0%", brand: "Heineken", stock: 80, desc: "Versao zero alcool da famosa Heineken. Mesmo sabor refrescante sem alcool." },
    { catSlug: "sem-alcool", name: "Budweiser Zero", price: 5.90, originalPrice: null, volume: "350ml", alcohol: "0%", brand: "Budweiser", stock: 70, desc: "Cerveja zero alcool da Budweiser. Leve e refrescante para qualquer momento." },
  ];

  // Insert products for each store with slight price variation (batched per store)
  const allStoreProducts = {}; // storeIdx -> array of product ids
  for (let si = 0; si < storeIds.length; si++) {
    allStoreProducts[si] = [];
    const priceMultiplier = 0.95 + (Math.random() * 0.10); // 0.95 to 1.05
    const productPromises = productTemplates.map((p) => {
      const catId = storeCats[si][p.catSlug];
      const price = Math.round(p.price * priceMultiplier * 100) / 100;
      const origPrice = p.originalPrice ? Math.round(p.originalPrice * priceMultiplier * 100) / 100 : null;
      const stock = p.stock + Math.floor(Math.random() * 20) - 10;
      return sql`
        INSERT INTO products (store_id, category_id, name, slug, description, price, original_price, stock_quantity, min_stock, volume, alcohol_content, brand, is_active)
        VALUES (${storeIds[si]}, ${catId}, ${p.name}, ${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/,'')}, ${p.desc}, ${price}, ${origPrice}, ${Math.max(stock, 0)}, 5, ${p.volume}, ${p.alcohol}, ${p.brand}, true)
        RETURNING id
      `;
    });
    const results = await Promise.all(productPromises);
    for (const rows of results) {
      allStoreProducts[si].push(rows[0].id);
    }
    if ((si + 1) % 10 === 0) console.log(`  Produtos: ${si + 1}/${storeIds.length} lojas...`);
  }
  console.log(`Criados ${productTemplates.length} produtos x ${storeIds.length} lojas = ${productTemplates.length * storeIds.length} registros.`);

  // ============================================================
  // ESTOQUE - movimentacoes iniciais (entrada de cada produto)
  // ============================================================
  console.log("Registrando movimentacoes de estoque...");
  for (let si = 0; si < storeIds.length; si++) {
    const stockPromises = allStoreProducts[si].map((prodId, pi) =>
      sql`
        INSERT INTO stock_movements (product_id, store_id, type, quantity, reason)
        VALUES (${prodId}, ${storeIds[si]}, 'in', ${productTemplates[pi].stock}, 'Estoque inicial')
      `
    );
    await Promise.all(stockPromises);
  }

  // ============================================================
  // PROMOCOES - 2 por loja
  // ============================================================
  console.log("Criando promocoes...");
  for (let si = 0; si < storeIds.length; si++) {
    const promo1 = await sql`
      INSERT INTO promotions (store_id, name, description, discount_type, discount_value, start_date, end_date, is_active)
      VALUES (${storeIds[si]}, 'Esquenta de Verao', 'Desconto especial em cervejas artesanais para o verao', 'percentage', 15, NOW(), NOW() + INTERVAL '30 days', true)
      RETURNING id
    `;
    // Link first 3 beer products
    const beerProducts = allStoreProducts[si].slice(11, 14);
    for (const bpId of beerProducts) {
      await sql`INSERT INTO promotion_products (promotion_id, product_id) VALUES (${promo1[0].id}, ${bpId})`;
    }

    const promo2 = await sql`
      INSERT INTO promotions (store_id, name, description, discount_type, discount_value, start_date, end_date, is_active)
      VALUES (${storeIds[si]}, 'Festival de Vinhos', 'Descontos imperdíveis em vinhos selecionados', 'fixed', 10, NOW(), NOW() + INTERVAL '15 days', true)
      RETURNING id
    `;
    const wineProducts = allStoreProducts[si].slice(0, 3);
    for (const wpId of wineProducts) {
      await sql`INSERT INTO promotion_products (promotion_id, product_id) VALUES (${promo2[0].id}, ${wpId})`;
    }
  }

  // ============================================================
  // COMBOS - 1 por loja
  // ============================================================
  console.log("Criando combos...");
  for (let si = 0; si < storeIds.length; si++) {
    const combo = await sql`
      INSERT INTO combos (store_id, name, description, combo_price, original_price, is_active)
      VALUES (${storeIds[si]}, 'Combo Churrasco', 'Pack perfeito para churrasco: 2 cervejas artesanais + 1 vinho tinto', 69.90, 89.70, true)
      RETURNING id
    `;
    await sql`INSERT INTO combo_items (combo_id, product_id, quantity) VALUES (${combo[0].id}, ${allStoreProducts[si][11]}, 2)`;
    await sql`INSERT INTO combo_items (combo_id, product_id, quantity) VALUES (${combo[0].id}, ${allStoreProducts[si][0]}, 1)`;
  }

  // ============================================================
  // CUPONS - 2 por loja
  // ============================================================
  console.log("Criando cupons...");
  for (let si = 0; si < storeIds.length; si++) {
    const prefix = storeConfigs[si].slug.split("-").pop().toUpperCase().slice(0, 4) + (si + 1);
    await sql`
      INSERT INTO coupons (store_id, code, description, discount_type, discount_value, min_purchase, max_uses, start_date, end_date, is_active)
      VALUES (${storeIds[si]}, ${prefix + '10OFF'}, 'Cupom de 10% de desconto', 'percentage', 10, 50, 100, NOW(), NOW() + INTERVAL '60 days', true)
    `;
    await sql`
      INSERT INTO coupons (store_id, code, description, discount_type, discount_value, min_purchase, max_uses, start_date, end_date, is_active)
      VALUES (${storeIds[si]}, ${prefix + '20REAIS'}, 'Cupom de R$20 de desconto', 'fixed', 20, 100, 50, NOW(), NOW() + INTERVAL '30 days', true)
    `;
  }

  // ============================================================
  // PEDIDOS - 3 pedidos por loja (de clientes diferentes)
  // ============================================================
  console.log("Criando pedidos...");
  const statuses = ['pending', 'confirmed', 'delivered'];
  let orderNum = 1000;
  for (let si = 0; si < storeIds.length; si++) {
    for (let ci = 0; ci < 3; ci++) {
      const cust = customers[ci % customers.length];
      const prodIdx1 = Math.floor(Math.random() * allStoreProducts[si].length);
      const prodIdx2 = (prodIdx1 + 5) % allStoreProducts[si].length;
      const qty1 = 1 + Math.floor(Math.random() * 3);
      const qty2 = 1 + Math.floor(Math.random() * 2);
      const price1 = productTemplates[prodIdx1].price;
      const price2 = productTemplates[prodIdx2].price;
      const subtotal = Math.round((price1 * qty1 + price2 * qty2) * 100) / 100;
      const total = subtotal;
      orderNum++;

      const ord = await sql`
        INSERT INTO orders (order_number, customer_id, store_id, status, subtotal, discount, total, delivery_address, notes)
        VALUES (${'PED-' + orderNum}, ${cust.id}, ${storeIds[si]}, ${statuses[ci]}, ${subtotal}, 0, ${total}, ${cust.street + ', ' + cust.number + ' - ' + cust.neighborhood + ', ' + cust.city + '/' + cust.state}, NULL)
        RETURNING id
      `;

      await sql`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
        VALUES (${ord[0].id}, ${allStoreProducts[si][prodIdx1]}, ${productTemplates[prodIdx1].name}, ${qty1}, ${price1}, ${Math.round(price1 * qty1 * 100) / 100})
      `;
      await sql`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
        VALUES (${ord[0].id}, ${allStoreProducts[si][prodIdx2]}, ${productTemplates[prodIdx2].name}, ${qty2}, ${price2}, ${Math.round(price2 * qty2 * 100) / 100})
      `;

      // Add receivable for delivered orders
      if (statuses[ci] === 'delivered') {
        await sql`
          INSERT INTO accounts_receivable (store_id, order_id, description, amount, due_date, received_date, status, category)
          VALUES (${storeIds[si]}, ${ord[0].id}, ${'Pedido PED-' + orderNum}, ${total}, CURRENT_DATE, CURRENT_DATE, 'received', 'Vendas')
        `;
      } else {
        await sql`
          INSERT INTO accounts_receivable (store_id, order_id, description, amount, due_date, status, category)
          VALUES (${storeIds[si]}, ${ord[0].id}, ${'Pedido PED-' + orderNum}, ${total}, CURRENT_DATE + INTERVAL '7 days', 'pending', 'Vendas')
        `;
      }
    }

    // Contas a pagar para cada loja
    await sql`
      INSERT INTO accounts_payable (store_id, description, amount, due_date, status, category)
      VALUES (${storeIds[si]}, 'Fornecedor de Vinhos - Nota Fiscal 001', 2500.00, CURRENT_DATE + INTERVAL '15 days', 'pending', 'Fornecedores')
    `;
    await sql`
      INSERT INTO accounts_payable (store_id, description, amount, due_date, paid_date, status, category)
      VALUES (${storeIds[si]}, 'Aluguel do espaco', 3200.00, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '5 days', 'paid', 'Aluguel')
    `;
    await sql`
      INSERT INTO accounts_payable (store_id, description, amount, due_date, status, category)
      VALUES (${storeIds[si]}, 'Conta de energia', 450.00, CURRENT_DATE + INTERVAL '10 days', 'pending', 'Utilidades')
    `;
  }

  // ============================================================
  // BLOG POSTS - 20 artigos completos
  // ============================================================
  console.log("Criando blog posts...");
  await sql`DELETE FROM blog_posts`;

  const blogs = [
    { title: "Os 10 Melhores Vinhos Tintos para Iniciantes", slug: "melhores-vinhos-tintos-iniciantes", excerpt: "Descubra os vinhos tintos mais acessiveis e saborosos para quem esta comecando no mundo dos vinhos.", content: "Se voce esta comecando a explorar o mundo dos vinhos, os tintos sao uma otima porta de entrada. Aqui estao nossas recomendacoes dos 10 melhores vinhos tintos para iniciantes.\n\n1. Casillero del Diablo Cabernet Sauvignon - Chile\nUm classico que nunca decepciona. Encorpado com notas de frutas vermelhas e baunilha.\n\n2. Malbec Trapiche - Argentina\nMalbec acessivel com taninos macios e sabor frutado.\n\n3. Perini Quorum Tannat - Brasil\nOpcao nacional excelente da Serra Gaucha.\n\n4. Santa Helena Reservado Carmenere - Chile\nCarmenere suave com notas de pimenta e chocolate.\n\n5. Concha y Toro Trio Merlot - Chile\nMerlot elegante e facil de beber.\n\n6. Norton Reserva Malbec - Argentina\nMalbec mais estruturado para quem quer evoluir.\n\n7. Miolo Reserva Merlot - Brasil\nOutra otima opcao brasileira com taninos macios.\n\n8. Yellow Tail Shiraz - Australia\nShiraz frutado e acessivel da Australia.\n\n9. Campo Viejo Tempranillo - Espanha\nTempranillo espanhol classico e versatil.\n\n10. Marques de Casa Concha Carmenere - Chile\nPara quando voce quiser investir um pouco mais.\n\nDica final: experimente cada vinho com diferentes alimentos para descobrir suas harmonizacoes favoritas!", tags: ["vinhos", "iniciantes", "tintos"], image_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800" },
    { title: "Como Montar o Combo Perfeito para Churrasco", slug: "combo-perfeito-churrasco", excerpt: "Cerveja, vinho ou destilado? Saiba como escolher as bebidas ideais para acompanhar seu churrasco.", content: "Churrasco e bebida boa sao uma combinacao que todo brasileiro ama. Vamos te ajudar a montar o combo perfeito.\n\nPara o Pre-Churrasco:\n- Cervejas leves como Pilsner e Lager geladas\n- Drinks refrescantes como Gin Tonico ou Aperol Spritz\n\nDurante o Churrasco:\n- Cervejas artesanais IPA para carnes mais temperadas\n- Vinho tinto Malbec ou Cabernet para picanha e costela\n- Cerveja Weiss para linguica e frango\n\nPara a Sobremesa:\n- Espumante Moscatel com frutas\n- Licor de chocolate\n\nQuantidade por pessoa (evento de 4h):\n- Cerveja: 5 a 7 latas/garrafas\n- Vinho: 1/2 garrafa por pessoa\n- Destilados: 200ml por pessoa\n\nDica de ouro: sempre tenha opcoes sem alcool disponiveis para quem nao bebe!", tags: ["churrasco", "combos", "cerveja", "dicas"], image_url: "https://images.unsplash.com/photo-1555658636-6e4a36218be7?w=800" },
    { title: "Guia Completo de Cervejas Artesanais Brasileiras", slug: "guia-cervejas-artesanais", excerpt: "Tudo que voce precisa saber sobre cervejas artesanais: estilos, sabores e como escolher.", content: "O mercado de cervejas artesanais no Brasil explodiu nos ultimos anos. Conheca os principais estilos:\n\nIPA (India Pale Ale):\nAmargor pronunciado e aromas citricos/tropicais. Marcas: Wals Session Citra, Bodebrown Perigosa.\n\nStout/Porter:\nEscuras com notas de cafe e chocolate. Marcas: Dogma Hop Arabica, Colorado Demoiselle.\n\nWeiss/Witbier:\nCervejas de trigo leves e refrescantes. Marcas: Colorado Appia, Eisenbahn Weiss.\n\nPilsner Artesanal:\nVersao premium da classica Pilsen. Marcas: Bamberg Pilsner, DaDo Bier Lager.\n\nSour/Azeda:\nCervejas acidas e complexas. Marcas: Way Beer Sour Me Not, Wals Berliner.\n\nComo Degustar:\n1. Sirva na temperatura correta (4-8°C para leves, 8-12°C para escuras)\n2. Use o copo adequado ao estilo\n3. Observe a cor, espuma e aroma antes de provar\n4. Beba em pequenos goles para sentir todos os sabores", tags: ["cerveja", "artesanal", "guia", "brasil"], image_url: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800" },
    { title: "5 Drinks Faceis para Fazer em Casa", slug: "drinks-faceis-casa", excerpt: "Aprenda a preparar 5 drinks deliciosos com ingredientes simples que voce encontra em qualquer adega.", content: "Nao precisa ser barman para fazer drinks incriveis em casa!\n\n1. GIN TONICO CLASSICO\n- 50ml de gin\n- 150ml de agua tonico\n- Gelo, rodela de limao e alecrim\nMisture o gin com gelo, complete com tonico e decore.\n\n2. MOSCOW MULE\n- 50ml de vodka\n- 20ml de suco de limao\n- 150ml de ginger beer\nMisture tudo em uma caneca de cobre com gelo.\n\n3. APEROL SPRITZ\n- 90ml de Prosecco\n- 60ml de Aperol\n- 30ml de agua com gas\nSirva em taca de vinho com gelo e rodela de laranja.\n\n4. CAIPIRINHA PERFEITA\n- 50ml de cachaca\n- 1 limao cortado\n- 2 colheres de acucar\nMacere o limao com acucar e adicione cachaca e gelo.\n\n5. WHISKY SOUR\n- 60ml de whisky\n- 30ml de suco de limao\n- 15ml de xarope simples\n- Clara de ovo (opcional)\nAgite tudo com gelo e coe para um copo.", tags: ["drinks", "receitas", "casa", "facil"], image_url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800" },
    { title: "Whisky: Como Escolher e Apreciar", slug: "whisky-como-escolher-apreciar", excerpt: "Do single malt ao blended, aprenda a escolher o whisky ideal para cada ocasiao.", content: "O mundo do whisky e vasto e fascinante. Aqui esta seu guia completo.\n\nTipos de Whisky:\n\nSingle Malt Scotch:\nFeito de cevada maltada em uma unica destilaria. Exemplos: Glenfiddich, Macallan, Glenlivet.\n\nBlended Scotch:\nMistura de single malts e grain whiskies. Exemplos: Johnnie Walker, Chivas Regal, Ballantines.\n\nBourbon:\nWhisky americano feito com milho. Exemplos: Jack Daniel's, Makers Mark, Woodford Reserve.\n\nIrish Whiskey:\nTri-destilado e suave. Exemplos: Jameson, Tullamore Dew, Bushmills.\n\nComo Apreciar:\n1. Use um copo tulipa ou Glencairn\n2. Adicione algumas gotas de agua para liberar aromas\n3. Cheire antes de beber\n4. Beba em pequenos goles\n5. Perceba as notas: frutado, floral, defumado, amadeirado\n\nPara iniciantes, comece com blends como Johnnie Walker Red ou Chivas 12.", tags: ["whisky", "destilados", "guia", "degustacao"], image_url: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=800" },
    { title: "Harmonizacao de Vinhos e Queijos", slug: "harmonizacao-vinhos-queijos", excerpt: "Descubra as melhores combinacoes de vinhos e queijos para impressionar em qualquer ocasiao.", content: "A harmonizacao de vinhos e queijos e uma arte. Aqui estao as combinacoes classicas:\n\nQueijos Frescos (Minas, Ricota, Cottage):\n- Sauvignon Blanc\n- Espumante Brut\n- Rose\n\nQueijos Meia-Cura (Gruyere, Gouda jovem):\n- Chardonnay\n- Merlot leve\n- Pinot Noir\n\nQueijos Curados (Parmesao, Pecorino, Cheddar):\n- Cabernet Sauvignon\n- Malbec\n- Tannat\n\nQueijos Azuis (Gorgonzola, Roquefort):\n- Vinho do Porto\n- Sauternes\n- Moscatel\n\nQueijos de Cabra:\n- Sauvignon Blanc (combinacao classica!)\n- Chenin Blanc\n\nRegra geral: vinhos brancos com queijos leves, tintos com queijos fortes. Mas nao tenha medo de experimentar!", tags: ["vinhos", "queijos", "harmonizacao", "gastronomia"], image_url: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800" },
    { title: "Tendencias de Bebidas para 2026", slug: "tendencias-bebidas-2026", excerpt: "Confira as principais tendencias no mercado de bebidas para este ano.", content: "O mercado de bebidas esta sempre em evolucao. Confira o que esta em alta em 2026:\n\n1. LOW & NO ALCOHOL\nBebidas com baixo ou zero alcool continuam crescendo. Cervejas 0.0 e spirits sem alcool estao cada vez melhores.\n\n2. CACHACAS PREMIUM\nCachacas artesanais envelhecidas em madeiras brasileiras ganham reconhecimento mundial.\n\n3. HARD SELTZER\nAguas gaseificadas alcoolicas com sabores naturais conquistam o publico jovem.\n\n4. GIN BRASILEIRO\nGins com botanicos da Amazonia e do Cerrado brasileiro.\n\n5. VINHOS NATURAIS\nVinhos com minima intervencao, sem aditivos quimicos.\n\n6. DRINKS PRONTOS PREMIUM\nCoqueteis em lata com ingredientes de qualidade.\n\n7. CERVEJAS SOUR\nCervejas acidas e frutadas continuam em alta.\n\n8. SUSTENTABILIDADE\nEmbalagens ecologicas e producao sustentavel sao prioridade.\n\nA tendencia e clara: qualidade, autenticidade e consciencia ambiental.", tags: ["tendencias", "mercado", "2026", "inovacao"], image_url: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800" },
    { title: "Como Armazenar Suas Bebidas Corretamente", slug: "armazenar-bebidas-corretamente", excerpt: "Temperatura, luminosidade e posicao: aprenda a conservar suas bebidas da forma ideal.", content: "Armazenar bebidas corretamente e essencial para manter sua qualidade.\n\nVINHOS:\n- Temperatura: 12-16°C para tintos, 8-12°C para brancos\n- Posicao: deitado (para manter a rolha umida)\n- Evite luz solar direta e vibracoes\n- Umidade ideal: 60-70%\n\nCERVEJAS:\n- Temperatura: 2-8°C na geladeira\n- Posicao: em pe\n- Artesanais lupuladas: consumir frescas (ate 3 meses)\n- Stouts e cervejas fortes: podem envelhecer ate 5 anos\n\nDESTILADOS:\n- Temperatura ambiente (15-25°C)\n- Posicao: em pe (o alcool pode danificar a rolha)\n- Longe da luz solar\n- Depois de aberto, consumir em ate 1 ano para melhor sabor\n\nESPUMANTES:\n- Temperatura: 6-8°C\n- Na geladeira, deitado\n- Consumir em ate 2 anos (nao sao para envelhecer)\n\nDica geral: nunca armazene bebidas na cozinha (calor do fogao) ou no banheiro (umidade).", tags: ["armazenamento", "dicas", "conservacao"], image_url: "https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=800" },
    { title: "Os Melhores Espumantes para Celebrar", slug: "melhores-espumantes-celebrar", excerpt: "De champagne a prosecco, descubra os espumantes ideais para cada celebracao.", content: "Toda celebracao merece um bom espumante!\n\nCATEGORIAS:\n\nChampagne (Franca):\nO rei dos espumantes. Veuve Clicquot, Moet Chandon, Dom Perignon.\nPreco: R$300 a R$2000+\n\nCava (Espanha):\nOtimo custo-beneficio. Freixenet, Codorniu.\nPreco: R$50 a R$150\n\nProsecco (Italia):\nLeve e frutado. Ideal para Aperol Spritz.\nPreco: R$60 a R$200\n\nEspumante Brasileiro:\nQualidade excepcional. Salton, Chandon Brasil, Casa Valduga.\nPreco: R$30 a R$150\n\nPARA CADA OCASIAO:\n- Aniversario: Chandon Brut\n- Ano Novo: Veuve Clicquot\n- Casamento: Moet Imperial\n- Brunch: Prosecco\n- Dia a dia: Salton Brut\n\nCOMO SERVIR:\n- Temperatura: 6-8°C\n- Taca tipo flute ou coupe\n- Nunca gire a rolha, gire a garrafa\n- Sirva devagar pela lateral da taca", tags: ["espumantes", "celebracao", "champagne", "guia"], image_url: "https://images.unsplash.com/photo-1549934151-70e269ff5765?w=800" },
    { title: "Receitas de Coqueteis Tropicais", slug: "receitas-coqueteis-tropicais", excerpt: "Sabores do Brasil em coqueteis refrescantes perfeitos para o verao.", content: "O Brasil e conhecido por suas frutas tropicais incriveis. Transforme-as em drinks!\n\nCAIPIRINHA DE MARACUJA\n- 50ml cachaca\n- 1/2 maracuja\n- 2 colheres acucar\n- Gelo picado\n\nBATIDA DE COCO\n- 50ml cachaca\n- 100ml leite de coco\n- 30ml leite condensado\n- Gelo\n\nMOJITO TROPICAL\n- 50ml rum branco\n- Folhas de hortela\n- Suco de abacaxi\n- Agua com gas\n- Gelo\n\nGIN DO CERRADO\n- 50ml gin brasileiro\n- Suco de caju\n- Tonico\n- Fatias de carambola\n\nSPRITZ DE MANGA\n- 90ml espumante\n- 60ml suco de manga\n- 30ml agua com gas\n- Gelo\n\nTodas as receitas servem 1 pessoa. Para festas, multiplique pela quantidade de convidados!", tags: ["coqueteis", "tropical", "verao", "receitas"], image_url: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800" },
    { title: "Cachaca: O Destilado Mais Brasileiro", slug: "cachaca-destilado-brasileiro", excerpt: "Conheca a historia e os segredos da cachaca, o destilado mais brasileiro que existe.", content: "A cachaca e mais do que o ingrediente da caipirinha. E patrimonio cultural brasileiro!\n\nHISTORIA:\nProduzida no Brasil desde o seculo XVI, a cachaca e o destilado mais antigo das Americas.\n\nTIPOS:\n\nBranca/Prata:\nNao envelhece em madeira. Ideal para caipirinha.\nExemplos: Havana, 51, Velho Barreiro.\n\nOuro/Envelhecida:\nDescansa em barris de madeira. Para beber pura.\nExemplos: Weber Haus, Anisio Santiago, Havana Extra.\n\nPremium:\nEnvelhecida em madeiras especiais brasileiras (amburana, balsamo, jequitiba).\nExemplos: Yaguara, Leblon, Avua.\n\nREGIOES PRODUTORAS:\n- Minas Gerais: maior produtor, cachacas de alambique\n- Sao Paulo: producao industrial e artesanal\n- Ceara: Ypioca e tradicao nordestina\n- Rio Grande do Sul: Weber Haus organica\n\nCOMO DEGUSTAR:\n1. Use um copo tulipa\n2. Observe a cor (quanto mais escura, mais envelhecida)\n3. Cheire os aromas\n4. Beba em pequenos goles\n5. Perceba as notas da madeira", tags: ["cachaca", "destilados", "brasil", "historia"], image_url: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800" },
    { title: "Gin Tonico: A Arte do Drink Perfeito", slug: "gin-tonico-arte-drink-perfeito", excerpt: "Aprenda os segredos para preparar o gin tonico perfeito com botanicos e especiarias.", content: "O gin tonico e simples, mas a perfeicao esta nos detalhes.\n\nA PROPORCAO PERFEITA:\n1 parte de gin para 2-3 partes de tonico.\n\nOS MELHORES GINS:\n- Tanqueray: classico e intenso\n- Hendricks: pepino e rosa\n- Amazzoni: botanicos amazonicos\n- Monkey 47: complexo com 47 botanicos\n\nAS MELHORES TONICAS:\n- Schweppes: classica e acessivel\n- Fever-Tree: premium e delicada\n- Wewi: brasileira e natural\n\nBOTANICOS PARA INCREMENTAR:\n- Alecrim + limao siciliano\n- Pepino + hortela\n- Pimenta rosa + laranja\n- Canela + maca\n- Gengibre + cardamomo\n\nPASSO A PASSO:\n1. Gele a taca com cubos grandes\n2. Adicione 50ml de gin\n3. Complete com 150ml de tonico pela lateral\n4. Mexa delicadamente (1 vez)\n5. Adicione os botanicos\n6. Nao mexa mais!\n\nO gelo grande e fundamental: derrete menos e dilui menos o drink.", tags: ["gin", "drinks", "receitas", "botanicos"], image_url: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800" },
    { title: "Cervejas para Cada Estacao do Ano", slug: "cervejas-cada-estacao", excerpt: "Descubra quais estilos de cerveja combinam melhor com cada estacao.", content: "Cada estacao pede um estilo diferente de cerveja.\n\nVERAO (Dezembro-Fevereiro):\n- Pilsner e Lager: geladas e refrescantes\n- Witbier: leve com notas citricas\n- Session IPA: lupulada mas leve\n- Berliner Weisse: acida e refrescante\nTemperatura: 2-4°C\n\nOUTONO (Marco-Maio):\n- Marzen/Oktoberfest: maltada e equilibrada\n- Amber Ale: caramelo e equilibrio\n- Brown Ale: notas de nozes e chocolate\nTemperatura: 4-8°C\n\nINVERNO (Junho-Agosto):\n- Stout: cafe e chocolate\n- Porter: encorpada e aquecedora\n- Barleywine: forte e complexa\n- Imperial Stout: potente e rica\nTemperatura: 8-12°C\n\nPRIMAVERA (Setembro-Novembro):\n- Pale Ale: equilibrada e floral\n- Saison: complexa e refrescante\n- Kolsch: leve e elegante\nTemperatura: 4-6°C", tags: ["cerveja", "estacoes", "dicas", "harmonizacao"], image_url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800" },
    { title: "Como Organizar uma Degustacao em Casa", slug: "organizar-degustacao-casa", excerpt: "Dicas praticas para organizar uma degustacao de vinhos ou cervejas na sua casa.", content: "Organizar uma degustacao em casa e mais facil do que voce imagina!\n\nPLANEJAMENTO:\n- Convide 6-10 pessoas\n- Escolha 5-8 bebidas do mesmo tipo\n- Prepare fichas de avaliacao\n- Tenha agua e biscoitos cream cracker para limpar o paladar\n\nDEGUSTACAO DE VINHOS:\n1. Comece pelos brancos, depois tintos\n2. Do mais leve ao mais encorpado\n3. Avalie: cor, aroma, sabor, final\n4. Sirva 50ml por vinho por pessoa\n5. Temperatura correta!\n\nDEGUSTACAO DE CERVEJAS:\n1. Comece pelas mais leves (Lager, Pilsner)\n2. Avance para as mais fortes (IPA, Stout)\n3. Sirva 100-150ml por cerveja\n4. Use copos transparentes\n\nDEGUSTACAO AS CEGAS:\nCubra as garrafas com papel aluminio para uma experiencia mais divertida e imparcial!\n\nACOMPANHAMENTOS:\n- Queijos variados\n- Embutidos\n- Frutas secas\n- Chocolates (para vinhos tintos)", tags: ["degustacao", "eventos", "dicas", "casa"], image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800" },
    { title: "Bebidas Zero Alcool: A Nova Tendencia", slug: "bebidas-zero-alcool-tendencia", excerpt: "Conheca as melhores opcoes de bebidas sem alcool que estao conquistando o mercado.", content: "O mercado de bebidas zero alcool esta em plena expansao no Brasil.\n\nPOR QUE ZERO ALCOOL?\n- Saude e bem-estar\n- Dirigir com seguranca\n- Gravidez\n- Opcao social sem pressao\n- Menos calorias\n\nMELHORES CERVEJAS 0.0:\n1. Heineken 0.0 - A mais popular, sabor proximo da original\n2. Budweiser Zero - Leve e refrescante\n3. Brahma 0.0 - Opcao nacional acessivel\n4. Erdinger Alkoholfrei - Weiss alema sem alcool\n5. Athletic Brewing - Craft beer americana 0.0\n\nGIN SEM ALCOOL:\n- Seedlip - Pioneiro em destilados sem alcool\n- Lyre's - Replica de diversos destilados\n\nVINHOS DESALCOOLIZADOS:\n- Natureo Torres - Branco espanhol\n- Carl Jung - Alemanha\n\nDRINKS MOCKTAILS:\n- Virgin Mojito\n- Shirley Temple\n- Virgin Pina Colada\n\nA qualidade das bebidas sem alcool melhorou drasticamente nos ultimos anos. Vale a pena experimentar!", tags: ["zero-alcool", "tendencias", "saudavel", "alternativas"], image_url: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800" },
    { title: "Tequila e Mezcal: Diferencas e Como Apreciar", slug: "tequila-mezcal-diferencas", excerpt: "Entenda as diferencas entre tequila e mezcal e aprenda a apreciar esses destilados mexicanos.", content: "Tequila e mezcal sao destilados mexicanos irmaos, mas com personalidades bem diferentes.\n\nTEQUILA:\n- Feita APENAS de agave azul\n- Produzida em Jalisco (principalmente)\n- Sabor mais limpo e suave\n- Tipos: Blanco, Reposado, Anejo, Extra Anejo\n\nMEZCAL:\n- Feita de qualquer tipo de agave (30+ variedades)\n- Produzida em Oaxaca (principalmente)\n- Defumada (o agave e assado em fornos subterraneos)\n- Sabor mais complexo e rustico\n\nCOMO BEBER:\n- Nunca com sal e limao (isso e para tequilas ruins)\n- Em copo tipo mezcalero ou shot glass largo\n- Temperature ambiente\n- Laranja com sal de minhoca (para mezcal)\n\nMARCAS RECOMENDADAS:\nTequila: Patron, Don Julio, Herradura, Jose Cuervo Tradicional\nMezcal: Del Maguey, Montelobos, Ilegal, Banhez\n\nDRINKS:\n- Margarita (tequila + Cointreau + limao)\n- Paloma (tequila + grapefruit soda)\n- Mezcal Negroni (mezcal + Campari + vermute)", tags: ["tequila", "mezcal", "destilados", "mexico"], image_url: "https://images.unsplash.com/photo-1516535794938-6063878f08cc?w=800" },
    { title: "Sake: O Guia Definitivo", slug: "sake-guia-definitivo", excerpt: "Tudo sobre sake: tipos, como servir e harmonizar com comida japonesa e brasileira.", content: "O sake e uma bebida milenar que esta ganhando espaco no Brasil.\n\nO QUE E SAKE?\nBebida japonesa fermentada a partir de arroz, agua, koji e levedura. NAO e um destilado.\n\nTIPOS:\n- Junmai: arroz puro, sem alcool adicionado. Sabor rico.\n- Ginjo: arroz polido 40%+. Aromatico e elegante.\n- Daiginjo: arroz polido 50%+. Premium e refinado.\n- Honjozo: com pequena adicao de alcool. Leve.\n- Nigori: nao filtrado, leitoso e cremoso.\n\nCOMO SERVIR:\n- Frio (5-10°C): ginjo e daiginjo\n- Ambiente: junmai\n- Quente (40-55°C): honjozo e junmai basico\n\nHARMONIZACAO:\n- Sashimi: Daiginjo\n- Tempura: Junmai\n- Yakitori: Honjozo quente\n- Churrasco brasileiro: Junmai robusto\n- Queijos: Nigori\n\nNo Brasil, encontre em adegas especializadas. Marcas acessiveis: Gekkeikan, Azuma Kirin, Hakutsuru.", tags: ["sake", "japones", "guia", "harmonizacao"], image_url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800" },
    { title: "Licores Artesanais: Sabores Unicos do Brasil", slug: "licores-artesanais-sabores-unicos", excerpt: "Descubra o mundo dos licores artesanais brasileiros e seus sabores surpreendentes.", content: "Os licores artesanais brasileiros estao ganhando o mundo!\n\nSABORES POPULARES:\n- Amendoim: classico nordestino\n- Jenipapo: fruta do cerrado\n- Tamarindo: doce e acido\n- Umbu: sabor unico do sertao\n- Acai: Amazonia em forma de licor\n- Jabuticaba: fruta brasileira por excelencia\n- Cumaru: baunilha do cerrado\n- Pequi: sabor marcante de Goias\n\nREGIOES PRODUTORAS:\n- Minas Gerais: licores de frutas tradicionais\n- Bahia: amendoim, jenipapo, cacau\n- Amazonia: acai, cupuacu, guarana\n- Rio Grande do Sul: amora, butiá\n\nCOMO APRECIAR:\n- Puro, gelado, em copo pequeno (30ml)\n- Com gelo\n- Como ingrediente de drinks\n- Sobre sorvete ou sobremesas\n\nDICAS DE COMPRA:\n- Prefira artesanais a industriais\n- Verifique se usa frutas naturais\n- Licores com maior teor de fruta sao melhores\n- Guarde na geladeira apos abrir", tags: ["licores", "artesanal", "brasil", "frutas"], image_url: "https://images.unsplash.com/photo-1609951651556-5334e2706168?w=800" },
    { title: "Vodka: Muito Alem da Caipiroska", slug: "vodka-alem-caipiroska", excerpt: "Conheca os diferentes tipos de vodka e drinks sofisticados para ir alem do basico.", content: "A vodka e uma das bebidas mais versateis do mundo.\n\nTIPOS POR INGREDIENTE:\n- Trigo: Grey Goose, Ketel One (suave)\n- Centeio: Belvedere (apimentada)\n- Batata: Chopin (cremosa)\n- Milho: Tito's (levemente doce)\n\nCLASSIFICACAO:\n- Standard: Smirnoff, Absolut\n- Premium: Grey Goose, Belvedere\n- Super Premium: Ciroc, Crystal Head\n\nDRINKS SOFISTICADOS:\n\n1. ESPRESSO MARTINI\n50ml vodka + 30ml licor de cafe + 30ml espresso\nAgitar com gelo e coar.\n\n2. COSMOPOLITAN\n40ml vodka + 15ml Cointreau + 30ml cranberry + 10ml limao\n\n3. BLOODY MARY\n50ml vodka + 120ml suco tomate + Tabasco + Worcestershire + sal de aipo\n\n4. VODKA SOUR DE MARACUJA\n50ml vodka + polpa de maracuja + xarope + limao\n\n5. LEMON DROP MARTINI\n50ml vodka + 25ml limao siciliano + 15ml xarope\n\nPARA BEBER PURA:\nGele a vodka premium no freezer (-18°C). Sirva em copo shot gelado.", tags: ["vodka", "drinks", "destilados", "receitas"], image_url: "https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=800" },
    { title: "Como Ler Rotulos de Vinho Sem Misterio", slug: "como-ler-rotulos-vinho", excerpt: "Aprenda a interpretar as informacoes dos rotulos de vinho e faca escolhas mais seguras.", content: "Os rotulos de vinho contem informacoes valiosas. Aprenda a le-los!\n\nINFORMAÇOES ESSENCIAIS:\n\n1. PRODUTOR/VINICOLA\nNome da empresa que fez o vinho. Produtores reconhecidos sao mais confiaveis.\n\n2. REGIAO/PAIS\n- Franca: Bordeaux, Borgonha, Rhone\n- Italia: Toscana, Piemonte, Veneto\n- Argentina: Mendoza\n- Chile: Valle Central, Maipo\n- Brasil: Serra Gaucha, Campanha\n\n3. UVA/CASTA\nMerlot, Cabernet, Malbec, Chardonnay, etc.\nAlguns paises (Franca) indicam a regiao em vez da uva.\n\n4. SAFRA (ANO)\nAno em que as uvas foram colhidas.\n- Vinhos jovens: beber em 1-3 anos\n- Vinhos de guarda: podem envelhecer 10+ anos\n\n5. TEOR ALCOOLICO\n- Leves: 11-12.5%\n- Medios: 12.5-14%\n- Encorpados: 14%+\n\n6. CLASSIFICACOES:\n- Reserva/Gran Reserva: envelhecimento extra\n- DOC/DOCG: denominacao de origem (qualidade regulada)\n- Varietal: 75%+ de uma unica uva\n\nDICA: nao julgue um vinho pela beleza do rotulo!", tags: ["vinhos", "rotulos", "dicas", "educacao"], image_url: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800" },
  ];

  for (const b of blogs) {
    const daysAgo = Math.floor(Math.random() * 30);
    const publishedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    const views = Math.floor(Math.random() * 500) + 50;
    await sql`
      INSERT INTO blog_posts (title, slug, excerpt, content, image_url, author, author_name, cover_image, tags, is_published, published_at, views)
      VALUES (${b.title}, ${b.slug}, ${b.excerpt}, ${b.content}, ${b.image_url}, 'AdegaExpress', 'AdegaExpress', ${b.image_url}, ${b.tags}, true, ${publishedAt}, ${views})
    `;
  }

  console.log(`Criados ${blogs.length} blog posts.`);
  console.log("\n=== SEED COMPLETO ===");
  console.log(`${owners.length} donos de adega (senha: 123456, pin: 1234)`);
  console.log(`${customers.length} clientes (senha: 123456, pin: 1234)`);
  console.log(`${storeIds.length} adegas (SJC:10, Cacapava:5, Taubate:15, Tremembe:5, Pinda:9)`);
  console.log(`${categoryNames.length} categorias por loja`);
  console.log(`${productTemplates.length} produtos por loja (${productTemplates.length * storeIds.length} total)`);
  console.log(`${storeIds.length * 2} promocoes (2 por loja)`);
  console.log(`${storeIds.length} combos (1 por loja)`);
  console.log(`${storeIds.length * 2} cupons (2 por loja)`);
  console.log(`${storeIds.length * 3} pedidos (3 por loja)`);
  console.log(`${storeIds.length * 3} contas a pagar (3 por loja)`);
  console.log(`${storeIds.length * 3} contas a receber (3 por loja)`);
  console.log(`${blogs.length} artigos do blog`);
}

seed().catch(console.error);
