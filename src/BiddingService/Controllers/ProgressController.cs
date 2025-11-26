using BiddingService.DTOs;
using BiddingService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BiddingService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProgressController : ControllerBase
{
    private readonly ProgressService progressService;

    public ProgressController(ProgressService progressService)
    {
        this.progressService = progressService;
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ProgressDto>> GetMine()
    {
        var username = User.Identity?.Name;
        if (string.IsNullOrWhiteSpace(username)) return Unauthorized();

        var profile = await progressService.GetProfile(username);
        return Ok(profile);
    }

    [Authorize]
    [HttpPost("award")]
    public async Task<ActionResult<ProgressDto>> Award(AwardRequestDto award)
    {
        var username = User.Identity?.Name;
        if (string.IsNullOrWhiteSpace(username)) return Unauthorized();

        var profile = await progressService.AwardAsync(username, award.Action, award.Amount);
        return Ok(profile);
    }

    [HttpGet("leaderboard")]
    public async Task<ActionResult<List<ProgressDto>>> GetLeaderboard()
    {
        var leaderboard = await progressService.GetLeaderboard();
        return Ok(leaderboard);
    }

    [Authorize]
    [HttpPost("mystery")]
    public async Task<ActionResult<SummonResultDto>> OpenMystery()
    {
        var username = User.Identity?.Name;
        if (string.IsNullOrWhiteSpace(username)) return Unauthorized();

        var profile = await progressService.OpenMystery(username);
        return Ok(profile);
    }
}
