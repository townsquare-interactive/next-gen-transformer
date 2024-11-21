import { defineConfig, devices } from '@playwright/test';
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './tests',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: 'html',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        // baseURL: 'http://127.0.0.1:3000',
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
    },
    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },
        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        // },
    ],
    /* Run your local dev server before starting the tests */
    // webServer: {
    //   command: 'npm run start',
    //   url: 'http://127.0.0.1:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheXdyaWdodC5jb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9wbGF5d3JpZ2h0LmNvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRXpEOzs7R0FHRztBQUNILCtCQUErQjtBQUMvQiwyQkFBMkI7QUFDM0IsNERBQTREO0FBRTVEOztHQUVHO0FBQ0gsZUFBZSxZQUFZLENBQUM7SUFDMUIsT0FBTyxFQUFFLFNBQVM7SUFDbEIsb0NBQW9DO0lBQ3BDLGFBQWEsRUFBRSxJQUFJO0lBQ25CLGlGQUFpRjtJQUNqRixVQUFVLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtJQUM1QixzQkFBc0I7SUFDdEIsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0Isc0NBQXNDO0lBQ3RDLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO0lBQ3ZDLHFFQUFxRTtJQUNyRSxRQUFRLEVBQUUsTUFBTTtJQUNoQix3R0FBd0c7SUFDeEcsR0FBRyxFQUFFO1FBQ0gsNkRBQTZEO1FBQzdELG9DQUFvQztRQUVwQywrRkFBK0Y7UUFDL0YsS0FBSyxFQUFFLGdCQUFnQjtLQUN4QjtJQUVELDJDQUEyQztJQUMzQyxRQUFRLEVBQUU7UUFDUjtZQUNFLElBQUksRUFBRSxVQUFVO1lBQ2hCLEdBQUcsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7U0FDdEM7UUFFRDtZQUNFLElBQUksRUFBRSxTQUFTO1lBQ2YsR0FBRyxFQUFFLEVBQUUsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsRUFBRTtTQUN2QztRQUVEO1lBQ0UsSUFBSSxFQUFFLFFBQVE7WUFDZCxHQUFHLEVBQUUsRUFBRSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1NBQ3RDO1FBRUQsb0NBQW9DO1FBQ3BDLElBQUk7UUFDSiwyQkFBMkI7UUFDM0Isb0NBQW9DO1FBQ3BDLEtBQUs7UUFDTCxJQUFJO1FBQ0osMkJBQTJCO1FBQzNCLHNDQUFzQztRQUN0QyxLQUFLO1FBRUwsb0NBQW9DO1FBQ3BDLElBQUk7UUFDSiw0QkFBNEI7UUFDNUIsNERBQTREO1FBQzVELEtBQUs7UUFDTCxJQUFJO1FBQ0osMkJBQTJCO1FBQzNCLDhEQUE4RDtRQUM5RCxLQUFLO0tBQ047SUFFRCx5REFBeUQ7SUFDekQsZUFBZTtJQUNmLDhCQUE4QjtJQUM5QixrQ0FBa0M7SUFDbEMsMENBQTBDO0lBQzFDLEtBQUs7Q0FDTixDQUFDLENBQUMifQ==