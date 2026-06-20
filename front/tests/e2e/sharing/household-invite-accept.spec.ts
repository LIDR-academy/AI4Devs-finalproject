import { expect, test } from "@playwright/test";
import {
  acceptInvitation,
  createHousehold,
  createPantryItem,
  registerUser,
  seedSession,
  sendInvitation,
} from "./_helpers";

const FRONT_BASE_URL = process.env.E2E_FRONT_BASE_URL ?? "http://localhost:5173";

// ── Acceptance Criteria mapping ──────────────────────────────────────────────
// AC1: User can invite another user by email
// AC2: Invitee can accept and join household
// AC3: Shared pantry data is visible to both users
// ── Access Control
// AC_X1: Users outside the household cannot access shared household resources
// AC_X2: Invalid invitation actions are rejected appropriately

// ── AC1: Household invitation flow ──────────────────────────────────────────

test.describe("AC1 — Household invitation flow", () => {
  test("User A creates a household and invites User B, invitation appears in pending state", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const userA = await registerUser(request, `pw.tkt008.a.${ts}@sharing-e2e.example.com`);
    await registerUser(request, `pw.tkt008.b.${ts}@sharing-e2e.example.com`);

    const household = await createHousehold(request, userA.accessToken, "AC1 House");

    await sendInvitation(
      request,
      userA.accessToken,
      household.id,
      `pw.tkt008.b.${ts}@sharing-e2e.example.com`,
    );

    await seedSession(page, userA);
    await page.goto(`${FRONT_BASE_URL}/sharing`);

    // User A sees the household name displayed
    await expect(page.getByTestId("sharing-household-name")).toContainText("AC1 House");

    // User A sees the pending invitation in the list
    await expect(page.getByTestId("sharing-pending-invitations")).toBeVisible();
    await expect(page.getByTestId("sharing-pending-invitations")).toContainText(
      `pw.tkt008.b.${ts}@sharing-e2e.example.com`,
    );
  });

  test("User A can send invitation via the UI invite form", async ({ page, request }) => {
    const ts = Date.now();
    const userA = await registerUser(request, `pw.tkt008.ui-a.${ts}@sharing-e2e.example.com`);
    await registerUser(request, `pw.tkt008.ui-b.${ts}@sharing-e2e.example.com`);
    const household = await createHousehold(request, userA.accessToken, "UI House");
    void household;

    await seedSession(page, userA);
    await page.goto(`${FRONT_BASE_URL}/sharing`);

    // Invite form is visible
    await expect(page.getByTestId("sharing-invite-email-input")).toBeVisible();

    await page.getByTestId("sharing-invite-email-input").fill(
      `pw.tkt008.ui-b.${ts}@sharing-e2e.example.com`,
    );
    await page.getByTestId("sharing-invite-submit").click();

    // Invitation appears in the pending list
    await expect(page.getByTestId("sharing-pending-invitations")).toBeVisible();
    await expect(page.getByTestId("sharing-pending-invitations")).toContainText(
      `pw.tkt008.ui-b.${ts}@sharing-e2e.example.com`,
    );
  });
});

// ── AC2: Invitation acceptance flow ─────────────────────────────────────────

test.describe("AC2 — Invitation acceptance flow", () => {
  test("User B sees pending invitation and accepts it, becoming a MEMBER", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const userA = await registerUser(request, `pw.tkt008.ac2-a.${ts}@sharing-e2e.example.com`);
    const userB = await registerUser(request, `pw.tkt008.ac2-b.${ts}@sharing-e2e.example.com`);
    const household = await createHousehold(request, userA.accessToken, "AC2 House");
    await sendInvitation(request, userA.accessToken, household.id, userB.user.email);

    await seedSession(page, userB);
    await page.goto(`${FRONT_BASE_URL}/sharing`);

    // User B sees an incoming invitation
    await expect(page.getByTestId("sharing-incoming-invitations")).toBeVisible();

    // Find and click the accept button
    const acceptButton = page.locator("[data-testid^='sharing-accept-invitation-']").first();
    await expect(acceptButton).toBeVisible();
    await acceptButton.click();

    // After accepting: the household member list should appear with User B in it
    await expect(page.getByTestId("sharing-members-list")).toBeVisible();
    await expect(page.getByTestId("sharing-members-list")).toContainText(userB.user.email);
    await expect(page.getByTestId("sharing-members-list")).toContainText(userA.user.email);

    // The incoming invitations section should be gone
    await expect(page.getByTestId("sharing-incoming-invitations")).not.toBeVisible();
  });
});

// ── AC3: Shared pantry visibility ────────────────────────────────────────────

