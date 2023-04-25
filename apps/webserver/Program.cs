using WebServer;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddSingleton<CurrentData>();
builder.Services.AddHostedService<EventItemWorker>();
builder.Services.AddSignalR();

var app = builder.Build();

// Configure the HTTP request pipeline.

// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapHub<EventsHub>("/Events");

app.Run();
