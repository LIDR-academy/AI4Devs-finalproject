using Minio;
using Minio.DataModel.Args;

namespace Aura.Workers.SSG.Services;

public class MinioUploader
{
    private readonly IMinioClient _minioClient;
    private readonly string _bucketName = "static-sites";
    private readonly ILogger<MinioUploader> _logger;

    public MinioUploader(IMinioClient minioClient, ILogger<MinioUploader> logger)
    {
        _minioClient = minioClient;
        _logger = logger;
    }

    public async Task UploadFileAsync(string objectName, Stream data, string contentType, CancellationToken cancellationToken)
    {
        try
        {
            var bucketExistsArgs = new BucketExistsArgs().WithBucket(_bucketName);
            bool found = await _minioClient.BucketExistsAsync(bucketExistsArgs, cancellationToken);
            if (!found)
            {
                var makeBucketArgs = new MakeBucketArgs().WithBucket(_bucketName);
                await _minioClient.MakeBucketAsync(makeBucketArgs, cancellationToken);
                
                var policy = $@"{{
                    ""Statement"": [
                        {{
                            ""Action"": [""s3:GetObject""],
                            ""Effect"": ""Allow"",
                            ""Principal"": ""*"",
                            ""Resource"": [""arn:aws:s3:::{_bucketName}/*""]
                        }}
                    ],
                    ""Version"": ""2012-10-17""
                }}";
                var setPolicyArgs = new SetPolicyArgs().WithBucket(_bucketName).WithPolicy(policy);
                await _minioClient.SetPolicyAsync(setPolicyArgs, cancellationToken);
            }

            var putObjectArgs = new PutObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(objectName)
                .WithStreamData(data)
                .WithObjectSize(data.Length)
                .WithContentType(contentType);

            await _minioClient.PutObjectAsync(putObjectArgs, cancellationToken);
            _logger.LogInformation("Successfully uploaded {ObjectName} to bucket {BucketName}", objectName, _bucketName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading {ObjectName} to bucket {BucketName}", objectName, _bucketName);
            throw;
        }
    }
}