test.describe("AC3 — Shared pantry visibility", () => {
  test("User B can see User A pantry items after accepting household invitation", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const userA = await registerUser(request, `pw.tkt008.ac3-a.${ts}@sharing-e2e.example.com`);
    const userB = await registerUser(request, `pw.tkt008.ac3-b.${ts}@sharing-e2e.example.com`);

    // User A creates household, adds a pantry item
    const household = await createHousehold(request, userA.accessToken, "AC3 House");
    await createPantryItem(request, userA.accessToken, "Shared Avocado");

    // Invite and accept
    const inv = await sendInvitation(request, userA.accessToken, household.id, userB.user.email);
    await acceptInvitation(request, userB.accessToken, inv.id);

    // User B visits pantry — should see User A's item
    await seedSession(page, userB);
    await page.goto(`${FRONT_BASE_URL}/pantry`);

    await expect(page.getByText("Shared Avocado")).toBeVisible();
  });

  test("User A can see items added by User B after both are in the same household", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const userA = await registerUser(request, `pw.tkt008.ac3-aa.${ts}@sharing-e2e.example.com`);
    const userB = await registerUser(request, `pw.tkt008.ac3-bb.${ts}@sharing-e2e.example.com`);

    const household = await createHousehold(request, userA.accessToken, "AC3b House");
    const inv = await sendInvitation(request, userA.accessToken, household.id, userB.user.email);
    await acceptInvitation(request, userB.accessToken, inv.id);

    // User B adds an item AFTER joining
    await createPantryItem(request, userB.accessToken, "Member Spinach");

    // User A visits pantry — should see User B's item
    await seedSession(page, userA);
    await page.goto(`${FRONT_BASE_URL}/pantry`);

    await expect(page.getByText("Member Spinach")).toBeVisible();
  });
});

// ── Refresh button behavior (AC3 — data consistency without UI actions) ──────

test.describe("Refresh button", () => {
  test("Refresh button reloads sharing data after member joins via API without any UI action", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const userA = await registerUser(request, `pw.tkt008.ref-a.${ts}@sharing-e2e.example.com`);
    const userB = await registerUser(request, `pw.tkt008.ref-b.${ts}@sharing-e2e.example.com`);
    const household = await createHousehold(request, userA.accessToken, "Refresh House");

    // User A navigates to sharing page — only themselves visible
    await seedSession(page, userA);
    await page.goto(`${FRONT_BASE_URL}/sharing`);

    await expect(page.getByTestId("sharing-refresh-button")).toBeVisible();
    await expect(page.getByTestId("sharing-members-list")).toContainText(userA.user.email);
    await expect(page.getByTestId("sharing-members-list")).not.toContainText(userB.user.email);

    // User B joins via API (no UI interaction from User A)
    const inv = await sendInvitation(request, userA.accessToken, household.id, userB.user.email);
    await acceptInvitation(request, userB.accessToken, inv.id);

    // Page still shows stale state — User B is not visible yet
    await expect(page.getByTestId("sharing-members-list")).not.toContainText(userB.user.email);

    // User A clicks Refresh
    await page.getByTestId("sharing-refresh-button").click();

    // After refresh: User B appears in the members list
    await expect(page.getByTestId("sharing-members-list")).toContainText(userB.user.email);
    await expect(page.getByTestId("sharing-members-list")).toContainText(userA.user.email);

    // Pending invitations section is gone (invitation accepted)
    await expect(page.getByTestId("sharing-pending-invitations")).not.toBeVisible();
  });
});

// ── Error feedback — invite form validation ───────────────────────────────────

test.describe("Invite form error feedback", () => {
  test("Shows error message when inviting an unregistered email via the UI", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const userA = await registerUser(request, `pw.tkt008.err-a.${ts}@sharing-e2e.example.com`);
    await createHousehold(request, userA.accessToken, "Error House");

    await seedSession(page, userA);
    await page.goto(`${FRONT_BASE_URL}/sharing`);

    await expect(page.getByTestId("sharing-invite-email-input")).toBeVisible();
    await page.getByTestId("sharing-invite-email-input").fill(`ghost.${ts}@nonexistent.example.com`);
    await page.getByTestId("sharing-invite-submit").click();

    // Error banner must appear with the MVP-mode message
    await expect(page.getByTestId("sharing-error")).toBeVisible();
    await expect(page.getByTestId("sharing-error")).toContainText("MVP mode");

    // No invitation should appear in the pending list
    await expect(page.getByTestId("sharing-pending-invitations")).not.toBeVisible();
  });
});

// ── Household leave/transfer on invitation acceptance ────────────────────────

test.describe("Household transfer — solo leave", () => {
  test("User with a solo household auto-leaves when accepting an invitation", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const userA = await registerUser(request, `pw.tkt008.solo-a.${ts}@sharing-e2e.example.com`);
    const userB = await registerUser(request, `pw.tkt008.solo-b.${ts}@sharing-e2e.example.com`);

    // User A owns a solo household; User B has their own household and invites User A
    await createHousehold(request, userA.accessToken, "Solo House A");
    const hhB = await createHousehold(request, userB.accessToken, "House B");
    const inv = await sendInvitation(request, userB.accessToken, hhB.id, userA.user.email);
    void inv;

    await seedSession(page, userA);
    await page.goto(`${FRONT_BASE_URL}/sharing`);

    // User A sees the incoming invitation
    await expect(page.getByTestId("sharing-incoming-invitations")).toBeVisible();

    // User A accepts — should auto-leave Solo House A and join House B
    const acceptBtn = page.locator("[data-testid^='sharing-accept-invitation-']").first();
    await acceptBtn.click();

    // No ownership transfer dialog
    await expect(page.getByTestId("sharing-transfer-ownership-section")).not.toBeVisible();

    // User A is now a member of House B
    await expect(page.getByTestId("sharing-household-name")).toContainText("House B");
    await expect(page.getByTestId("sharing-members-list")).toContainText(userA.user.email);
    await expect(page.getByTestId("sharing-members-list")).toContainText(userB.user.email);
  });
});

