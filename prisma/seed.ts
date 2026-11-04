/**
 * Creates a demo account with a realistic current week and 6 weeks of history,
 * so the board and the Insights page have something to show.
 *
 *   npm run db:seed
 *
 * Login: demo@chinesh.app / demo-password  (re-running the seed resets this account only)
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { addWeeks, currentWeek } from "../src/lib/week";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const EMAIL = "demo@chinesh.app";

// Deterministic pseudo-random numbers so every seed produces the same history.
let state = 42;
const rand = () => ((state = (state * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);

const TITLES = [
  "Operating systems project", "Algorithms homework", "Read RAG paper", "Gym", "Groceries", "Lab report",
  "Prepare slides", "Code review", "Email supervisor", "Database assignment", "Mock exam", "Laundry",
];

async function main() {
  await db.user.deleteMany({ where: { email: EMAIL } });
  const user = await db.user.create({
    data: { email: EMAIL, name: "Demo", passwordHash: await bcrypt.hash("demo-password", 12), availability: [4, 4, 4, 4, 3, 2, 2] },
  });

  const thisWeek = currentWeek();
  const history = [];
  for (let w = 6; w >= 1; w--) {
    const weekStart = addWeeks(thisWeek, -w);
    for (let i = 0; i < 7; i++) {
      const complexity = 1 + Math.floor(rand() * 5);
      const hours = 1 + Math.floor(rand() * 3);
      const done = rand() < 0.95 - complexity * 0.08;
      // Harder tasks tend to overrun their estimate, which is what Insights should surface.
      const overrun = 0.85 + complexity * 0.12 + rand() * 0.3;
      history.push({
        userId: user.id,
        title: TITLES[Math.floor(rand() * TITLES.length)],
        hours,
        complexity,
        weekStart,
        day: i % 7,
        done,
        completedAt: done ? new Date() : null,
        actualHours: done ? Math.max(1, Math.round(hours * overrun)) : null,
      });
    }
  }

  const current = [
    { title: "Operating systems project", hours: 3, complexity: 5, day: null },
    { title: "Algorithms homework", hours: 3, complexity: 4, day: null },
    { title: "Read RAG paper", hours: 2, complexity: 3, day: null },
    { title: "Gym", hours: 1, complexity: 2, day: 0 },
    { title: "Prepare slides", hours: 2, complexity: 3, day: 1 },
    { title: "Email supervisor", hours: 1, complexity: 1, day: 2 },
    { title: "Groceries", hours: 1, complexity: 1, day: null },
  ].map((t) => ({ ...t, userId: user.id, weekStart: thisWeek }));

  await db.task.createMany({ data: [...history, ...current] });
  console.log(`Seeded ${EMAIL} with ${history.length + current.length} tasks.`);
}

main().finally(() => db.$disconnect());
