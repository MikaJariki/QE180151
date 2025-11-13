using MovieManager.Api.Dtos;
using MovieManager.Api.Models;

namespace MovieManager.Api.Extensions;

public static class MovieMappingExtensions
{
    public static MovieResponseDto ToDto(this Movie movie) =>
        new(
            movie.Id,
            movie.Title,
            movie.Genre,
            movie.Rating,
            movie.PosterUrl,
            movie.CreatedAt,
            movie.UpdatedAt);

    public static void UpdateFromDto(this Movie movie, MovieRequestDto dto)
    {
        movie.Title = dto.Title.Trim();
        movie.Genre = string.IsNullOrWhiteSpace(dto.Genre) ? null : dto.Genre.Trim();
        movie.Rating = dto.Rating;
        movie.PosterUrl = string.IsNullOrWhiteSpace(dto.PosterUrl) ? null : dto.PosterUrl.Trim();
        movie.UpdatedAt = DateTime.UtcNow;
    }
}
