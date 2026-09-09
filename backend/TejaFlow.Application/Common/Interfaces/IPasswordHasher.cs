namespace TejaFlow.Application.Common.Interfaces;

public interface IPasswordHasher
{
    bool Verify(string password, string passwordHash);
}

