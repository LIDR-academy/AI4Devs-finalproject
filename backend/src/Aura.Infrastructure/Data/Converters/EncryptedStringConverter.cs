using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Aura.Infrastructure.Data.Converters;

// A simple mock for PII Encryption. In production, this would use AES-256 via a KMS.
public class EncryptedStringConverter : ValueConverter<string?, string?>
{
    public EncryptedStringConverter()
        : base(
            v => v == null ? null : $"ENCRYPTED_{v}",
            v => v == null ? null : (v.StartsWith("ENCRYPTED_") ? v.Substring(10) : v)
        )
    {
    }
}
