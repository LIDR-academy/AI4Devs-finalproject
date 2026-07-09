using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Aura.Core.Interfaces.Services;

namespace Aura.Core.Services;

public class SlugGenerator : ISlugGenerator
{
    public string GenerateSlug(string input, int year)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        // 1. Remove diacritics
        var normalizedString = input.Normalize(NormalizationForm.FormD);
        var stringBuilder = new StringBuilder();

        foreach (var c in normalizedString)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }
        var noDiacritics = stringBuilder.ToString().Normalize(NormalizationForm.FormC);

        // 2. Convert to lowercase
        var lower = noDiacritics.ToLowerInvariant();

        // 3. Replace non-alphanumeric characters with hyphens
        var slug = Regex.Replace(lower, @"[^a-z0-9\s-]", "");

        // 4. Replace multiple spaces/hyphens with a single hyphen
        slug = Regex.Replace(slug, @"[\s-]+", " ").Trim();
        slug = Regex.Replace(slug, @"\s", "-");

        // 5. Append year
        return $"{slug}-{year}";
    }
}
