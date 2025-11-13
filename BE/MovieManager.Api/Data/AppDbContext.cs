using Microsoft.EntityFrameworkCore;
using MovieManager.Api.Models;

namespace MovieManager.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Movie> Movies => Set<Movie>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Movie>(entity =>
        {
            entity.Property(m => m.Title)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(m => m.Genre)
                .HasMaxLength(100);

            entity.Property(m => m.PosterUrl)
                .HasMaxLength(2000);

            entity.Property(m => m.Rating)
                .HasDefaultValue(null);
        });
    }
}
