using System.ComponentModel.DataAnnotations;

namespace MovieManager.Api.Models;

public class Movie
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Genre { get; set; }

    [Range(1, 5)]
    public int? Rating { get; set; }

    [Url]
    [MaxLength(2000)]
    public string? PosterUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
