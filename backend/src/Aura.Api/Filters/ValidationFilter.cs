using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Aura.Api.Filters;

public class ValidationFilter(IServiceProvider serviceProvider) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var argument in context.ActionArguments)
        {
            if (argument.Value is null)
                continue;

            var argumentType = argument.Value.GetType();
            var validatorType = typeof(IValidator<>).MakeGenericType(argumentType);

            var validator = serviceProvider.GetService(validatorType) as IValidator;
            if (validator is null)
                continue;

            var validationContext = new ValidationContext<object>(argument.Value);
            var result = await validator.ValidateAsync(validationContext);

            if (!result.IsValid)
            {
                var errors = result.Errors
                    .Select(e => new { field = e.PropertyName, message = e.ErrorMessage })
                    .ToList();

                context.Result = new BadRequestObjectResult(new
                {
                    error = "Validation failed",
                    errors
                });
                return;
            }
        }

        await next();
    }
}
