import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import type { User } from "@prisma/client";
import type { MetricsService } from "../../common/metrics/metrics.service";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";

describe("AuthService", () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let metrics: jest.Mocked<Pick<MetricsService, "increment">>;

  const user: User = {
    id: "user-1",
    email: "user@example.com",
    password: bcrypt.hashSync("password123", 12),
    firstName: null,
    lastName: null,
    age: null,
    address: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
      findById: jest.fn(),
      updateProfile: jest.fn(),
      updatePassword: jest.fn(),
      deleteUser: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    jwtService = {
      sign: jest.fn().mockReturnValue("token-value"),
    } as unknown as jest.Mocked<JwtService>;

    metrics = { increment: jest.fn() };

    service = new AuthService(usersService, jwtService, metrics as unknown as MetricsService);
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

  it("increments login_success exactly once on a successful login", async () => {
    usersService.findByEmail.mockResolvedValue(user);

    await service.login({ email: "user@example.com", password: "password123" });

    expect(metrics.increment).toHaveBeenCalledTimes(1);
    expect(metrics.increment).toHaveBeenCalledWith("login_success");
  });

  it("increments login_failure exactly once for an unknown email", async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: "nobody@example.com", password: "password123" }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(metrics.increment).toHaveBeenCalledTimes(1);
    expect(metrics.increment).toHaveBeenCalledWith("login_failure");
  });

  it("increments login_failure exactly once for a wrong password", async () => {
    usersService.findByEmail.mockResolvedValue(user);

    await expect(
      service.login({ email: "user@example.com", password: "wrong-password" }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(metrics.increment).toHaveBeenCalledTimes(1);
    expect(metrics.increment).toHaveBeenCalledWith("login_failure");
  });

  it("returns current user profile", async () => {
    usersService.findById.mockResolvedValue(user);

    const me = await service.me("user-1");

    expect(me).toEqual({
      id: "user-1",
      email: "user@example.com",
      firstName: null,
      lastName: null,
      age: null,
      address: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
  });

  it("throws unauthorized when me user does not exist", async () => {
    usersService.findById.mockResolvedValue(null);

    await expect(service.me("missing")).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it("updates the profile and returns the same shape as me()", async () => {
    const updatedUser: User = { ...user, firstName: "Alex", lastName: "Garcia", age: 32, address: "Madrid, 28001, ES" };
    usersService.updateProfile.mockResolvedValue(updatedUser);

    const result = await service.updateProfile("user-1", {
      firstName: "Alex",
      lastName: "Garcia",
      age: 32,
      address: "Madrid, 28001, ES",
    });

    expect(usersService.updateProfile).toHaveBeenCalledWith("user-1", {
      firstName: "Alex",
      lastName: "Garcia",
      age: 32,
      address: "Madrid, 28001, ES",
    });
    expect(result).toEqual({
      id: "user-1",
      email: "user@example.com",
      firstName: "Alex",
      lastName: "Garcia",
      age: 32,
      address: "Madrid, 28001, ES",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
  });

  it("changes the password when the current password is correct", async () => {
    usersService.findById.mockResolvedValue(user);

    await service.changePassword("user-1", {
      currentPassword: "password123",
      newPassword: "newpassword456",
    });

    expect(usersService.updatePassword).toHaveBeenCalledTimes(1);
    const [calledUserId, calledHash] = usersService.updatePassword.mock.calls[0];
    expect(calledUserId).toBe("user-1");
    expect(await bcrypt.compare("newpassword456", calledHash)).toBe(true);
  });

  it("throws unauthorized when the current password is incorrect", async () => {
    usersService.findById.mockResolvedValue(user);

    await expect(
      service.changePassword("user-1", {
        currentPassword: "wrong-password",
        newPassword: "newpassword456",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(usersService.updatePassword).not.toHaveBeenCalled();
  });

  it("throws unauthorized when changing the password for a user that no longer exists", async () => {
    usersService.findById.mockResolvedValue(null);

    await expect(
      service.changePassword("missing", {
        currentPassword: "password123",
        newPassword: "newpassword456",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("deletes the account", async () => {
    await service.deleteAccount("user-1");

    expect(usersService.deleteUser).toHaveBeenCalledWith("user-1");
  });
});
