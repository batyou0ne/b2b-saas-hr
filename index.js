require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Kayit islemi baslatiliyor..")
    try {
        //! transaction basliyor
        const result = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email: "ahmet@superyazilim.com",
                    password: "gizlisifre123",
                    name: "Ahmet Kurucu"
                }
            });

            const newCompany = await tx.tenant.create({
                data: {
                    name: "Super yazılım AS"
                }
            });

            const userConnection = await tx.tenantMember.create({
                data: {
                    userId: newUser.id,
                    tenantId: newCompany.id,
                    role: "OWNER"
                }
            })

            return {
                user: newUser,
                company: newCompany,
                baglanti: userConnection
            };
        });

        console.log(result);
    } catch (error) {
        console.error("Kayıt sırasında hata oluştu, işlemler iptal edildi:", error);
    }
}

console.log("CALISIYOR")


main();