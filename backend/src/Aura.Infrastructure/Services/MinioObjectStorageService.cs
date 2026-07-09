using System.IO;
using System.Threading.Tasks;
using Aura.Core.Interfaces.Services;
using Minio;
using Minio.DataModel.Args;
using Minio.Exceptions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Aura.Infrastructure.Services;

public class MinioObjectStorageService : IObjectStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly ILogger<MinioObjectStorageService> _logger;

    public MinioObjectStorageService(IMinioClient minioClient, ILogger<MinioObjectStorageService> logger)
    {
        _minioClient = minioClient;
        _logger = logger;
    }

    public async Task<string> UploadFileAsync(string bucketName, string objectName, Stream data, string contentType)
    {
        try
        {
            var beArgs = new BucketExistsArgs().WithBucket(bucketName);
            bool found = await _minioClient.BucketExistsAsync(beArgs);
            if (!found)
            {
                var mbArgs = new MakeBucketArgs().WithBucket(bucketName);
                await _minioClient.MakeBucketAsync(mbArgs);
                
                // Set public read policy for the bucket
                string policy = $@"{{
                    ""Version"": ""2012-10-17"",
                    ""Statement"": [
                        {{
                            ""Action"": [""s3:GetObject""],
                            ""Effect"": ""Allow"",
                            ""Principal"": {{""AWS"": [""*""]}},
                            ""Resource"": [""arn:aws:s3:::{bucketName}/*""]
                        }}
                    ]
                }}";
                await _minioClient.SetPolicyAsync(new SetPolicyArgs().WithBucket(bucketName).WithPolicy(policy));
            }

            var putObjectArgs = new PutObjectArgs()
                .WithBucket(bucketName)
                .WithObject(objectName)
                .WithStreamData(data)
                .WithObjectSize(data.Length)
                .WithContentType(contentType);

            await _minioClient.PutObjectAsync(putObjectArgs);
            
            return $"/{bucketName}/{objectName}";
        }
        catch (MinioException e)
        {
            _logger.LogError(e, "Error occurred during MinIO file upload.");
            throw;
        }
    }
}
