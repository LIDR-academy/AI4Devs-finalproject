import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import type { User } from "@prisma/client";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";

describe("AuthService", () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const user: User = {
    id: "user-1",
    email: "user@example.com",
    password: bcrypt.hashSync("password123", 12),
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    jwtService = {
      sign: jest.fn().mockReturnValue("token-value"),
    } as unknown as jest.Mocked<JwtService>;

    service = new AuthService(usersService, jwtService);
  });

  it("registers a new user and returns a token", async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.createUser.mockResolvedValue(user);

    const result = await service.register({
      email: "USER@example.com",
      password: "password123",
    });

    expect(usersService.findByEmail).toHaveBeenCalledWith("user@example.com");
    expect(usersService.createUser).toHaveBeenCalled();
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: "user-1",
      email: "user@example.com",
    });
    expect(result.accessToken).toBe("token-value");
    expect(result.user.email).toBe("user@example.com");
  });

  it("throws conflict when email already exists", async () => {
    usersService.findByEmail.mockResolvedValue(user);

    await expect(
      service.register({
        email: "user@example.com",
        password: "password123",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("logs in with valid credentials", async () => {
    usersService.findByEmail.mockResolvedValue(user);

    const result = await service.login({
      email: "user@example.com",
      password: "password123",
    });

    expect(result.accessToken).toBe("token-value");
    expect(result.user.id).toBe("user-1");
  });

  it("throws unauthorized for invalid credentials", async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: "nobody@example.com",
        password: "password123",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("returns current user profile", async () => {
    usersService.findById.mockResolvedValue(user);

    const me = await service.me("user-1");

    expect(me).toEqual({
      id: "user-1",
      email: "user@example.com",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
  });

  it("throws unauthorized when me user does not exist", async () => {
    usersService.findById.mockResolvedValue(null);

    await expect(service.me("missing")).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
