using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieManager.Api.Data;
using MovieManager.Api.Dtos;
using MovieManager.Api.Extensions;
using MovieManager.Api.Models;

namespace MovieManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoviesController(AppDbContext context) : ControllerBase
{
    private readonly AppDbContext _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MovieResponseDto>>> GetMovies(
        [FromQuery] string? search,
        [FromQuery] string? genre,
        [FromQuery] string? sortBy,
        [FromQuery] string? sortDirection)
    {
        var query = _context.Movies.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToLower();
            query = query.Where(movie => movie.Title.ToLower().Contains(normalizedSearch));
        }

        if (!string.IsNullOrWhiteSpace(genre))
        {
            var normalizedGenre = genre.Trim().ToLower();
            query = query.Where(movie => movie.Genre != null && movie.Genre.ToLower() == normalizedGenre);
        }

        var direction = sortDirection?.Equals("desc", StringComparison.OrdinalIgnoreCase) == true
            ? "desc"
            : "asc";

        query = sortBy?.ToLower() switch
        {
            "rating" when direction == "desc" => query.OrderByDescending(movie => movie.Rating).ThenBy(movie => movie.Title),
            "rating" => query.OrderBy(movie => movie.Rating).ThenBy(movie => movie.Title),
            "created" when direction == "desc" => query.OrderByDescending(movie => movie.CreatedAt),
            "created" => query.OrderBy(movie => movie.CreatedAt),
            _ when direction == "desc" => query.OrderByDescending(movie => movie.Title),
            _ => query.OrderBy(movie => movie.Title)
        };

        var movies = await query.AsNoTracking().ToListAsync();
        return Ok(movies.Select(movie => movie.ToDto()));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MovieResponseDto>> GetMovieById(int id)
    {
        var movie = await _context.Movies.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id);

        if (movie is null)
        {
            return NotFound();
        }

        return Ok(movie.ToDto());
    }

    [HttpPost]
    public async Task<ActionResult<MovieResponseDto>> CreateMovie([FromBody] MovieRequestDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var movie = new Movie
        {
            Title = dto.Title.Trim(),
            Genre = string.IsNullOrWhiteSpace(dto.Genre) ? null : dto.Genre.Trim(),
            Rating = dto.Rating,
            PosterUrl = string.IsNullOrWhiteSpace(dto.PosterUrl) ? null : dto.PosterUrl.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Movies.Add(movie);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMovieById), new { id = movie.Id }, movie.ToDto());
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<MovieResponseDto>> UpdateMovie(int id, [FromBody] MovieRequestDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var movie = await _context.Movies.FindAsync(id);
        if (movie is null)
        {
            return NotFound();
        }

        movie.UpdateFromDto(dto);
        await _context.SaveChangesAsync();

        return Ok(movie.ToDto());
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteMovie(int id)
    {
        var movie = await _context.Movies.FindAsync(id);
        if (movie is null)
        {
            return NotFound();
        }

        _context.Movies.Remove(movie);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
