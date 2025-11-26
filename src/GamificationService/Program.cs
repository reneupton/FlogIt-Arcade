using GamificationService.Data;
using GamificationService.Services;
using MassTransit;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database configuration
builder.Services.AddDbContext<GamificationDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Register services
builder.Services.AddScoped<WalletService>();
builder.Services.AddScoped<TransactionService>();
builder.Services.AddScoped<UserGamificationService>();
builder.Services.AddScoped<QuestService>();
builder.Services.AddScoped<AchievementService>();
builder.Services.AddScoped<ActivityFeedService>();
builder.Services.AddScoped<MysteryBoxService>();

// MassTransit configuration
builder.Services.AddMassTransit(x =>
{
    x.AddEntityFrameworkOutbox<GamificationDbContext>(o =>
    {
        o.QueryDelay = TimeSpan.FromSeconds(10);
        o.UsePostgres();
        o.UseBusOutbox();
    });

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration["RabbitMq:Host"] ?? "localhost", builder.Configuration["RabbitMq:VirtualHost"] ?? "/", host =>
        {
            host.Username(builder.Configuration["RabbitMq:Username"] ?? "guest");
            host.Password(builder.Configuration["RabbitMq:Password"] ?? "guest");
        });

        cfg.ConfigureEndpoints(context);
    });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

// Initialize database
try
{
    var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<GamificationDbContext>();
    await context.Database.MigrateAsync();

    // Seed achievements
    var achievementService = scope.ServiceProvider.GetRequiredService<AchievementService>();
    await achievementService.SeedAchievementsAsync();

    // Seed mystery boxes
    var mysteryBoxService = scope.ServiceProvider.GetRequiredService<MysteryBoxService>();
    await mysteryBoxService.SeedMysteryBoxesAsync();
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occurred during database initialization");
}

app.Run();
