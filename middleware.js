require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const roleHierarchy = {
    OWNER: 3,
    ADMIN: 2,
    EMPLOYEE: 1
}

async function checkTenantAccess(userId, tenantId, requiredRole) {
    console.log(`Checking access... User: ${userId} | Tenant: ${tenantId}`);

    const membership = await prisma.tenantMember.findUnique({
        where: {
            userId_tenantId: {
                userId: userId,
                tenantId: tenantId
            }
        }
    });

    if (!membership) {
        console.log("Access denied! User is not an employee of this workspace")
        return false;
    }

    const userRoleLevel = roleHierarchy[membership.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel >= requiredRoleLevel) {
        console.log(`Access Granted: User role (${membership.role}) meets the requirement (${requiredRole}).`);
        return true; //let employee pass
    } else {
        console.log(`Access Denied: Insufficient permissions! Needed: ${requiredRole}, Found: ${membership.role}`);
        return false;
    }

}

async function testMiddleware() {
    console.log("Fetching test users from the database...");

    const tenant = await prisma.tenant.findFirst();
    const ahmet = await prisma.user.findUnique({
        where: {
            email: "ahmet@superyazilim.com"
        }
    });
    const ayse = await prisma.user.findUnique({
        where: {
            email: "ayse@superyazilim.com"
        }
    });

    if (!tenant || !ayse || !ahmet) {
        console.log("Error: Test data not found. Did you run index.js and invite.js?");
        return;

    }
    console.log("\n--- TEST 1: Employee performing a basic task ---");
    await checkTenantAccess(ayse.id, tenant.id, "EMPLOYEE");

    console.log("\n--- TEST 2: Employee trying to do a Patron job ---");
    await checkTenantAccess(ayse.id, tenant.id, "OWNER");

    console.log("\n--- TEST 3: Patron doing an Admin job ---");
    await checkTenantAccess(ahmet.id, tenant.id, "ADMIN");

    console.log("\n--- TEST 4: Unknown user trying to hack in ---");
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000"; // Uydurma bir UUID
    await checkTenantAccess(fakeUserId, tenant.id, "EMPLOYEE");


}

testMiddleware()
    .finally(async () => {
        await prisma.$disconnect();
    });