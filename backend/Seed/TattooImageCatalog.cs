namespace InkLink.Api.Seed;

/// <summary>
/// Curated Unsplash tattoo images aligned with the Figma prototype.
/// Source of truth: fixs/figma-images.yml
/// All images are from Unsplash (free license).
/// </summary>
public static class TattooImageCatalog
{
    private static string Unsplash(string photoId, int w = 600, int h = 720) =>
        $"https://images.unsplash.com/{photoId}?w={w}&h={h}&fit=crop&auto=format";

    /// <summary>
    /// 12 curated tattoo portfolio images from the Figma gallery base.
    /// Each artist gets a rotated view of this array so portfolios look different.
    /// </summary>
    public static readonly string[] GalleryBase =
    [
        "photo-1568515045052-f9a854d70bfd",   // 0  tradicional
        "photo-1597852075234-fd721ac361d3",   // 1  blackwork
        "photo-1565058379802-bbe93b2f703a",   // 2  japonés
        "photo-1643513456892-437e82e06f4a",   // 3  neotradicional
        "photo-1479767574301-a01c78234a0c",   // 4  fine-line
        "photo-1519822356-4853be4346a8",      // 5  realismo
        "photo-1724343163782-52276ca2e6c2",   // 6  acuarela
        "photo-1759247943101-f1b32bcc6a8b",   // 7  minimalista
        "photo-1561377455-190afb395ed7",      // 8  geométrico
        "photo-1588417490421-63d4e4175f95",   // 9  lettering
        "photo-1712432321375-226f466fff85",   // 10 dotwork
        "photo-1775135332562-9ff99e65a616",   // 11 extra tattoo
    ];

    /// <summary>One representative image per tattoo style (for style cards / popular styles).</summary>
    public static readonly IReadOnlyDictionary<string, string> StyleImage =
        new Dictionary<string, string>
        {
            ["realismo"] = "photo-1519822356-4853be4346a8",
            ["tradicional"] = "photo-1568515045052-f9a854d70bfd",
            ["blackwork"] = "photo-1597852075234-fd721ac361d3",
            ["fine-line"] = "photo-1479767574301-a01c78234a0c",
            ["japones"] = "photo-1565058379802-bbe93b2f703a",
            ["lettering"] = "photo-1588417490421-63d4e4175f95",
            ["neotradicional"] = "photo-1643513456892-437e82e06f4a",
            ["acuarela"] = "photo-1724343163782-52276ca2e6c2",
            ["geometrico"] = "photo-1561377455-190afb395ed7",
            ["minimalista"] = "photo-1759247943101-f1b32bcc6a8b",
            ["dotwork"] = "photo-1712432321375-226f466fff85",
            ["tribal"] = "photo-1607943917700-18ec6ff5a4c2",
        };

    /// <summary>
    /// Returns a portfolio image URL for a given artist index and item index.
    /// Uses the Figma rotation approach: each artist starts at a different offset
    /// in the gallery, so portfolios look unique even though they share the same pool.
    /// </summary>
    public static string GetPortfolioUrl(int artistIndex, int itemIndex, int w = 600, int h = 720)
    {
        var offset = artistIndex % GalleryBase.Length;
        var idx = (offset + itemIndex) % GalleryBase.Length;
        return Unsplash(GalleryBase[idx], w, h);
    }

    /// <summary>Returns the style representative image URL.</summary>
    public static string GetStyleUrl(string styleSlug, int w = 400, int h = 400)
    {
        return StyleImage.TryGetValue(styleSlug, out var photoId)
            ? Unsplash(photoId, w, h)
            : Unsplash(GalleryBase[Math.Abs(styleSlug.GetHashCode()) % GalleryBase.Length], w, h);
    }

    // Legacy compatibility — kept for any remaining callers
    public static readonly IReadOnlyDictionary<string, string[]> ByStyle =
        StyleImage.ToDictionary(
            kv => kv.Key,
            kv => new[] { Unsplash(kv.Value) }
        );

    public static string GetUrl(string styleSlug, int index)
    {
        return GetStyleUrl(styleSlug);
    }
}
