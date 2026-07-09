using System.IO;
using System.Threading.Tasks;

namespace Aura.Core.Interfaces.Services;

public interface IObjectStorageService
{
    Task<string> UploadFileAsync(string bucketName, string objectName, Stream data, string contentType);
}
