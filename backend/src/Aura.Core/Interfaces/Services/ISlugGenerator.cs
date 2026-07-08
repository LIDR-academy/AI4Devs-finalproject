namespace Aura.Core.Interfaces.Services;

public interface ISlugGenerator
{
    string GenerateSlug(string input, int year);
}
