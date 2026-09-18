using SimuladorInvestimentos.Api;
using SimuladorInvestimentos.Api.Endpoints;
using SimuladorInvestimentos.Application;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddApi(builder.Configuration);

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseCors(SimuladorInvestimentos.Api.DependencyInjection.FrontendCorsPolicy);

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.MapHealthChecks("/health");
app.MapCdbEndpoints();

await app.RunAsync().ConfigureAwait(false);
