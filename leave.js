require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("--- Leave Request System ---");

    const tenant = await prisma.tenant.findFirst();
    const ayse = await prisma.user.findUnique({
        where: {
            email: "ayse@superyazilim.com"
        }
    });

    if (!tenant || !ayse) {
        console.log("Error: Tenant or User not found!");
        return;
    }

    console.log(`Context loaded. User: ${ayse.name} | Tenant: ${tenant.name}`);
    const leaveRequest = await prisma.leaveRequest.create({
        data: {
            startDate: new Date("2026-07-15T09:00:00Z"),
            endDate: new Date("2026-07-25T18:00:00Z"),
            reason: "Annual summer vacation",
            userId: ayse.id,
            tenantId: tenant.id
        }
    });

    console.log("Step 2 Completed: Leave request successfully created!");
    console.log("Request Details:", leaveRequest);


}
main()
    .finally(async () => {
        await prisma.$disconnect();
    });