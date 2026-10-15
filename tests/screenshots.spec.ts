import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const screenshotDir = path.resolve(__dirname, '../docs/screenshots');

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

test.describe('Automated Screen Exports for HelpDesk 360', () => {
  test('Capture and export all screens across desktop and tablet viewports', async ({ page }, testInfo) => {
    const width = page.viewportSize()?.width || 1440;
    const saveShot = async (name: string) => {
      const filename = path.join(screenshotDir, `${name}_${width}px.png`);
      await page.screenshot({ path: filename, fullPage: false });
      console.log(`Saved screenshot: ${filename}`);
    };

    // 1. Login Page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Sign in to your account')).toBeVisible();
    await saveShot('01_login');

    // 2. Authenticate as Employee (Priya Nair)
    await page.fill('input[type="email"]', 'priya.nair@helpdesk.local');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button:has-text("Sign in")');
    await page.waitForURL('**/employee/tickets');
    await page.waitForLoadState('networkidle');

    // 3. Employee My Tickets (Wait for populated table rows)
    await expect(page.locator('h1:has-text("My tickets")')).toBeVisible();
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    await saveShot('02_employee_my_tickets');

    // 4. Employee New Ticket Form
    await page.goto('/employee/new-ticket');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1:has-text("New ticket")')).toBeVisible();
    await page.fill('input[placeholder*="Laptop does not boot"]', 'Monitor resolution stuck at 1024x768');
    await page.fill('textarea[placeholder*="Provide detailed symptoms"]', 'Unable to set native 4K resolution on external Dell monitor after graphics driver rollback.');
    await saveShot('03_employee_new_ticket');

    // 5. Employee Ticket Detail
    await page.goto('/employee/tickets');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    // Click first ticket row
    await page.locator('tbody tr').first().click();
    await page.waitForSelector('text=Issue description', { timeout: 10000 });
    await saveShot('04_employee_ticket_detail');

    // 6. Sign out and Sign in as Technician (Arjun Mehta)
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    // In case already logged in, click sign out in sidebar
    const logoutBtn = page.locator('button[aria-label="Sign out"], button:has-text("Sign out")');
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await page.waitForURL('**/login');
    }

    await page.fill('input[type="email"]', 'arjun.mehta@helpdesk.local');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button:has-text("Sign in")');
    await page.waitForURL('**/technician/dashboard');
    await page.waitForLoadState('networkidle');

    // 7. Technician Dashboard
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    await page.waitForTimeout(1000); // Allow charts to animate
    await saveShot('07_technician_dashboard');

    // 8. Technician Support Queue
    await page.goto('/technician/queue');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1:has-text("Support queue")')).toBeVisible();
    await saveShot('05_technician_support_queue');

    // 9. Technician Ticket Detail
    // Click an urgent or open ticket row
    await page.locator('tbody tr').first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Technician controls')).toBeVisible();
    await saveShot('06_technician_ticket_detail');

    // 10. Empty State (Queue with zero matching results)
    await page.goto('/technician/queue');
    await page.waitForLoadState('networkidle');
    await page.fill('input[placeholder*="Search tickets"]', 'NONEXISTENT_QUERY_XYZ_123');
    await page.waitForTimeout(500);
    await expect(page.locator('text=No matching tickets')).toBeVisible();
    await saveShot('09_state_empty');

    // 11. Design System Gallery, Loading Skeletons & Error State
    await page.goto('/design-system');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1:has-text("HelpDesk 360 Design System")')).toBeVisible();
    await saveShot('16_design_system_tokens');

    // Dedicated Skeleton State
    const skeletonSection = page.locator('text=Loading skeletons & empty states');
    await skeletonSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await saveShot('08_state_loading');

    // Dedicated Error Banner State
    const errorSection = page.locator('text=Modals, toasts & banners');
    await errorSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await saveShot('10_state_error');

    // 12. Modal Dialog & Confirm Modal
    await page.click('button:has-text("Open confirm dialog")');
    await page.waitForTimeout(300);
    await expect(page.locator('text=Confirm ticket deletion?')).toBeVisible();
    await saveShot('15_confirmation_modal');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    // 13. Success Toast
    await page.click('button:has-text("Trigger success toast")');
    await page.waitForTimeout(300);
    await saveShot('13_success_toast');

    // 14. Error Toast
    await page.click('button:has-text("Trigger error toast")');
    await page.waitForTimeout(300);
    await saveShot('14_error_toast');

    // 15. 403 Forbidden Page
    await page.goto('/403');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1:has-text("Not allowed")')).toBeVisible();
    await saveShot('11_forbidden_403');

    // 16. 404 Not Found Page
    await page.goto('/non-existent-route-xyz');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1:has-text("Page not found")')).toBeVisible();
    await saveShot('12_not_found_404');
  });
});
