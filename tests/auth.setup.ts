import { test as setup } from '@playwright/test';
import { LoginPage } from './pages/auth/LoginPage';

const authFile = 'tests/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(
    process.env.SAHAYOG_USER_ID ?? 'nayan.aher@netwinindia.in',
    process.env.SAHAYOG_PASSWORD ?? 'Sahayog@2025',
  );
  await page.waitForURL(/\/radheAgentWeb\/HOME/);
  await page.context().storageState({ path: authFile });
});
