import { UsersService } from "./users.service";

function makePrismaMock() {
  return {
    user: {
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as any;
}

describe("UsersService.updateProfile", () => {
  it("updates only the provided fields via prisma.user.update", async () => {
    const prisma = makePrismaMock();
    const updatedUser = { id: "user-1", firstName: "Alex", lastName: "Garcia" };
    prisma.user.update.mockResolvedValue(updatedUser);
    const service = new UsersService(prisma);

    const result = await service.updateProfile("user-1", { firstName: "Alex", lastName: "Garcia" });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { firstName: "Alex", lastName: "Garcia" },
    });
    expect(result).toBe(updatedUser);
  });

  it("passes age and address through unchanged when provided", async () => {
    const prisma = makePrismaMock();
    prisma.user.update.mockResolvedValue({});
    const service = new UsersService(prisma);

    await service.updateProfile("user-1", { age: 32, address: "Madrid, 28001, ES" });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { age: 32, address: "Madrid, 28001, ES" },
    });
  });

  it("only includes fields that were actually passed (partial update)", async () => {
    const prisma = makePrismaMock();
    prisma.user.update.mockResolvedValue({});
    const service = new UsersService(prisma);

    await service.updateProfile("user-1", { age: 33 });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { age: 33 },
    });
  });
});

describe("UsersService.updatePassword", () => {
  it("updates the password hash via prisma.user.update", async () => {
    const prisma = makePrismaMock();
    const updatedUser = { id: "user-1", password: "new-hash" };
    prisma.user.update.mockResolvedValue(updatedUser);
    const service = new UsersService(prisma);

    const result = await service.updatePassword("user-1", "new-hash");

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { password: "new-hash" },
    });
    expect(result).toBe(updatedUser);
  });
});

describe("UsersService.deleteUser", () => {
  it("deletes the user via prisma.user.delete", async () => {
    const prisma = makePrismaMock();
    prisma.user.delete.mockResolvedValue({ id: "user-1" });
    const service = new UsersService(prisma);

    await service.deleteUser("user-1");

    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "user-1" } });
  });
});
