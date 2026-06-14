import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaService } from "../../database/prisma.service";
import { UsersService } from "../users/users.service";
import { HouseholdsService } from "./households.service";

const MOCK_USER_A = { id: "user-a", email: "a@example.com", password: "hashed", createdAt: new Date(), updatedAt: new Date() };
const MOCK_USER_B = { id: "user-b", email: "b@example.com", password: "hashed", createdAt: new Date(), updatedAt: new Date() };
const MOCK_HOUSEHOLD = {
  id: "hh-1",
  name: "Test House",
  createdByUserId: "user-a",
  createdAt: new Date(),
  updatedAt: new Date(),
};
const MOCK_MEMBER_OWNER = {
  id: "mem-1",
  householdId: "hh-1",
  userId: "user-a",
  role: "OWNER" as const,
  status: "ACTIVE" as const,
  joinedAt: new Date(),
  leftAt: null,
};
const MOCK_INVITATION_PENDING = {
  id: "inv-1",
  householdId: "hh-1",
  invitedByUserId: "user-a",
  inviteeEmail: "b@example.com",
  status: "PENDING" as const,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  respondedAt: null,
  createdAt: new Date(),
};

const makePrismaMock = () => ({
  household: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  householdMember: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
  },
  householdInvitation: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  $transaction: jest.fn(),
});

