import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const categories = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painter",
  "Mason",
  "Cleaner",
  "AC Repair",
  "Computer Repair",
  "Mobile Repair",
  "CCTV Technician",
  "Gardening",
  "Pest Control",
  "Welder",
  "House Cleaning",
];

const skills = [
  "Electrical Wiring",
  "Pipe Installation",
  "Furniture Repair",
  "Tile Work",
  "Roof Repair",
  "Solar Panel Installation",
  "Networking",
  "Painting",
  "Cleaning",
  "Air Conditioning",
  "CCTV Installation",
  "Computer Troubleshooting",
  "Mobile Repair",
  "Gardening",
  "Pest Control",
];

async function seedAdmin() {
  console.log("👤 Seeding Admin User...");

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  await prisma.user.upsert({
    where: {
      email: "admin@findmepro.lk",
    },
    update: {},
    create: {
      fullName: "System Administrator",
      email: "admin@findmepro.lk",
      password: hashedPassword,
      phone: "0710000000",
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: true,
      phoneVerified: true,
    },
  });

  console.log("✅ Admin user seeded successfully.");
}

async function seedCategories() {
  console.log("📂 Seeding Categories...");

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        name: category,
      },
      update: {},
      create: {
  name: category,
  slug: category
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/&/g, "and"),
  isActive: true,
},
    });
  }

  console.log("✅ Categories seeded successfully.");
}

async function seedSkills() {
  console.log("🛠️ Seeding Skills...");

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: {
        name: skill,
      },
      update: {},
      create: {
        name: skill,
      },
    });
  }

  console.log("✅ Skills seeded successfully.");
}

async function main() {
  console.log("🌱 Starting database seed...");

  await seedCategories();

  await seedSkills();

  await seedAdmin();

  console.log("🎉 Database seeded successfully.");
}

main()
  .catch((error) => {
  console.error("=================================");
  console.error("❌ Database Seed Failed");
  console.error(error);
  console.error("=================================");
  process.exit(1);
})
  .finally(async () => {
    await prisma.$disconnect();
  });