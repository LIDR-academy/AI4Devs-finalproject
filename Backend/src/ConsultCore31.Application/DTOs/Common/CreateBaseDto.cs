using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.Common
{
    /// <summary>
    /// DTO base para creación de entidades
    /// </summary>
    public abstract class CreateBaseDto
    {
        // No incluimos propiedades comunes ya que las entidades pueden tener diferentes requisitos
        // para la creación. Las propiedades específicas se definirán en las clases derivadas.
    }
}