describe("HouseholdsService", () => {
  let service: HouseholdsService;
  let prismaMock: ReturnType<typeof makePrismaMock>;
  let usersServiceMock: { findById: jest.Mock; findByEmail: jest.Mock };

  beforeEach(async () => {
    prismaMock = makePrismaMock();
    usersServiceMock = { findById: jest.fn(), findByEmail: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        HouseholdsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: UsersService, useValue: usersServiceMock },
      ],
    }).compile();

    service = module.get(HouseholdsService);
  });

  describe("createHousehold", () => {
    it("creates household and adds requesting user as OWNER", async () => {
      usersServiceMock.findById.mockResolvedValue(MOCK_USER_A);
      prismaMock.householdMember.findFirst.mockResolvedValue(null);
      prismaMock.household.create.mockResolvedValue({
        ...MOCK_HOUSEHOLD,
        _count: { members: 1 },
      });

      const result = await service.createHousehold("user-a", "Test House");

      expect(result.role).toBe("OWNER");
      expect(result.memberCount).toBe(1);
      expect(prismaMock.household.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ createdByUserId: "user-a" }),
        }),
      );
    });

    it("throws ConflictException if user already has an active household", async () => {
      usersServiceMock.findById.mockResolvedValue(MOCK_USER_A);
      prismaMock.householdMember.findFirst.mockResolvedValue(MOCK_MEMBER_OWNER);

      await expect(service.createHousehold("user-a", "Another House")).rejects.toThrow(ConflictException);
    });
  });

  describe("createInvitation", () => {
    beforeEach(() => {
      usersServiceMock.findById.mockResolvedValue(MOCK_USER_A);
      prismaMock.household.findUnique.mockResolvedValue(MOCK_HOUSEHOLD);
      prismaMock.householdMember.findFirst
        .mockResolvedValueOnce(MOCK_MEMBER_OWNER) // owner check
        .mockResolvedValue(null);                  // already-member check
    });

    it("creates invitation with 7-day expiry", async () => {
      usersServiceMock.findByEmail.mockResolvedValue(MOCK_USER_B);
      prismaMock.householdInvitation.findFirst.mockResolvedValue(null);
      prismaMock.householdInvitation.create.mockResolvedValue(MOCK_INVITATION_PENDING);

      const result = await service.createInvitation("user-a", "hh-1", "b@example.com");

      expect(result.status).toBe("PENDING");
      expect(prismaMock.householdInvitation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ inviteeEmail: "b@example.com" }),
        }),
      );
    });

    it("throws NotFoundException when invitee is not a registered user", async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);

      await expect(service.createInvitation("user-a", "hh-1", "unknown@example.com")).rejects.toThrow(NotFoundException);
    });

    it("throws BadRequestException when inviting yourself", async () => {
      usersServiceMock.findByEmail.mockResolvedValue(MOCK_USER_A);

      await expect(service.createInvitation("user-a", "hh-1", "a@example.com")).rejects.toThrow(BadRequestException);
    });

    it("throws ConflictException when PENDING invitation already exists for email", async () => {
      usersServiceMock.findByEmail.mockResolvedValue(MOCK_USER_B);
      // reset to: owner check passes, no already-member, existing pending invitation
      prismaMock.householdMember.findFirst
        .mockResolvedValueOnce(MOCK_MEMBER_OWNER)
        .mockResolvedValue(null);
      prismaMock.householdInvitation.findFirst.mockResolvedValue(MOCK_INVITATION_PENDING);

      await expect(service.createInvitation("user-a", "hh-1", "b@example.com")).rejects.toThrow(ConflictException);
    });

    it("throws ForbiddenException when requester is not OWNER", async () => {
      prismaMock.householdMember.findFirst.mockReset();
      prismaMock.householdMember.findFirst.mockResolvedValue(null); // not owner — clears beforeEach queue

      await expect(service.createInvitation("user-a", "hh-1", "b@example.com")).rejects.toThrow(ForbiddenException);
    });
  });

  describe("acceptInvitation", () => {
    it("creates membership and marks invitation ACCEPTED in a transaction", async () => {
      usersServiceMock.findById.mockResolvedValue(MOCK_USER_B);
      prismaMock.householdInvitation.findUnique.mockResolvedValue(MOCK_INVITATION_PENDING);
      prismaMock.householdMember.findFirst.mockResolvedValue(null); // no existing household
      const newMember = { ...MOCK_MEMBER_OWNER, id: "mem-2", userId: "user-b", role: "MEMBER" };
      prismaMock.$transaction.mockResolvedValue([newMember, { ...MOCK_INVITATION_PENDING, status: "ACCEPTED" }]);

      const result = await service.acceptInvitation("user-b", "inv-1");

      expect(result.role).toBe("MEMBER");
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it("throws NotFoundException for unknown invitation", async () => {
      usersServiceMock.findById.mockResolvedValue(MOCK_USER_B);
      prismaMock.householdInvitation.findUnique.mockResolvedValue(null);

      await expect(service.acceptInvitation("user-b", "inv-x")).rejects.toThrow(NotFoundException);
    });

    it("throws ForbiddenException when invitation email does not match user email", async () => {
      usersServiceMock.findById.mockResolvedValue(MOCK_USER_A); // wrong user
      prismaMock.householdInvitation.findUnique.mockResolvedValue(MOCK_INVITATION_PENDING);

      await expect(service.acceptInvitation("user-a", "inv-1")).rejects.toThrow(ForbiddenException);
    });

    it("throws BadRequestException for expired invitation", async () => {
      usersServiceMock.findById.mockResolvedValue(MOCK_USER_B);
      prismaMock.householdInvitation.findUnique.mockResolvedValue({
        ...MOCK_INVITATION_PENDING,
        expiresAt: new Date(Date.now() - 1000),
      });
      prismaMock.householdInvitation.update.mockResolvedValue({});

      await expect(service.acceptInvitation("user-b", "inv-1")).rejects.toThrow(BadRequestException);
    });

    it("throws BadRequestException for already-accepted invitation", async () => {
      usersServiceMock.findById.mockResolvedValue(MOCK_USER_B);
      prismaMock.householdInvitation.findUnique.mockResolvedValue({
        ...MOCK_INVITATION_PENDING,
        status: "ACCEPTED",
      });

      await expect(service.acceptInvitation("user-b", "inv-1")).rejects.toThrow(BadRequestException);
    });

    it("throws ConflictException with HOUSEHOLD_TRANSFER_REQUIRED when user is OWNER in a multi-member household", async () => {
      usersServiceMock.findById.mockResolvedValue(MOCK_USER_B);
      prismaMock.householdInvitation.findUnique.mockResolvedValue(MOCK_INVITATION_PENDING);
      prismaMock.householdMember.findFirst.mockResolvedValue({
        ...MOCK_MEMBER_OWNER,
        userId: "user-b",
        role: "OWNER" as const,
        household: { ...MOCK_HOUSEHOLD, _count: { members: 2 } },
      });
      prismaMock.householdMember.findMany.mockResolvedValue([
        { ...MOCK_MEMBER_OWNER, userId: "user-c", user: { email: "c@example.com" } },
      ]);

      await expect(service.acceptInvitation("user-b", "inv-1")).rejects.toThrow(ConflictException);
    });

    it("auto-leaves solo household and accepts invitation", async () => {
      usersServiceMock.findById.mockResolvedValue(MOCK_USER_B);
      prismaMock.householdInvitation.findUnique.mockResolvedValue(MOCK_INVITATION_PENDING);
      prismaMock.householdMember.findFirst.mockResolvedValue({
        ...MOCK_MEMBER_OWNER,
        userId: "user-b",
        role: "OWNER" as const,
        household: { ...MOCK_HOUSEHOLD, _count: { members: 1 } },
      });
      prismaMock.householdMember.updateMany.mockResolvedValue({ count: 1 });
      const newMember = { ...MOCK_MEMBER_OWNER, id: "mem-2", userId: "user-b", role: "MEMBER" as const };
      prismaMock.$transaction.mockResolvedValue([newMember, { ...MOCK_INVITATION_PENDING, status: "ACCEPTED" }]);

      const result = await service.acceptInvitation("user-b", "inv-1");

      expect(result.role).toBe("MEMBER");
      expect(prismaMock.householdMember.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: "LEFT" }) }),
      );
    });

    it("auto-leaves multi-member household when user is a MEMBER (not OWNER)", async () => {
      usersServiceMock.findById.mockResolvedValue(MOCK_USER_B);
      prismaMock.householdInvitation.findUnique.mockResolvedValue(MOCK_INVITATION_PENDING);
      prismaMock.householdMember.findFirst.mockResolvedValue({
        ...MOCK_MEMBER_OWNER,
        userId: "user-b",
        role: "MEMBER" as const,
        household: { ...MOCK_HOUSEHOLD, _count: { members: 3 } },
      });
      prismaMock.householdMember.updateMany.mockResolvedValue({ count: 1 });
      const newMember = { ...MOCK_MEMBER_OWNER, id: "mem-2", userId: "user-b", role: "MEMBER" as const };
      prismaMock.$transaction.mockResolvedValue([newMember, { ...MOCK_INVITATION_PENDING, status: "ACCEPTED" }]);

      const result = await service.acceptInvitation("user-b", "inv-1");

      expect(result.role).toBe("MEMBER");
      expect(prismaMock.householdMember.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: "LEFT" }) }),
      );
    });
  });

  describe("listMembers", () => {
    it("returns ACTIVE members with their email", async () => {
      prismaMock.household.findUnique.mockResolvedValue(MOCK_HOUSEHOLD);
      prismaMock.householdMember.findFirst.mockResolvedValue(MOCK_MEMBER_OWNER);
      prismaMock.householdMember.findMany.mockResolvedValue([
        { ...MOCK_MEMBER_OWNER, user: { email: "a@example.com" } },
      ]);

      const result = await service.listMembers("user-a", "hh-1");

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe("a@example.com");
      expect(result[0].role).toBe("OWNER");
    });

    it("throws ForbiddenException for non-member", async () => {
      prismaMock.household.findUnique.mockResolvedValue(MOCK_HOUSEHOLD);
      prismaMock.householdMember.findFirst.mockResolvedValue(null);

      await expect(service.listMembers("user-x", "hh-1")).rejects.toThrow(ForbiddenException);
    });
  });
});