test.describe("Household transfer — owner with other members", () => {
  test("User who is OWNER in a multi-member household sees transfer UI when accepting an invitation", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const userA = await registerUser(request, `pw.tkt008.trf-a.${ts}@sharing-e2e.example.com`);
    const userB = await registerUser(request, `pw.tkt008.trf-b.${ts}@sharing-e2e.example.com`);
    const userC = await registerUser(request, `pw.tkt008.trf-c.${ts}@sharing-e2e.example.com`);

    // User A owns a household with User C also in it
    const hhA = await createHousehold(request, userA.accessToken, "House A");
    const invC = await sendInvitation(request, userA.accessToken, hhA.id, userC.user.email);
    await acceptInvitation(request, userC.accessToken, invC.id);

    // User B creates a household and invites User A
    const hhB = await createHousehold(request, userB.accessToken, "House B");
    await sendInvitation(request, userB.accessToken, hhB.id, userA.user.email);

    await seedSession(page, userA);
    await page.goto(`${FRONT_BASE_URL}/sharing`);

    // User A sees the incoming invitation
    await expect(page.getByTestId("sharing-incoming-invitations")).toBeVisible();

    // User A tries to accept — transfer UI must appear
    const acceptBtn = page.locator("[data-testid^='sharing-accept-invitation-']").first();
    await acceptBtn.click();

    await expect(page.getByTestId("sharing-transfer-ownership-section")).toBeVisible();
    await expect(page.getByTestId("sharing-transfer-ownership-section")).toContainText("House A");

    // User A selects User C as new owner
    await page.getByTestId(`sharing-transfer-owner-${userC.user.id}`).click();

    // After transfer + join: User A is in House B
    await expect(page.getByTestId("sharing-transfer-ownership-section")).not.toBeVisible();
    await expect(page.getByTestId("sharing-household-name")).toContainText("House B");
    await expect(page.getByTestId("sharing-members-list")).toContainText(userA.user.email);
    await expect(page.getByTestId("sharing-members-list")).toContainText(userB.user.email);
  });
});

// ── Access control validation ────────────────────────────────────────────────

test.describe("Access control", () => {
  test("User without a household sees the create-household prompt", async ({ page, request }) => {
    const ts = Date.now();
    const userC = await registerUser(request, `pw.tkt008.ac-c.${ts}@sharing-e2e.example.com`);

    await seedSession(page, userC);
    await page.goto(`${FRONT_BASE_URL}/sharing`);

    await expect(page.getByTestId("sharing-no-household")).toBeVisible();
    await expect(page.getByTestId("sharing-create-household-button")).toBeVisible();
  });

  test("User can create household via the UI create-household form", async ({ page, request }) => {
    const ts = Date.now();
    const userD = await registerUser(request, `pw.tkt008.ac-d.${ts}@sharing-e2e.example.com`);

    await seedSession(page, userD);
    await page.goto(`${FRONT_BASE_URL}/sharing`);

    await expect(page.getByTestId("sharing-no-household")).toBeVisible();
    await page.getByTestId("sharing-household-name-input").fill("My Home");
    await page.getByTestId("sharing-create-household-button").click();

    // After creation: invite form is now visible
    await expect(page.getByTestId("sharing-invite-email-input")).toBeVisible();
    await expect(page.getByTestId("sharing-household-name")).toContainText("My Home");
  });

  test("Invitation cannot be accepted twice", async ({ page, request }) => {
    const ts = Date.now();
    const userA = await registerUser(request, `pw.tkt008.dup-a.${ts}@sharing-e2e.example.com`);
    const userB = await registerUser(request, `pw.tkt008.dup-b.${ts}@sharing-e2e.example.com`);
    const household = await createHousehold(request, userA.accessToken, "Dup House");
    const inv = await sendInvitation(request, userA.accessToken, household.id, userB.user.email);
    await acceptInvitation(request, userB.accessToken, inv.id);

    // Attempt second accept via API — should fail
    const res = await request.post(
      `${process.env.E2E_API_BASE_URL ?? "http://localhost:3000/api"}/invitations/${inv.id}/accept`,
      { headers: { Authorization: `Bearer ${userB.accessToken}` } },
    );
    expect(res.status()).toBe(400);

    // UI: User B sees household page (already a member)
    await seedSession(page, userB);
    await page.goto(`${FRONT_BASE_URL}/sharing`);
    await expect(page.getByTestId("sharing-members-list")).toBeVisible();
    await expect(page.getByTestId("sharing-incoming-invitations")).not.toBeVisible();
  });
});
