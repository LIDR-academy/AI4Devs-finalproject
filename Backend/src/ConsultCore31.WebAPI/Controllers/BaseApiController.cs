using Microsoft.AspNetCore.Mvc;

namespace ConsultCore31.WebAPI.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    public abstract class BaseApiController : ControllerBase
    {
        protected IActionResult HandleResult<T>(T result, string notFoundMessage = "No se encontraron resultados")
        {
            if (result == null) return NotFound(new ApiResponse(404, notFoundMessage));
            return Ok(new ApiResponse<T>(200, result));
        }
    }

    public class ApiResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; }

        public ApiResponse(int statusCode, string message = null)
        {
            StatusCode = statusCode;
            Message = message ?? GetDefaultMessageForStatusCode(statusCode);
        }

        private static string GetDefaultMessageForStatusCode(int statusCode)
        {
            return statusCode switch
            {
                200 => "Operación exitosa",
                201 => "Recurso creado exitosamente",
                204 => "No hay contenido para mostrar",
                400 => "Solicitud incorrecta",
                401 => "No autorizado",
                403 => "No tiene permisos para realizar esta acción",
                404 => "Recurso no encontrado",
                500 => "Error interno del servidor",
                _ => null
            };
        }
    }

    public class ApiResponse<T> : ApiResponse
    {
        public T Data { get; set; }

        public ApiResponse(int statusCode, T data, string message = null) 
            : base(statusCode, message)
        {
            Data = data;
        }
    }
}
