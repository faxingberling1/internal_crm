
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const email = 'yari@nbt.com'
    console.log(`--- Diagnostic for user: ${email} ---`)

    const user = await prisma.user.findUnique({
        where: { email },
        include: { employee: true }
    })

    if (!user) {
        console.log('[RESULT] User NOT found in "User" table.')
    } else {
        console.log('[RESULT] User found in "User" table:')
        console.log(JSON.stringify(user, null, 2))
    }

    const employee = await prisma.employee.findUnique({
        where: { email }
    })

    if (!employee) {
        console.log('[RESULT] Employee NOT found in "Employee" table.')
    } else {
        console.log('[RESULT] Employee found in "Employee" table:')
        console.log(JSON.stringify(employee, null, 2))
    }

    if (user && !employee) {
        console.log('\n[ADVICE] The user exists but the corresponding Employee record is missing.')
        console.log('The User Management page only displays records from the "Employee" table.')
    }
}

main()
    .catch(e => {
        console.error('Error during diagnostic:')
        console.error(e)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
