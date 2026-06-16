import "dotenv/config";
import { PrismaClient, MovementType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Sabonetes", slug: "sabonetes", sortOrder: 1 },
  { name: "Sachê perfumado", slug: "sache-perfumado", sortOrder: 2 },
  { name: "Spray", slug: "spray", sortOrder: 3 },
];

const products = [
  {
    name: "Sabonete em barra lavanda",
    description: "Hidratante com óleo essencial, 90g",
    priceCents: 1290,
    categorySlug: "sabonetes",
    imageUrl: "/products/sabonete-barra.svg",
    qty: 50,
  },
  {
    name: "Sabonete líquido neutro",
    description: "Refil 500ml, suave para as mãos",
    priceCents: 1890,
    categorySlug: "sabonetes",
    imageUrl: "/products/sabonete-liquido.svg",
    qty: 40,
  },
  {
    name: "Sabonete de glicerina",
    description: "Transparente, aroma suave, 100g",
    priceCents: 990,
    categorySlug: "sabonetes",
    imageUrl: "/products/sabonete-glicerina.svg",
    qty: 45,
  },
  {
    name: "Sabonete esfoliante",
    description: "Com sementes naturais, 120g",
    priceCents: 1590,
    categorySlug: "sabonetes",
    imageUrl: "/products/sabonete-esfoliante.svg",
    qty: 35,
  },
  {
    name: "Sabonete infantil",
    description: "Hipoalergênico, sem corantes, 80g",
    priceCents: 1190,
    categorySlug: "sabonetes",
    imageUrl: "/products/sabonete-infantil.svg",
    qty: 38,
  },
  {
    name: "Sabonete karité",
    description: "Manteiga de karité, pele seca, 100g",
    priceCents: 1490,
    categorySlug: "sabonetes",
    imageUrl: "/products/sabonete-karite.svg",
    qty: 32,
  },
  {
    name: "Sachê perfumado lavanda",
    description: "Para gavetas e armários, pacote com 5",
    priceCents: 890,
    categorySlug: "sache-perfumado",
    imageUrl: "/products/sache-lavanda.svg",
    qty: 60,
  },
  {
    name: "Sachê floral",
    description: "Aroma de jardim, pacote com 5 unidades",
    priceCents: 890,
    categorySlug: "sache-perfumado",
    imageUrl: "/products/sache-floral.svg",
    qty: 55,
  },
  {
    name: "Sachê cítrico",
    description: "Frescor de limão siciliano, pacote com 5",
    priceCents: 790,
    categorySlug: "sache-perfumado",
    imageUrl: "/products/sache-citrico.svg",
    qty: 48,
  },
  {
    name: "Sachê para roupa",
    description: "Protege tecidos no armário, pacote com 8",
    priceCents: 990,
    categorySlug: "sache-perfumado",
    imageUrl: "/products/sache-roupa.svg",
    qty: 42,
  },
  {
    name: "Sachê para armário",
    description: "Longa duração, aroma suave, pacote com 4",
    priceCents: 1090,
    categorySlug: "sache-perfumado",
    imageUrl: "/products/sache-armario.svg",
    qty: 36,
  },
  {
    name: "Sachê bambu",
    description: "Aroma natural e relaxante, pacote com 5",
    priceCents: 990,
    categorySlug: "sache-perfumado",
    imageUrl: "/products/sache-bambu.svg",
    qty: 40,
  },
  {
    name: "Spray ambiente",
    description: "Perfuma o ambiente, frasco 250ml",
    priceCents: 2490,
    categorySlug: "spray",
    imageUrl: "/products/spray-ambiente.svg",
    qty: 30,
  },
  {
    name: "Spray para tecidos",
    description: "Elimina odores de sofás e cortinas, 300ml",
    priceCents: 2790,
    categorySlug: "spray",
    imageUrl: "/products/spray-tecido.svg",
    qty: 28,
  },
  {
    name: "Spray para carro",
    description: "Aroma duradouro, frasco 100ml",
    priceCents: 1990,
    categorySlug: "spray",
    imageUrl: "/products/spray-carro.svg",
    qty: 25,
  },
  {
    name: "Spray eucalipto",
    description: "Aromaterapia, frasco 200ml",
    priceCents: 2290,
    categorySlug: "spray",
    imageUrl: "/products/spray-eucalipto.svg",
    qty: 22,
  },
  {
    name: "Spray jasmim",
    description: "Floral delicado, frasco 250ml",
    priceCents: 2590,
    categorySlug: "spray",
    imageUrl: "/products/spray-jasmim.svg",
    qty: 20,
  },
  {
    name: "Spray linho",
    description: "Aroma de roupa limpa, frasco 300ml",
    priceCents: 2690,
    categorySlug: "spray",
    imageUrl: "/products/spray-linho.svg",
    qty: 24,
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const store = await prisma.store.upsert({
    where: { slug: "minha-loja" },
    update: { name: "SaboArt" },
    create: {
      name: "SaboArt",
      slug: "minha-loja",
      whatsapp: "5511999999999",
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@loja.com" },
    update: {},
    create: {
      email: "admin@loja.com",
      passwordHash,
      name: "Administrador",
      storeId: store.id,
    },
  });

  const activeSlugs = categories.map((c) => c.slug);
  await prisma.category.updateMany({
    where: {
      storeId: store.id,
      slug: { notIn: activeSlugs },
    },
    data: { active: false },
  });

  const categoryMap: Record<string, string> = {};

  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { storeId_slug: { storeId: store.id, slug: cat.slug } },
      update: { name: cat.name, sortOrder: cat.sortOrder, active: true },
      create: { storeId: store.id, ...cat, active: true },
    });
    categoryMap[cat.slug] = c.id;
  }

  await prisma.inventoryMovement.deleteMany({ where: { storeId: store.id } });
  await prisma.orderItem.deleteMany({
    where: { order: { storeId: store.id } },
  });
  await prisma.order.deleteMany({ where: { storeId: store.id } });
  await prisma.product.deleteMany({ where: { storeId: store.id } });

  for (const p of products) {
    const product = await prisma.product.create({
      data: {
        storeId: store.id,
        categoryId: categoryMap[p.categorySlug],
        name: p.name,
        description: p.description,
        priceCents: p.priceCents,
        imageUrl: p.imageUrl,
        active: true,
      },
    });

    await prisma.inventory.create({
      data: {
        productId: product.id,
        quantity: p.qty,
        reservedQuantity: 0,
        lowStockThreshold: 5,
      },
    });

    await prisma.inventoryMovement.create({
      data: {
        storeId: store.id,
        productId: product.id,
        type: MovementType.MANUAL_IN,
        quantity: p.qty,
        balanceAfter: p.qty,
        note: "Estoque inicial (seed)",
      },
    });
  }

  console.log("Seed concluído:");
  console.log(`  ${products.length} produtos com imagens`);
  console.log("  Loja: /s/minha-loja");
  console.log("  Admin: admin@loja.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
