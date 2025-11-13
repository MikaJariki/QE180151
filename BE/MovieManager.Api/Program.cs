using Microsoft.EntityFrameworkCore;
using MovieManager.Api.Data;
using Npgsql;
using System.Linq;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connectionString = BuildConnectionString(builder.Configuration);
    options.UseNpgsql(connectionString);
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendClient", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ??
                             ["http://localhost:5173"];

        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("FrontendClient");

app.UseAuthorization();

app.MapControllers();

app.Run();

static string BuildConnectionString(IConfiguration configuration)
{
    var raw = configuration.GetConnectionString("DefaultConnection")
              ?? configuration["ConnectionStrings__DefaultConnection"]
              ?? configuration["DATABASE_URL"]
              ?? configuration["DATABASE_URL_POSTGRES"];

    if (string.IsNullOrWhiteSpace(raw))
    {
        throw new InvalidOperationException("Database connection string is not configured.");
    }

    return raw.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
           || raw.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase)
        ? ConvertPostgresUrlToConnectionString(raw)
        : raw;
}

static string ConvertPostgresUrlToConnectionString(string databaseUrl)
{
    var uri = new Uri(databaseUrl);
    var userInfoParts = uri.UserInfo.Split(':', 2);

    var builder = new NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.IsDefaultPort ? 5432 : uri.Port,
        Username = Uri.UnescapeDataString(userInfoParts.ElementAtOrDefault(0) ?? string.Empty),
        Password = Uri.UnescapeDataString(userInfoParts.ElementAtOrDefault(1) ?? string.Empty),
        Database = uri.AbsolutePath.Trim('/')
    };

    var sslConfigured = false;

    if (!string.IsNullOrWhiteSpace(uri.Query))
    {
        var query = uri.Query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries);
        foreach (var pair in query)
        {
            var kvp = pair.Split('=', 2);
            var key = Uri.UnescapeDataString(kvp[0]);
            var value = kvp.Length > 1 ? Uri.UnescapeDataString(kvp[1]) : string.Empty;

            if (string.Equals(key, "sslmode", StringComparison.OrdinalIgnoreCase))
            {
                builder.SslMode = Enum.Parse<SslMode>(value, ignoreCase: true);
                sslConfigured = true;
            }
            else if (string.Equals(key, "trust_server_certificate", StringComparison.OrdinalIgnoreCase) ||
                     string.Equals(key, "trustservercertificate", StringComparison.OrdinalIgnoreCase))
            {
                if (bool.TryParse(value, out var trust))
                {
#pragma warning disable CS0618
                    builder.TrustServerCertificate = trust;
#pragma warning restore CS0618
                }
            }
            else
            {
                try
                {
                    builder[key] = value;
                }
                catch (KeyNotFoundException)
                {
                    // Ignore unknown keywords to keep compatibility with provider-specific options.
                }
            }
        }
    }

    if (!sslConfigured)
    {
        builder.SslMode = SslMode.Require;
#pragma warning disable CS0618
        builder.TrustServerCertificate = true;
#pragma warning restore CS0618
    }

    return builder.ConnectionString;
}
