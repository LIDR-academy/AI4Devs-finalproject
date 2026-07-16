namespace InkLink.Api.Seed;

/// <summary>
/// Real tattoo portfolio images sourced from Wikimedia Commons and Flickr.
/// All images use open licenses (CC BY, CC BY-SA, CC BY-NC-ND, CC BY-NC-SA, Public Domain).
/// Source file: docs/tattoo-styles.yml
/// </summary>
public static class TattooImageCatalog
{
    // Keyed by style slug — matches TattooStyle.Slug in the database
    public static readonly IReadOnlyDictionary<string, string[]> ByStyle =
        new Dictionary<string, string[]>
        {
            ["blackwork"] =
            [
                "https://upload.wikimedia.org/wikipedia/commons/3/3e/Dragon_blackwork_tattoo.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/b/b6/Dom_Carter_Blackwork_Owl_Tattoo.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/3/33/Dom_Carter_Butterfly_Blackwork_Tattoo.jpg",
                "https://live.staticflickr.com/3535/5795678761_36bc8c2a91_b.jpg",
                "https://live.staticflickr.com/5042/5642592703_48cb485a8b_b.jpg",
                "https://live.staticflickr.com/3585/3451705879_372f73e785.jpg",
                "https://live.staticflickr.com/8060/8173708935_a86deaf05b.jpg",
                "https://live.staticflickr.com/8432/7695321490_6078bbc2dc.jpg",
                "https://live.staticflickr.com/4146/5048594242_2aeeb29b21_b.jpg",
                "https://live.staticflickr.com/3259/2344961481_30ebf36c95_b.jpg",
                "https://live.staticflickr.com/8454/7981679453_5b7c87a57e.jpg",
                "https://live.staticflickr.com/7416/10812415383_96886e92c5_b.jpg",
            ],
            ["realismo"] =
            [
                "https://live.staticflickr.com/3034/2986413447_ed3b49411b_b.jpg",
                "https://live.staticflickr.com/4112/5176658133_b9dabf97e4_b.jpg",
                "https://live.staticflickr.com/7339/11283707906_4364969453_b.jpg",
                "https://live.staticflickr.com/8515/8598546513_6629f47e86_b.jpg",
                "https://live.staticflickr.com/3713/10698826105_de53d8b4df_b.jpg",
                "https://live.staticflickr.com/3215/2434452100_0e8b1c2ed3_b.jpg",
                "https://live.staticflickr.com/8703/17176382855_9d6050818c.jpg",
                "https://live.staticflickr.com/5522/10699148513_3d3d4a7173_b.jpg",
                "https://live.staticflickr.com/7617/16553963334_75a166665f.jpg",
                "https://live.staticflickr.com/7608/16988857120_1430b736de.jpg",
                "https://live.staticflickr.com/8783/17176388735_db5e6ed7d3.jpg",
                "https://live.staticflickr.com/7707/16968979957_ee8e2119a7_b.jpg",
            ],
            ["tradicional"] =
            [
                "https://live.staticflickr.com/181/393321350_f38c3eecfc_b.jpg",
                "https://live.staticflickr.com/184/393322331_a5b56f1513_b.jpg",
                "https://live.staticflickr.com/164/393322388_fc6af0da90_b.jpg",
                "https://live.staticflickr.com/8439/7864251600_32c311b5f5_b.jpg",
                "https://live.staticflickr.com/5314/5910452678_a4d2768260_b.jpg",
                "https://live.staticflickr.com/7612/16188505654_ef73373d84_b.jpg",
                "https://live.staticflickr.com/138/333752449_55a781df2a_b.jpg",
                "https://live.staticflickr.com/169/393321978_5938097b11_b.jpg",
                "https://live.staticflickr.com/128/333752291_8be45f0beb_b.jpg",
            ],
            ["japones"] =
            [
                "https://live.staticflickr.com/2707/4408659111_d4dc1ab29d.jpg",
                "https://live.staticflickr.com/4354/35978582293_36cd977e24_b.jpg",
                "https://live.staticflickr.com/6155/6157571112_5ba3682e7a_b.jpg",
                "https://live.staticflickr.com/3145/2698307306_f2cdd10735_b.jpg",
                "https://live.staticflickr.com/6069/6157579956_e083b86499_b.jpg",
                "https://live.staticflickr.com/6083/6157576548_2bce7016c4_b.jpg",
                "https://live.staticflickr.com/89/276954073_2c32746294_b.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/0/00/Japanese_Tattoo_Art.jpg",
                "https://mdc.csuc.cat/iiif/2/fotografiesBC:26/full/730,/0/default.jpg",
            ],
            ["lettering"] =
            [
                "https://upload.wikimedia.org/wikipedia/commons/5/5a/Corpus_Vile.JPG",
                "https://live.staticflickr.com/5477/10542508985_ec7e37d67f_b.jpg",
                "https://live.staticflickr.com/8158/7572572346_0493f66ae5.jpg",
                "https://live.staticflickr.com/4537/38466424566_032694c7b8.jpg",
                "https://live.staticflickr.com/2170/2217766172_6b1831380d.jpg",
                "https://live.staticflickr.com/3286/3115651429_e7993a34cd.jpg",
                "https://live.staticflickr.com/3392/4557406844_7c9cdcc942_b.jpg",
                "https://live.staticflickr.com/130/391444472_b97fd0c45b_b.jpg",
            ],
            ["neotradicional"] =
            [
                "https://live.staticflickr.com/2942/15148818028_93b487b9c5.jpg",
                "https://live.staticflickr.com/7420/13093750835_89c5b40388_b.jpg",
                "https://live.staticflickr.com/7661/17477843263_a95f39e05b.jpg",
                "https://live.staticflickr.com/7310/13093869503_3811785e60_b.jpg",
                "https://live.staticflickr.com/3752/13613607654_2016527b0e.jpg",
                "https://live.staticflickr.com/2898/13658382034_e149a5f74f.jpg",
                "https://live.staticflickr.com/5195/14278286312_2427e89a3d_b.jpg",
                "https://live.staticflickr.com/7353/13938761489_cec6607b03.jpg",
            ],
            ["acuarela"] =
            [
                "https://live.staticflickr.com/585/32110380483_1ac4d6e2bb_b.jpg",
                "https://live.staticflickr.com/8363/29193676035_6823a0d215_b.jpg",
                "https://live.staticflickr.com/7795/17776134216_6bc56ca12f_b.jpg",
                "https://live.staticflickr.com/1514/25677098633_35f4506247_b.jpg",
                "https://live.staticflickr.com/7332/27931626241_6506f3b65f_b.jpg",
                "https://live.staticflickr.com/798/41183244632_f3343fcd2f.jpg",
                "https://live.staticflickr.com/896/27353811148_65eea7139b_b.jpg",
                "https://live.staticflickr.com/21/24844804_6b500eb6d1_b.jpg",
                "https://live.staticflickr.com/7311/10450050004_cb7f81495b_b.jpg",
                "https://live.staticflickr.com/7442/9512317079_69a25157d0_b.jpg",
            ],
            ["geometrico"] =
            [
                "https://upload.wikimedia.org/wikipedia/commons/8/84/Dom_Carter_Geometric_Tattoo.jpg",
                "https://live.staticflickr.com/7029/6722058623_05630320ab_b.jpg",
                "https://live.staticflickr.com/5284/5354055196_ea72a0181c_b.jpg",
                "https://live.staticflickr.com/7616/16169282223_83b41ded67_b.jpg",
                "https://live.staticflickr.com/1484/25024250071_d70c65d5b8_b.jpg",
                "https://live.staticflickr.com/7388/27334660991_429e20094b_b.jpg",
                "https://live.staticflickr.com/7329/26799036983_155c83384a_b.jpg",
            ],
            ["minimalista"] =
            [
                "https://live.staticflickr.com/65535/53524838660_efcb2f2c88_b.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/a/a3/Minimalist_tattoo%2C_Bruno_Antonio_Menei%2C_Inksecte%2C_Belgium.jpg",
                "https://live.staticflickr.com/65535/53524721709_066e4719e3_b.jpg",
                "https://live.staticflickr.com/65535/53524722624_0d4871aa84_b.jpg",
                "https://live.staticflickr.com/65535/53524404786_c08b25572d_b.jpg",
                "https://live.staticflickr.com/65535/53532287551_cede6293ba_b.jpg",
                "https://live.staticflickr.com/3515/3457516113_1b0d5c408a_b.jpg",
                "https://live.staticflickr.com/7018/6814242601_b6694e2cf5_b.jpg",
            ],
            ["dotwork"] =
            [
                "https://live.staticflickr.com/7370/27405907995_9eb615d9b2_b.jpg",
                "https://live.staticflickr.com/4517/37616730785_457702d143_b.jpg",
                "https://live.staticflickr.com/7692/17802868991_a1e8510202_b.jpg",
                "https://live.staticflickr.com/325/19483973271_3ed7ab723f_b.jpg",
                "https://live.staticflickr.com/7432/27405950355_0115877e37_b.jpg",
                "https://live.staticflickr.com/3071/2703463023_ddef8edb21_b.jpg",
                "https://live.staticflickr.com/391/19292094778_beba2615bc_b.jpg",
                "https://live.staticflickr.com/8521/8591500940_5d4577f529.jpg",
            ],
            ["tribal"] =
            [
                "https://live.staticflickr.com/7365/16582480282_352c9c7088_b.jpg",
                "https://live.staticflickr.com/131/333752491_673a6f067e_b.jpg",
                "https://live.staticflickr.com/2630/3833089063_e5076ec51e_b.jpg",
                "https://live.staticflickr.com/2559/3833089829_d9bb11cf8f_b.jpg",
                "https://live.staticflickr.com/6178/6160170472_11d6118d9c_b.jpg",
                "https://live.staticflickr.com/4196/34914250890_8e1b40af13_b.jpg",
                "https://live.staticflickr.com/4233/34914249820_fd4970f4de_b.jpg",
                "https://live.staticflickr.com/4250/34914243360_793b9d493e_b.jpg",
                "https://live.staticflickr.com/8153/7618367334_662c463968_b.jpg",
            ],
            ["fine-line"] =
            [
                "https://live.staticflickr.com/773/22255015605_ab9954d12a_b.jpg",
                "https://live.staticflickr.com/55/126859894_c49ad0fc15.jpg",
                "https://live.staticflickr.com/3211/2975240613_380d1b9c2a_b.jpg",
                "https://live.staticflickr.com/1611/24486886064_6f43c003da_b.jpg",
                "https://live.staticflickr.com/2186/1641086850_170cb83b1c_b.jpg",
                "https://live.staticflickr.com/2256/1640685840_906e4bef07.jpg",
                "https://live.staticflickr.com/5309/5618305316_578cb23c8c_b.jpg",
                "https://live.staticflickr.com/5064/5741820376_b4c82f1ac2_b.jpg",
                "https://live.staticflickr.com/2690/4456178872_a5e43d51a4.jpg",
            ],
        };

    /// <summary>Returns the URL at position <paramref name="index"/>, cycling if needed.</summary>
    public static string GetUrl(string styleSlug, int index)
    {
        if (!ByStyle.TryGetValue(styleSlug, out var urls) || urls.Length == 0)
        {
            return $"https://picsum.photos/seed/{styleSlug}-{index}/800/1000";
        }
        return urls[index % urls.Length];
    }
}
