
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'yari@nbt.com'
    console.log(`Checking for user: ${email}`)

    const user = await prisma.user.findUnique({
        where: { email },
        include: { employee: true }
    })

    if (!user) {
        console.log('User not found in User table.')
    } else {
        console.log('User found:', JSON.stringify(user, null, 2))
    }

    const employee = await prisma.employee.findUnique({
        where: { email }
    })

    if (!employee) {
        console.log('Employee not found in Employee table.')
    } else {
        console.log('Employee found:', JSON.stringify(employee, null, 2))
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
