namespace InkLink.Api.Application.Dtos;

public record LoginRequest(string Email, string Password);

public record UserSummaryDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string Role,
    string? AvatarUrl,
    Guid? ArtistProfileId);

public record LoginResponse(string Token, DateTime ExpiresAt, UserSummaryDto User);
