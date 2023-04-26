using WebServer;

const string CORS_POLICY_NAME = "AllowAllOrigins";

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddSingleton<CurrentData>();
builder.Services.AddHostedService<EventItemWorker>();
builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        name: CORS_POLICY_NAME,
        policy  =>
        {
            policy
                .WithOrigins("http://localhost:4200")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.

// app.UseHttpsRedirection();

app.UseCors(CORS_POLICY_NAME);

app.UseAuthorization();

app.MapControllers();

app.MapHub<EventsHub>("/api/EventsHub");

app.Run();
