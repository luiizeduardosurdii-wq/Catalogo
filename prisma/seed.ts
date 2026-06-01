import "dotenv/config";
import { PrismaClient, MovementType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Comidas", slug: "comidas", sortOrder: 1 },
  { name: "Bebidas", slug: "bebidas", sortOrder: 2 },
  { name: "Eletrônicos", slug: "eletronicos", sortOrder: 3 },
];

const products = [
  {
    name: "Alfajor artesanal",
    description: "Doce de leite com chocolate, caixa com 6 unidades",
    priceCents: 1890,
    categorySlug: "comidas",
    imageUrl: "/products/alfajor.svg",
    qty: 40,
  },
  {
    name: "Torrone italiano",
    description: "Com amêndoas e mel, barra 150g",
    priceCents: 2490,
    categorySlug: "comidas",
    imageUrl: "/products/torrone.svg",
    qty: 28,
  },
  {
    name: "Brigadeiro gourmet",
    description: "Caixa com 12 unidades sortidas",
    priceCents: 1590,
    categorySlug: "comidas",
    imageUrl: "/products/brigadeiro.svg",
    qty: 35,
  },
  {
    name: "Panettone tradicional",
    description: "Frutas cristalizadas, 750g",
    priceCents: 4590,
    categorySlug: "comidas",
    imageUrl: "/products/panettone.svg",
    qty: 18,
  },
  {
    name: "Doce de leite premium",
    description: "Pote vidro 400g, cremoso",
    priceCents: 1290,
    categorySlug: "comidas",
    imageUrl: "/products/doce-leite.svg",
    qty: 45,
  },
  {
    name: "Vinho Malbec",
    description: "Tinto argentino reserva, garrafa 750ml",
    priceCents: 8990,
    categorySlug: "bebidas",
    imageUrl: "/products/vinho-tinto.svg",
    qty: 24,
  },
  {
    name: "Vinho branco suave",
    description: "Chardonnay, garrafa 750ml",
    priceCents: 6490,
    categorySlug: "bebidas",
    imageUrl: "/products/vinho-branco.svg",
    qty: 20,
  },
  {
    name: "Whisky 12 anos",
    description: "Escocês blended, garrafa 1L",
    priceCents: 18990,
    categorySlug: "bebidas",
    imageUrl: "/products/whisky.svg",
    qty: 12,
  },
  {
    name: "Gin London Dry",
    description: "Premium, garrafa 750ml",
    priceCents: 11990,
    categorySlug: "bebidas",
    imageUrl: "/products/gin.svg",
    qty: 15,
  },
  {
    name: "Vodka premium",
    description: "Destilado neutro, garrafa 1L",
    priceCents: 7990,
    categorySlug: "bebidas",
    imageUrl: "/products/vodka.svg",
    qty: 18,
  },
  {
    name: "Cachaça envelhecida",
    description: "Premium, garrafa 700ml",
    priceCents: 5490,
    categorySlug: "bebidas",
    imageUrl: "/products/cachaca.svg",
    qty: 22,
  },
  {
    name: "Rum caribenho",
    description: "Envelhecido 8 anos, 700ml",
    priceCents: 9990,
    categorySlug: "bebidas",
    imageUrl: "/products/rum.svg",
    qty: 14,
  },
  {
    name: "Espumante brut",
    description: "Branco seco, garrafa 750ml",
    priceCents: 7290,
    categorySlug: "bebidas",
    imageUrl: "/products/espumante.svg",
    qty: 16,
  },
  {
    name: "Pod vape recarregável",
    description: "Cigarro eletrônico, sabores variados",
    priceCents: 12990,
    categorySlug: "eletronicos",
    imageUrl: "/products/vape.svg",
    qty: 25,
  },
  {
    name: "Celular Galaxy A",
    description: "128GB, tela 6.5\", dual chip",
    priceCents: 149990,
    categorySlug: "eletronicos",
    imageUrl: "/products/samsung.svg",
    qty: 8,
  },
  {
    name: "iPhone 15",
    description: "256GB, câmera dupla, iOS",
    priceCents: 499990,
    categorySlug: "eletronicos",
    imageUrl: "/products/iphone.svg",
    qty: 5,
  },
  {
    name: "Tablet 10 polegadas",
    description: "Wi-Fi, 64GB, ideal para estudos",
    priceCents: 89990,
    categorySlug: "eletronicos",
    imageUrl: "/products/tablet.svg",
    qty: 10,
  },
  {
    name: "Tablet Pro 12.9",
    description: "Tela retina, 256GB, caneta inclusa",
    priceCents: 349990,
    categorySlug: "eletronicos",
    imageUrl: "/products/tablet.svg",
    qty: 4,
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const store = await prisma.store.upsert({
    where: { slug: "minha-loja" },
    update: { name: "Catálogo Premium" },
    create: {
      name: "Catálogo Premium",
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

  const categoryMap: Record<string, string> = {};

  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { storeId_slug: { storeId: store.id, slug: cat.slug } },
      update: { name: cat.name, sortOrder: cat.sortOrder },
      create: { storeId: store.id, ...cat },
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
