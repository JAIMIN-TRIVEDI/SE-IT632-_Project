import { expect, test } from '@playwright/test';

const users = {
  student: { email: 'student1@test.com', password: '123456' },
  admin: { email: 'admin@test.com', password: '123456' },
  warden: { email: 'warden1@test.com', password: '123456' },
  mess: { email: 'mess@test.com', password: '123456' },
};

async function login(page, user, expectedPath) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  await page.locator('input[name="email"]').fill(user.email);
  await page.locator('input[name="password"]').fill(user.password);
  await page.getByRole('button', { name: 'Sign in to Account' }).click();

  await expect(page).toHaveURL(expectedPath);
}

test('public auth pages render', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: 'Sign in to Account' })).toBeVisible();
  await expect(page.locator('body')).toContainText('Please enter your details to sign in.');

  await page.goto('/register', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: 'Register Account' })).toBeVisible();
  await expect(page.locator('body')).toContainText('Join the');
});

test('invalid login stays on login and shows an error', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  await page.locator('input[name="email"]').fill('wrong@test.com');
  await page.locator('input[name="password"]').fill('wrongpass');
  await page.getByRole('button', { name: 'Sign in to Account' }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('alert').first()).toBeVisible();
});

test('student login covers student dashboard routes', async ({ page }) => {
  await login(page, users.student, /\/student\/dashboard$/);
  await expect(page.getByText('Student Dashboard')).toBeVisible();

  await page.goto('/student/apply-room');
  await expect(page).toHaveURL(/\/student\/apply-room$/);
  await expect(page.getByRole('tab', { name: 'Random Room Request' })).toBeVisible();

  await page.goto('/student/mess-menu');
  await expect(page).toHaveURL(/\/student\/mess-menu$/);
  await expect(page.getByRole('heading', { name: 'Mess Menu' })).toBeVisible();

  await page.goto('/student/mess-plan');
  await expect(page).toHaveURL(/\/student\/mess-plan$/);
  await expect(page.getByText('Mess Subscription')).toBeVisible();
});

test('hostel admin dashboard routes render', async ({ page }) => {
  await login(page, users.admin, /\/hostel-admin\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Manage Hostels' })).toBeVisible();

  await page.goto('/hostel-admin/dashboard/students');
  await expect(page).toHaveURL(/\/hostel-admin\/dashboard\/students$/);
  await expect(page.getByText('Students by Hostel')).toBeVisible();

  await page.goto('/hostel-admin/dashboard/reports');
  await expect(page).toHaveURL(/\/hostel-admin\/dashboard\/reports$/);
  await expect(page.getByText('Reports')).toBeVisible();

  await page.goto('/hostel-admin/dashboard/notifications');
  await expect(page).toHaveURL(/\/hostel-admin\/dashboard\/notifications$/);
  await expect(page.getByRole('heading', { name: 'Notifications Hub' })).toBeVisible();
});

test('warden dashboard routes render', async ({ page }) => {
  await login(page, users.warden, /\/warden\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Operational Overview' })).toBeVisible();

  await page.goto('/warden/dashboard/room-requests');
  await expect(page).toHaveURL(/\/warden\/dashboard\/room-requests$/);
  await expect(page.getByPlaceholder('Search room requests by student, room, or hostel...')).toBeVisible();

  await page.goto('/warden/dashboard/vacate-requests');
  await expect(page).toHaveURL(/\/warden\/dashboard\/vacate-requests$/);
  await expect(page.getByPlaceholder('Search vacate requests by student, room, hostel, or reason...')).toBeVisible();

  await page.goto('/warden/dashboard/students');
  await expect(page).toHaveURL(/\/warden\/dashboard\/students$/);
  await expect(page.getByPlaceholder('Search students by name, hostel or room...')).toBeVisible();
});

test('mess admin dashboard routes render', async ({ page }) => {
  await login(page, users.mess, /\/mess-admin\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Mess Dashboard Overview' })).toBeVisible();

  await page.goto('/mess-admin/menu');
  await expect(page).toHaveURL(/\/mess-admin\/menu$/);
  await expect(page.getByRole('heading', { name: 'Menu Management' })).toBeVisible();

  await page.goto('/mess-admin/students');
  await expect(page).toHaveURL(/\/mess-admin\/students$/);
  await expect(page.getByText('Mess Students')).toBeVisible();

  await page.goto('/mess-admin/reports');
  await expect(page).toHaveURL(/\/mess-admin\/reports$/);
  await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();

  await page.goto('/mess-admin/notifications');
  await expect(page).toHaveURL(/\/mess-admin\/notifications$/);
  await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
});