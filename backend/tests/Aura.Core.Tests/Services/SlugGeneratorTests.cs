using Aura.Core.Services;
using FluentAssertions;
using Xunit;

namespace Aura.Core.Tests.Services;

public class SlugGeneratorTests
{
    private readonly SlugGenerator _sut;

    public SlugGeneratorTests()
    {
        _sut = new SlugGenerator();
    }

    [Theory]
    [InlineData("My Wedding", 2024, "my-wedding-2024")]
    [InlineData("Pedro & Maria's Big Day!", 2025, "pedro-marias-big-day-2025")]
    [InlineData("  Lots   of    spaces   ", 2026, "lots-of-spaces-2026")]
    [InlineData("Café delà Maríañón", 2024, "cafe-dela-marianon-2024")]
    [InlineData("---weird---event---", 2024, "weird-event-2024")]
    public void GenerateSlug_ShouldReturnFormattedSlug(string input, int year, string expected)
    {
        // Act
        var result = _sut.GenerateSlug(input, year);

        // Assert
        result.Should().Be(expected);
    }
}
