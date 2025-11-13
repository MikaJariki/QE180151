namespace MovieManager.Api.Dtos;

public record MovieResponseDto(
    int Id,
    string Title,
    string? Genre,
    int? Rating,
    string? PosterUrl,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
