import "dotenv/config";

// Integration tests must never touch the development database.
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/planner_test";
process.env.SESSION_SECRET ??= "test-secret-that-is-at-least-32-characters-long";
// Unit tests for the LLM planner stub the network; never call a real model from tests.
delete process.env.LLM_API_KEY;
