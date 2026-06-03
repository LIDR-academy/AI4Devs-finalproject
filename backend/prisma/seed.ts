import { CompletionStatus, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEMO_USER_ID = 1

const DEMO_HABITS = [
  { id: 1, emoji: '🏃', name: 'Correr', pointsPerDay: 10, penalty: 5 },
  { id: 2, emoji: '🧘', name: 'Meditar', pointsPerDay: 5, penalty: 2 },
  { id: 3, emoji: '📚', name: 'Leer', pointsPerDay: 8, penalty: 3 },
] as const

const DEMO_REWARDS = [
  {
    id: 1,
    emoji: '🎉',
    name: 'Tarde libre',
    description: 'Tarde sin obligaciones',
    cost: 50,
  },
  {
    id: 2,
    emoji: '🍽️',
    name: 'Cena especial',
    description: 'Cena fuera en restaurante favorito',
    cost: 80,
  },
] as const

/** Alineado con frontend/src/domain/week.ts (buildWeekData, weekOffset 0). */
function getCurrentWeekBounds(now = new Date()): { startDate: Date; endDate: Date } {
  const currentDay = now.getDay()
  const diff = currentDay === 0 ? -6 : 1 - currentDay
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(now.getDate() + diff)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { startDate: monday, endDate: sunday }
}

async function syncPostgresSequences(): Promise<void> {
  for (const table of ['User', 'Habit', 'Reward'] as const) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(
        pg_get_serial_sequence('"${table}"', 'id'),
        COALESCE((SELECT MAX(id) FROM "${table}"), 1)
      )`,
    )
  }
}

async function main(): Promise<void> {
  const { startDate, endDate } = getCurrentWeekBounds()

  await prisma.$transaction(async (tx) => {
    await tx.user.upsert({
      where: { id: DEMO_USER_ID },
      create: {
        id: DEMO_USER_ID,
        email: 'demo@ConRutina.app',
        name: 'Demo User',
      },
      update: {
        email: 'demo@ConRutina.app',
        name: 'Demo User',
      },
    })

    for (const habit of DEMO_HABITS) {
      await tx.habit.upsert({
        where: { id: habit.id },
        create: {
          id: habit.id,
          userId: DEMO_USER_ID,
          emoji: habit.emoji,
          name: habit.name,
          pointsPerDay: habit.pointsPerDay,
          penalty: habit.penalty,
          isActive: true,
        },
        update: {
          userId: DEMO_USER_ID,
          emoji: habit.emoji,
          name: habit.name,
          pointsPerDay: habit.pointsPerDay,
          penalty: habit.penalty,
          isActive: true,
        },
      })
    }

    for (const reward of DEMO_REWARDS) {
      await tx.reward.upsert({
        where: { id: reward.id },
        create: {
          id: reward.id,
          userId: DEMO_USER_ID,
          emoji: reward.emoji,
          name: reward.name,
          description: reward.description,
          cost: reward.cost,
          isActive: true,
        },
        update: {
          userId: DEMO_USER_ID,
          emoji: reward.emoji,
          name: reward.name,
          description: reward.description,
          cost: reward.cost,
          isActive: true,
        },
      })
    }

    let week = await tx.week.findFirst({
      where: { userId: DEMO_USER_ID, startDate },
    })

    if (!week) {
      week = await tx.week.create({
        data: {
          userId: DEMO_USER_ID,
          startDate,
          endDate,
        },
      })
    }

    for (let order = 0; order < DEMO_HABITS.length; order++) {
      const habit = DEMO_HABITS[order]
      let weekHabit = await tx.weekHabit.findFirst({
        where: { weekId: week.id, habitId: habit.id },
      })

      if (!weekHabit) {
        weekHabit = await tx.weekHabit.create({
          data: {
            weekId: week.id,
            habitId: habit.id,
            order,
            snapshotName: habit.name,
            snapshotPoints: habit.pointsPerDay,
            snapshotPenalty: habit.penalty,
          },
        })
      }

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const existingEntry = await tx.habitEntry.findFirst({
          where: { weekHabitId: weekHabit.id, dayIndex },
        })

        if (!existingEntry) {
          await tx.habitEntry.create({
            data: {
              weekHabitId: weekHabit.id,
              dayIndex,
              status: CompletionStatus.pending,
            },
          })
        }
      }
    }
  })

  await syncPostgresSequences()
  console.log('Seed completado: usuario demo, hábitos, semana activa y recompensas.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
