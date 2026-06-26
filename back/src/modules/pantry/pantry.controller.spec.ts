import { NotFoundException } from "@nestjs/common";
import { PantryController } from "./pantry.controller";

const userId = "user-1";

function makeRequest() {
  return { user: { id: userId, email: "user@example.com" } };
}

function createController() {
  const pantryServiceMock = {
    getExpiredCandidatesForUser: jest.fn(),
    bulkWasteItems: jest.fn(),
    bulkDismissExpired: jest.fn(),
  };
  const controller = new PantryController(pantryServiceMock as any);
  return { controller, pantryServiceMock };
}

describe("PantryController — expired-candidates endpoint", () => {
  it("returns the service view with items and digestId", async () => {
    const { controller, pantryServiceMock } = createController();
    const view = { items: [{ id: "a" }], digestId: "pending-1" };
    pantryServiceMock.getExpiredCandidatesForUser.mockResolvedValue(view);

    const result = await controller.getExpiredCandidates(makeRequest());

    expect(pantryServiceMock.getExpiredCandidatesForUser).toHaveBeenCalledWith(userId);
    expect(result).toBe(view);
  });

  it("returns an empty view when the service suppresses candidates", async () => {
    const { controller, pantryServiceMock } = createController();
    pantryServiceMock.getExpiredCandidatesForUser.mockResolvedValue({ items: [], digestId: null });

    const result = await controller.getExpiredCandidates(makeRequest());

    expect(result).toEqual({ items: [], digestId: null });
  });
});

describe("PantryController — bulk-waste endpoint", () => {
  it("delegates to bulkWasteItems for the authenticated user", async () => {
    const { controller, pantryServiceMock } = createController();
    const response = { wastedCount: 2, events: [] };
    pantryServiceMock.bulkWasteItems.mockResolvedValue(response);

    const result = await controller.bulkWaste(makeRequest(), { itemIds: ["a", "b"] });

    expect(pantryServiceMock.bulkWasteItems).toHaveBeenCalledWith(userId, ["a", "b"]);
    expect(result).toBe(response);
  });

  it("propagates NotFoundException for a foreign item (no cross-user waste)", async () => {
    const { controller, pantryServiceMock } = createController();
    pantryServiceMock.bulkWasteItems.mockRejectedValue(
      new NotFoundException({ message: "Pantry items not found", failedItemIds: ["b"] }),
    );

    await expect(controller.bulkWaste(makeRequest(), { itemIds: ["a", "b"] })).rejects.toThrow(
      NotFoundException,
    );
  });
});

describe("PantryController — bulk-dismiss-expired endpoint", () => {
  it("delegates to bulkDismissExpired for the authenticated user", async () => {
    const { controller, pantryServiceMock } = createController();
    pantryServiceMock.bulkDismissExpired.mockResolvedValue({ dismissedCount: 1 });

    const result = await controller.bulkDismissExpired(makeRequest(), { itemIds: ["a"] });

    expect(pantryServiceMock.bulkDismissExpired).toHaveBeenCalledWith(userId, ["a"]);
    expect(result).toEqual({ dismissedCount: 1 });
  });
});
