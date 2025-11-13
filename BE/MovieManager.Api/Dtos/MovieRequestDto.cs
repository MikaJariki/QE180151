using System.ComponentModel.DataAnnotations;

namespace MovieManager.Api.Dtos;

public class MovieRequestDto
{
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
}
