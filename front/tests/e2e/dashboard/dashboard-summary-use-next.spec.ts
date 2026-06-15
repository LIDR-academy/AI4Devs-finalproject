import { expect, test } from "@playwright/test";
import {
  createAndGetPantryItem,
  registerUser,
  seedSession,
} from "../notifications/_helpers";

const FRONT_BASE_URL = process.env.E2E_FRONT_BASE_URL ?? "http://localhost:5173";

test.describe("Dashboard summary and use-next", () => {
  test("shows summary counts, deterministic ordering, and refreshes after consume/waste events", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(
      request,
      `pw.tkt007.${ts}@dashboard-e2e.example.com`,
    );

    const itemA = await createAndGetPantryItem(request, auth.accessToken, "Milk", 1);
    await createAndGetPantryItem(request, auth.accessToken, "Yogurt", 2);
    const itemC = await createAndGetPantryItem(request, auth.accessToken, "Rice", 7);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/insights`);

    await expect(page.getByTestId("dashboard-active-items")).toContainText("3");
    await expect(page.getByTestId("dashboard-expiring-items")).toContainText("2");

    await expect(page.getByTestId("dashboard-use-next-list")).toBeVisible();
    await expect(page.getByTestId("dashboard-use-next-item-0")).toContainText("Milk");
    await expect(page.getByTestId("dashboard-use-next-item-1")).toContainText("Yogurt");
    await expect(page.getByTestId("dashboard-use-next-item-2")).toContainText("Rice");

    await page.getByTestId(`dashboard-use-next-consume-${itemA.id}`).click();

    await expect(page.getByTestId("dashboard-active-items")).toContainText("2");
    await expect(page.getByTestId("dashboard-use-next-list")).toContainText("Yogurt");
    await expect(page.getByTestId("dashboard-use-next-list")).toContainText("Rice");
    await expect(page.getByTestId("dashboard-use-next-list")).not.toContainText("Milk");

    await page.getByTestId(`dashboard-use-next-waste-${itemC.id}`).click();

    await expect(page.getByTestId("dashboard-active-items")).toContainText("1");
    await expect(page.getByTestId("dashboard-use-next-list")).toContainText("Yogurt");
    await expect(page.getByTestId("dashboard-use-next-list")).not.toContainText("Rice");
  });

  test("refresh button reloads dashboard data after backend changes without item actions", async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const ts = Date.now();
    const auth = await registerUser(
      request,
      `pw.tkt007.refresh.${ts}@dashboard-e2e.example.com`,
    );

    await createAndGetPantryItem(request, auth.accessToken, "Bread", 5);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/insights`);

    await expect(page.getByTestId("dashboard-refresh-button")).toBeVisible();
    await expect(page.getByTestId("dashboard-active-items")).toContainText("1");
    await expect(page.getByTestId("dashboard-expiring-items")).toContainText("0");
    await expect(page.getByTestId("dashboard-use-next-item-0")).toContainText("Bread");

    await createAndGetPantryItem(request, auth.accessToken, "Spinach", 1);

    await expect(page.getByTestId("dashboard-active-items")).toContainText("1");
    await expect(page.getByTestId("dashboard-use-next-list")).not.toContainText("Spinach");

    await page.getByTestId("dashboard-refresh-button").click();

    await expect(page.getByTestId("dashboard-active-items")).toContainText("2");
    await expect(page.getByTestId("dashboard-expiring-items")).toContainText("1");
    await expect(page.getByTestId("dashboard-use-next-item-0")).toContainText("Spinach");
    await expect(page.getByTestId("dashboard-use-next-list")).toContainText("Bread");
  });
});
