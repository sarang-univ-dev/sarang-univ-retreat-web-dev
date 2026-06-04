import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // E2E는 항상 mock API 모드(dev:e2e)로 띄운다. 이미 띄워둔 서버가 있으면 재사용.
  // 모든 백엔드 호출은 Playwright route 모킹으로 처리되므로 실제 서버는 불필요하다.
  webServer: {
    command: "yarn dev:e2e",
    url: "http://localhost:3000/retreat/_healthcheck/retreat",
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
});
