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

  const pwHash = hashPassword("123456");
  const pinHash = hashPassword("1234");

  const motoboys = [
    {
      name: "Diego Ferreira",
      email: "diego@motoboy.com",
      phone: "(12) 99200-0001",
      cpf: "123.456.789-01",
      cnh: "12345678901",
      vehicle_type: "moto",
      vehicle_plate: "ABC1D23",
      motoboy_mode: "freelancer",
      city: "Sao Jose dos Campos",
      state: "SP",
      cep: "12210-000",
      street: "Rua Euclides Miragaia",
      number: "100",
      neighborhood: "Centro",
    },
    {
      name: "Lucas Ribeiro",
      email: "lucas@motoboy.com",
      phone: "(12) 99200-0002",
      cpf: "987.654.321-00",
      cnh: "98765432100",
      vehicle_type: "moto",
      vehicle_plate: "XYZ4E56",
      motoboy_mode: "linked",
      city: "Taubate",
      state: "SP",
      cep: "12010-000",
      street: "Av. Nove de Julho",
      number: "250",
      neighborhood: "Centro",
    },
    {
      name: "Rafael Santos",
      email: "rafael@motoboy.com",
      phone: "(12) 99200-0003",
      cpf: "456.789.123-02",
      cnh: "45678912302",
      vehicle_type: "bicicleta",
      vehicle_plate: "N/A",
      motoboy_mode: "freelancer",
      city: "Cacapava",
      state: "SP",
      cep: "12280-000",
      street: "Rua Barão do Rio Branco",
      number: "80",
      neighborhood: "Centro",
    },
  ];

  console.log("Inserindo 3 motoboys...");

  for (const m of motoboys) {
    await sql`
      INSERT INTO users (
        name, email, password_hash, pin_hash, role, phone,
        cpf, cnh, vehicle_type, vehicle_plate, motoboy_mode, is_available,
        city, state, cep, street, number, neighborhood
      ) VALUES (
        ${m.name}, ${m.email}, ${pwHash}, ${pinHash}, 'motoboy', ${m.phone},
        ${m.cpf}, ${m.cnh}, ${m.vehicle_type}, ${m.vehicle_plate}, ${m.motoboy_mode}, false,
        ${m.city}, ${m.state}, ${m.cep}, ${m.street}, ${m.number}, ${m.neighborhood}
      )
      ON CONFLICT (email) DO NOTHING
    `;
    console.log(`  + ${m.name} (${m.email}) - ${m.vehicle_type} - ${m.motoboy_mode}`);
  }

  console.log("Motoboys inseridos com sucesso!");
}

seed().catch(console.error);
