
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('--- Resyncing Missing Employee Records ---')

    // Find all users who do not have a linked employee record
    const usersWithoutEmployee = await prisma.user.findMany({
        where: {
            employee: {
                is: null
            }
        }
    })

    console.log(`Found ${usersWithoutEmployee.length} users missing employee records.`)

    for (const user of usersWithoutEmployee) {
        console.log(`Syncing: ${user.email}...`)

        // Check if an employee record with this email already exists but is unlinked
        let employee = await prisma.employee.findUnique({
            where: { email: user.email }
        })

        if (employee) {
            // Link existing employee to user
            await prisma.employee.update({
                where: { id: employee.id },
                data: { userId: user.id }
            })
            console.log(`  -> Linked existing employee record for ${user.email}`)
        } else {
            // Create new employee record
            await prisma.employee.create({
                data: {
                    name: user.name || user.email.split('@')[0],
                    email: user.email,
                    userId: user.id,
                    position: 'Staff Member',
                    department: 'General'
                }
            })
            console.log(`  -> Created new employee record for ${user.email}`)
        }
    }

    console.log('--- Sync Complete ---')
}

main()
    .catch(e => {
        console.error('Error during sync:')
        console.error(e)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
