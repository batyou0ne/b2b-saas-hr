require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("User invitation system is working successfully")

    const company = await prisma.tenant.findFirst();

    if (!company) {
        console.log("Couldn't find any company")
        return;
    }

    console.log("Company found:", company.name);
    console.log("ID of company", company.id);

    const newUser = await prisma.user.create({
        data: {
            email: "ayse@superyazilim.com",
            password: "securepassword123",
            name: "Ayse employee"
        }
    })

    const membership = await prisma.tenantMember.create({
        data: {
            userId: newUser.id,
            tenantId: company.id,
            role: "EMPLOYEE"
        }
    })


}

main()
    .finally(async () => {
        await prisma.$disconnect();
    })