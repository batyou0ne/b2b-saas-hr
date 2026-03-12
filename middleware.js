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

async function checkTenantAccess(userId, tenant, requiredRole) {
    console.log(`Checking access... User: ${userId} | Tenant: ${tenantId}`);

    const membership = await prisma.tenant.findUnique({
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

}

testMiddleware();