using Microsoft.Extensions.DependencyInjection;
using TejaFlow.Application.Admin;
using TejaFlow.Application.Auth;
using TejaFlow.Application.Breakage;
using TejaFlow.Application.Inventory;
using TejaFlow.Application.Logistics;
using TejaFlow.Application.Quotations;
using TejaFlow.Application.Sales;

namespace TejaFlow.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<DashboardService>();
        services.AddScoped<AuthService>();
        services.AddScoped<BreakageService>();
        services.AddScoped<InventoryService>();
        services.AddScoped<LogisticsService>();
        services.AddScoped<QuotationService>();
        services.AddScoped<SalesService>();

        return services;
    }
}
