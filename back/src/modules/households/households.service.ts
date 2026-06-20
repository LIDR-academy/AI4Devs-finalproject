import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  Household,
  HouseholdInvitation,
  HouseholdMember,
} from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { UsersService } from "../users/users.service";

const INVITATION_EXPIRY_DAYS = 7;

export interface HouseholdWithRole {
  id: string;
  name: string;
  role: "OWNER" | "MEMBER";
  memberCount: number;
  createdAt: Date;
}

export interface MemberWithEmail {
  id: string;
  userId: string;
  email: string;
  role: "OWNER" | "MEMBER";
  joinedAt: Date;
}

@Injectable()
export class HouseholdsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async createHousehold(userId: string, name: string): Promise<HouseholdWithRole> {
    await this.assertUserExists(userId);

    const existing = await this.prisma.householdMember.findFirst({
      where: { userId, status: "ACTIVE" },
    });
    if (existing) {
      throw new ConflictException("User already belongs to an active household");
    }

    const household = await this.prisma.household.create({
      data: {
        name: name.trim(),
        createdByUserId: userId,
        members: {
          create: { userId, role: "OWNER", status: "ACTIVE" },
        },
      },
      include: { _count: { select: { members: { where: { status: "ACTIVE" } } } } },
    });

    return {
      id: household.id,
      name: household.name,
      role: "OWNER",
      memberCount: household._count.members,
      createdAt: household.createdAt,
    };
  }

  async getMyHousehold(userId: string): Promise<HouseholdWithRole | null> {
    await this.assertUserExists(userId);

    const membership = await this.prisma.householdMember.findFirst({
      where: { userId, status: "ACTIVE" },
      include: {
        household: {
          include: { _count: { select: { members: { where: { status: "ACTIVE" } } } } },
        },
      },
    });

    if (!membership) {
      return null;
    }

    return {
      id: membership.household.id,
      name: membership.household.name,
      role: membership.role as "OWNER" | "MEMBER",
      memberCount: membership.household._count.members,
      createdAt: membership.household.createdAt,
    };
  }

  async createInvitation(
    userId: string,
    householdId: string,
    inviteeEmail: string,
  ): Promise<HouseholdInvitation> {
    const household = await this.assertOwnerAccess(userId, householdId);

    const normalizedEmail = inviteeEmail.trim().toLowerCase();

    const invitee = await this.usersService.findByEmail(normalizedEmail);
    if (!invitee) {
      throw new NotFoundException(
        "MVP mode: email invitations are not sent. Please enter the email of a user already registered in this app",
      );
    }

    if (invitee.id === userId) {
      throw new BadRequestException("Cannot invite yourself");
    }

    const alreadyMember = await this.prisma.householdMember.findFirst({
      where: { householdId, userId: invitee.id, status: "ACTIVE" },
    });
    if (alreadyMember) {
      throw new ConflictException("User is already an active member of this household");
    }

    const existingPending = await this.prisma.householdInvitation.findFirst({
      where: { householdId, inviteeEmail: normalizedEmail, status: "PENDING" },
    });
    if (existingPending) {
      throw new ConflictException("A pending invitation already exists for this email");
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    return this.prisma.householdInvitation.create({
      data: {
        householdId: household.id,
        invitedByUserId: userId,
        inviteeEmail: normalizedEmail,
        expiresAt,
      },
    });
  }

  async listHouseholdInvitations(userId: string, householdId: string): Promise<HouseholdInvitation[]> {
    await this.assertMemberAccess(userId, householdId);

    return this.prisma.householdInvitation.findMany({
      where: { householdId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
  }

  async listPendingInvitationsForUser(userId: string): Promise<HouseholdInvitation[]> {
    const user = await this.assertUserExists(userId);

    await this.expireStaleInvitations(user.email);

    return this.prisma.householdInvitation.findMany({
      where: { inviteeEmail: user.email, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
  }

  async acceptInvitation(userId: string, invitationId: string): Promise<HouseholdMember> {
    const user = await this.assertUserExists(userId);

    const invitation = await this.prisma.householdInvitation.findUnique({
      where: { id: invitationId },
    });
    if (!invitation) {
      throw new NotFoundException("Invitation not found");
    }
    if (invitation.inviteeEmail !== user.email) {
      throw new ForbiddenException("This invitation was not sent to your email");
    }
    if (invitation.status !== "PENDING") {
      throw new BadRequestException(`Invitation is ${invitation.status.toLowerCase()}`);
    }
    if (invitation.expiresAt < new Date()) {
      await this.prisma.householdInvitation.update({
        where: { id: invitationId },
        data: { status: "EXPIRED" },
      });
      throw new BadRequestException("Invitation has expired");
    }

    const existingMembership = await this.prisma.householdMember.findFirst({
      where: { userId, status: "ACTIVE" },
      include: {
        household: {
          include: {
            _count: { select: { members: { where: { status: "ACTIVE" } } } },
          },
        },
      },
    });

    if (existingMembership) {
      const activeMemberCount = existingMembership.household._count.members;

      if (activeMemberCount === 1 || existingMembership.role === "MEMBER") {
        await this.leaveMembership(userId, existingMembership.householdId);
      } else {
        const otherMembers = await this.prisma.householdMember.findMany({
          where: {
            householdId: existingMembership.householdId,
            status: "ACTIVE",
            userId: { not: userId },
          },
          include: { user: { select: { email: true } } },
          orderBy: { joinedAt: "asc" },
        });

        throw new ConflictException({
          code: "HOUSEHOLD_TRANSFER_REQUIRED",
          currentHouseholdId: existingMembership.householdId,
          currentHouseholdName: existingMembership.household.name,
          members: otherMembers.map((m) => ({ userId: m.userId, email: m.user.email })),
        });
      }
    }

    const [member] = await this.prisma.$transaction([
      this.prisma.householdMember.create({
        data: {
          householdId: invitation.householdId,
          userId,
          role: "MEMBER",
          status: "ACTIVE",
        },
      }),
      this.prisma.householdInvitation.update({
        where: { id: invitationId },
        data: { status: "ACCEPTED", respondedAt: new Date() },
      }),
    ]);

    return member;
  }

  async transferOwnership(
    userId: string,
    householdId: string,
    newOwnerUserId: string,
  ): Promise<void> {
    await this.assertOwnerAccess(userId, householdId);

    if (newOwnerUserId === userId) {
      throw new BadRequestException("Cannot transfer ownership to yourself");
    }

    const newOwnerMembership = await this.prisma.householdMember.findFirst({
      where: { householdId, userId: newOwnerUserId, status: "ACTIVE" },
    });
    if (!newOwnerMembership) {
      throw new NotFoundException("New owner must be an active member of this household");
    }

    await this.prisma.$transaction([
      this.prisma.householdMember.updateMany({
        where: { householdId, userId, status: "ACTIVE" },
        data: { role: "MEMBER" },
      }),
      this.prisma.householdMember.updateMany({
        where: { householdId, userId: newOwnerUserId, status: "ACTIVE" },
        data: { role: "OWNER" },
      }),
    ]);
  }

  async listMembers(userId: string, householdId: string): Promise<MemberWithEmail[]> {
    await this.assertMemberAccess(userId, householdId);

    const members = await this.prisma.householdMember.findMany({
      where: { householdId, status: "ACTIVE" },
      include: { user: { select: { email: true } } },
      orderBy: { joinedAt: "asc" },
    });

    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      email: m.user.email,
      role: m.role as "OWNER" | "MEMBER",
      joinedAt: m.joinedAt,
    }));
  }

  /**
   * Returns the id of the user's active household, or null when the user does
   * not belong to any active household.
   */
  async getActiveHouseholdId(userId: string): Promise<string | null> {
    const membership = await this.prisma.householdMember.findFirst({
      where: { userId, status: "ACTIVE" },
      select: { householdId: true },
    });

    return membership?.householdId ?? null;
  }

  /**
   * Returns the set of user ids that share data with the given user. When the
   * user belongs to an active household this includes every active member;
   * otherwise it is just the user themselves. The caller's id is always
   * included so resources they own remain visible even without a household.
   */
  async getHouseholdMemberUserIds(userId: string): Promise<string[]> {
    const householdId = await this.getActiveHouseholdId(userId);
    if (!householdId) {
      return [userId];
    }

    const members = await this.prisma.householdMember.findMany({
      where: { householdId, status: "ACTIVE" },
      select: { userId: true },
    });

    const memberIds = new Set(members.map((member) => member.userId));
    memberIds.add(userId);
    return [...memberIds];
  }

  private async leaveMembership(userId: string, householdId: string): Promise<void> {
    await this.prisma.householdMember.updateMany({
      where: { householdId, userId, status: "ACTIVE" },
      data: { status: "LEFT", leftAt: new Date() },
    });
  }

  private async assertUserExists(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException("User not found");
    }
    return user;
  }

  private async assertMemberAccess(userId: string, householdId: string): Promise<HouseholdMember> {
    const household = await this.prisma.household.findUnique({ where: { id: householdId } });
    if (!household) {
      throw new NotFoundException("Household not found");
    }
    const membership = await this.prisma.householdMember.findFirst({
      where: { householdId, userId, status: "ACTIVE" },
    });
    if (!membership) {
      throw new ForbiddenException("No access to this household");
    }
    return membership;
  }

  private async assertOwnerAccess(userId: string, householdId: string): Promise<Household> {
    const household = await this.prisma.household.findUnique({ where: { id: householdId } });
    if (!household) {
      throw new NotFoundException("Household not found");
    }
    const membership = await this.prisma.householdMember.findFirst({
      where: { householdId, userId, status: "ACTIVE", role: "OWNER" },
    });
    if (!membership) {
      throw new ForbiddenException("Only the household owner can perform this action");
    }
    return household;
  }

  private async expireStaleInvitations(email: string): Promise<void> {
    await this.prisma.householdInvitation.updateMany({
      where: {
        inviteeEmail: email,
        status: "PENDING",
        expiresAt: { lt: new Date() },
      },
      data: { status: "EXPIRED" },
    });
  }
}
