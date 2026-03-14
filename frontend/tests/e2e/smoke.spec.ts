import { test, expect, type Page } from "@playwright/test";

type Credentials = {
  email: string;
  apiKey: string;
};

function createCredentials(): Credentials {
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    email: `qa-${token}@example.com`,
    apiKey: `ipfs_gw_${token.replace(/[^a-z0-9]/gi, "")}`,
  };
}

async function mockAuthBackend(page: Page, credentials: Credentials) {
  let isAuthenticated = false;

  await page.route("**/api/v1/users/register", async (route) => {
    const payload = route.request().postDataJSON() as { email?: string } | null;
    const email = payload?.email ?? credentials.email;

    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        status: 201,
        message: "User registered successfully",
        data: {
          email,
          api_key: credentials.apiKey,
        },
      }),
    });
  });

  await page.route("**/api/auth/session", async (route) => {
    const method = route.request().method();

    if (method === "POST") {
      isAuthenticated = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: 200,
          data: {
            email: credentials.email,
            apiKeyStatus: "active",
            createdAt: "2026-03-13T09:00:00.000Z",
            lastRenewedAt: null,
            usageCount: 12,
          },
        }),
      });
      return;
    }

    if (method === "GET") {
      await route.fulfill({
        status: isAuthenticated ? 200 : 401,
        contentType: "application/json",
        body: JSON.stringify(
          isAuthenticated
            ? {
                status: 200,
                data: {
                  email: credentials.email,
                  apiKeyStatus: "active",
                  createdAt: "2026-03-13T09:00:00.000Z",
                  lastRenewedAt: null,
                  usageCount: 12,
                },
              }
            : {
                status: 401,
                message: "Authentication required",
              },
        ),
      });
      return;
    }

    if (method === "DELETE") {
      isAuthenticated = false;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: 200, message: "Session cleared" }),
      });
      return;
    }

    await route.continue();
  });

  await page.route("**/api/dashboard/overview", async (route) => {
    await route.fulfill({
      status: isAuthenticated ? 200 : 401,
      contentType: "application/json",
      body: JSON.stringify(
        isAuthenticated
          ? {
              status: 200,
              message: "Dashboard overview fetched",
              data: {
                account: {
                  email: credentials.email,
                  apiKeyStatus: "active",
                  createdAt: "2026-03-13T09:00:00.000Z",
                  lastRenewedAt: null,
                },
                usage: {
                  requestCount: 12,
                  fileCount: 2,
                  storageUsedBytes: 3072,
                },
                recentFiles: [],
                capabilities: {
                  renewApiKey: true,
                  revokeApiKey: true,
                  recentFilesAvailable: false,
                },
              },
            }
          : {
              status: 401,
              message: "Authentication required",
            },
      ),
    });
  });
}

async function loginWithApiKey(page: Page, credentials: Credentials) {
  await page.goto("/login");
  await page.locator("#login-email").fill(credentials.email);
  await page.locator("#apiKey").fill(credentials.apiKey);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("home page renders key sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Decentralized. Secure. Permanent." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "How it works" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Docs" }).first()).toBeVisible();
});

test("mobile navigation toggles", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Toggle navigation menu" });
  await expect(toggle).toBeVisible();
  await toggle.click();

  await page.locator("#mobile-nav a[href='/upload']").first().click({ force: true });
  await expect(page).toHaveURL(/\/login\?next=%2Fupload$/);
});

test("user can register and continue to dashboard", async ({ page }) => {
  const credentials = createCredentials();
  await mockAuthBackend(page, credentials);

  await page.goto("/register");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.locator("#password")).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Hide password" }).click();
  await expect(page.locator("#password")).toHaveAttribute("type", "password");

  await page.locator("#email").fill(credentials.email);
  await page.locator("#password").fill("StrongPass1!");
  await page.locator("#confirmPassword").fill("StrongPass1!");
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText("Your API key is ready")).toBeVisible();
  await expect(page.locator("code")).toContainText("ipfs_gw_");

  await page.getByRole("button", { name: "Go to Dashboard" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "User Dashboard" })).toBeVisible();
  await expect(page.getByText("Account Overview")).toBeVisible();
});

test("dashboard route redirects to login when unauthenticated", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Log in with your API key" })).toBeVisible();
});

test("user can login with API key and reach dashboard", async ({ page }) => {
  const credentials = createCredentials();
  await mockAuthBackend(page, credentials);

  await loginWithApiKey(page, credentials);

  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole("button", { name: "Logout" }).first().click();
  await expect(page).toHaveURL(/\/login/);

  await loginWithApiKey(page, credentials);
});

test("authenticated user can upload a file and see the CID", async ({ page }) => {
  const credentials = createCredentials();
  await mockAuthBackend(page, credentials);

  await page.route("**/api/upload", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        status: 201,
        message: "File uploaded successfully",
        data: {
          mode: "direct",
          cid: "bafy-playwright-cid",
          originalFilename: "playwright.txt",
          size: 11,
          uploadedAt: "2026-03-13T09:00:00.000Z",
        },
      }),
    });
  });

  await loginWithApiKey(page, credentials);

  await page.goto("/upload");
  await expect(page.getByRole("heading", { name: "Upload Files" })).toBeVisible();

  await page.locator('input[aria-label="Upload files"]').setInputFiles({
    name: "playwright.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("hello world"),
  });

  await page.getByRole("button", { name: "Show details" }).click();
  await expect(page.getByText("CID ready")).toBeVisible();
  await expect(page.getByText("bafy-playwright-cid").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy CID" })).toBeVisible();
});

test("authenticated user can browse files page and open details", async ({ page }) => {
  const credentials = createCredentials();
  await mockAuthBackend(page, credentials);

  let filesPayload = [
    {
      cid: "bafy-files-cid-1",
      original_filename: "doc-1.pdf",
      size: 2048,
      pinned: true,
      uploaded_at: "2026-03-13T09:30:00.000Z",
      content_type: "application/pdf",
    },
    {
      cid: "bafy-files-cid-2",
      original_filename: "image-2.png",
      size: 1024,
      pinned: false,
      uploaded_at: "2026-03-13T09:35:00.000Z",
      content_type: "image/png",
    },
  ];

  await page.route("**/api/files?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: 200,
        data: filesPayload,
        meta: {
          page: 1,
          page_size: 10,
          total: filesPayload.length,
          total_pages: 1,
          sort_by: "uploaded",
          sort_order: "desc",
          search: "",
          pinned: "all",
        },
      }),
    });
  });

  await page.route("**/api/files/bafy-files-cid-2", async (route) => {
    filesPayload = filesPayload.filter((file) => file.cid !== "bafy-files-cid-2");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: 200,
        message: "File deleted successfully",
      }),
    });
  });

  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  await loginWithApiKey(page, credentials);

  await page.goto("/files");
  await expect(page.getByRole("heading", { name: "My Files" })).toBeVisible();
  await expect(page.getByText("doc-1.pdf")).toBeVisible();

  await page.getByRole("button", { name: "Grid" }).click();
  await expect(page.getByText("image-2.png")).toBeVisible();

  await page.getByRole("button", { name: "Open details for doc-1.pdf" }).click();
  await expect(page.getByRole("dialog", { name: "File details drawer" })).toBeVisible();
  await expect(page.getByText("application/pdf")).toBeVisible();

  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Delete image-2.png" }).click();
  const confirmDialog = page.getByRole("dialog");
  await expect(confirmDialog).toBeVisible();
  await confirmDialog.getByRole("button", { exact: true, name: "Delete" }).click();
  await expect(page.getByRole("button", { name: "Open details for image-2.png" })).toHaveCount(0);
});
