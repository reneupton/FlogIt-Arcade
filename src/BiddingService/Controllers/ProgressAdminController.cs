using BiddingService.DTOs;
using BiddingService.Models;
using BiddingService.Services;
using MassTransit;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Entities;

namespace BiddingService.Controllers
{
    [ApiController]
    [Route("api/admin/progress")]
    public class ProgressAdminController : ControllerBase
    {
        private readonly IPublishEndpoint _publishEndpoint;

        public ProgressAdminController(IPublishEndpoint publishEndpoint)
        {
            _publishEndpoint = publishEndpoint;
        }

        private async Task<UserProgress?> FindUser(string identifier)
        {
            // try by ID
            var byId = await DB.Find<UserProgress>().OneAsync(identifier);
            if (byId != null) return byId;

            // fallback by username field
            return await DB.Find<UserProgress>()
                .Match(u => u.Username == identifier)
                .ExecuteFirstAsync();
        }

        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<UserProgress>>> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var skip = Math.Max(0, (page - 1) * pageSize);
            var users = await DB.Find<UserProgress>()
                .Skip(skip)
                .Limit(pageSize)
                .ExecuteAsync();
            return Ok(users);
        }

        [HttpGet("users/{username}")]
        public async Task<ActionResult<UserProgress>> GetUser(string username)
        {
            var user = await FindUser(username);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPost("users/{username}/balance")]
        public async Task<ActionResult<UserProgress>> AdjustBalance(string username, [FromBody] AdminAdjustDto dto)
        {
            var user = await FindUser(username);
            if (user == null) return NotFound();
            if (dto.Delta.HasValue) user.FlogBalance += dto.Delta.Value;
            await user.SaveAsync();
            await _publishEndpoint.Publish(new Contracts.UserProgressAdjusted
            {
                Username = username,
                BalanceDelta = dto.Delta,
                UpdatedBy = "admin"
            });
            return Ok(user);
        }

        [HttpPost("users/{username}/xp")]
        public async Task<ActionResult<UserProgress>> AdjustXp(string username, [FromBody] AdminAdjustDto dto)
        {
            var user = await FindUser(username);
            if (user == null) return NotFound();
            if (dto.Delta.HasValue) user.Experience += dto.Delta.Value;
            if (dto.Level.HasValue) user.Level = dto.Level.Value;
            await user.SaveAsync();
            await _publishEndpoint.Publish(new Contracts.UserProgressAdjusted
            {
                Username = username,
                XpDelta = dto.Delta,
                Level = dto.Level,
                UpdatedBy = "admin"
            });
            return Ok(user);
        }

        [HttpPost("users/{username}/avatar")]
        public async Task<ActionResult<UserProgress>> SetAvatar(string username, [FromBody] AdminAdjustDto dto)
        {
            var user = await FindUser(username);
            if (user == null) return NotFound();
            if (!string.IsNullOrWhiteSpace(dto.AvatarUrl))
            {
                user.AvatarUrl = dto.AvatarUrl;
                await user.SaveAsync();
                await _publishEndpoint.Publish(new Contracts.UserAvatarUpdated
                {
                    Username = username,
                    AvatarUrl = dto.AvatarUrl,
                    UpdatedBy = "admin"
                });
            }
            return Ok(user);
        }

        [HttpPost("users/{username}/reset-cooldowns")]
        public async Task<ActionResult<UserProgress>> ResetCooldowns(string username)
        {
            var user = await FindUser(username);
            if (user == null) return NotFound();
            user.LastDailyReward = null;
            user.LastMysteryRewardAt = null;
            user.LastMysteryRewardCoins = null;
            user.LastMysteryRewardXp = null;
            await user.SaveAsync();
            await _publishEndpoint.Publish(new Contracts.UserCooldownReset
            {
                Username = username,
                UpdatedBy = "admin"
            });
            return Ok(user);
        }

        [HttpGet("users/{username}/heroes")]
        public async Task<ActionResult<List<OwnedHero>>> GetHeroes(string username)
        {
            var user = await FindUser(username);
            if (user == null) return NotFound();
            user.OwnedHeroes ??= new List<OwnedHero>();
            return Ok(user.OwnedHeroes);
        }

        [HttpPost("users/{username}/heroes")]
        public async Task<ActionResult> AddHero(string username, [FromBody] AdminHeroRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.HeroId) || string.IsNullOrWhiteSpace(request.Rarity))
            {
                return BadRequest(new { message = "heroId and rarity are required" });
            }

            var user = await FindUser(username);
            if (user == null) return NotFound();

            var variant = HeroCatalog.GetVariant(request.HeroId, request.Rarity);
            if (variant == null) return BadRequest(new { message = "Unknown heroId or rarity" });

            user.OwnedHeroes ??= new List<OwnedHero>();
            user.OwnedHeroes.Add(new OwnedHero
            {
                HeroId = variant.HeroId,
                VariantId = variant.VariantId,
                Name = variant.Name,
                Discipline = variant.Discipline,
                Rarity = variant.Rarity,
                Strength = variant.Strength,
                Intellect = variant.Intellect,
                Vitality = variant.Vitality,
                Agility = variant.Agility,
                CardImage = variant.CardImage,
                AcquiredAt = DateTime.UtcNow
            });

            await user.SaveAsync();
            return Ok(user.OwnedHeroes);
        }

        [HttpDelete("users/{username}/heroes/{variantId}")]
        public async Task<ActionResult> RemoveHero(string username, string variantId)
        {
            var user = await FindUser(username);
            if (user == null) return NotFound();
            if (string.IsNullOrWhiteSpace(variantId)) return BadRequest(new { message = "variantId required" });

            user.OwnedHeroes ??= new List<OwnedHero>();
            var before = user.OwnedHeroes.Count;
            user.OwnedHeroes = user.OwnedHeroes.Where(h => !h.VariantId.Equals(variantId, StringComparison.OrdinalIgnoreCase)).ToList();

            if (user.OwnedHeroes.Count == before) return NotFound(new { message = "hero not found on user" });

            await user.SaveAsync();
            return Ok(user.OwnedHeroes);
        }

        [HttpPost("users/{username}/starter-pack")]
        public async Task<ActionResult<List<OwnedHero>>> GrantStarterPack(string username)
        {
            var user = await FindUser(username);
            if (user == null) return NotFound();

            user.OwnedHeroes ??= new List<OwnedHero>();

            var pack = new (string heroId, string rarity)[]
            {
                ("elyra", "Epic"),
                ("grum", "Legendary"),
                ("dresh", "Common"),
                ("sigrun", "Rare")
            };

            foreach (var (heroId, rarity) in pack)
            {
                var variant = HeroCatalog.GetVariant(heroId, rarity);
                if (variant == null) continue;
                if (user.OwnedHeroes.Any(h => h.VariantId.Equals(variant.VariantId, StringComparison.OrdinalIgnoreCase)))
                {
                    continue;
                }

                user.OwnedHeroes.Add(new OwnedHero
                {
                    HeroId = variant.HeroId,
                    VariantId = variant.VariantId,
                    Name = variant.Name,
                    Discipline = variant.Discipline,
                    Rarity = variant.Rarity,
                    Strength = variant.Strength,
                    Intellect = variant.Intellect,
                    Vitality = variant.Vitality,
                    Agility = variant.Agility,
                    CardImage = variant.CardImage,
                    AcquiredAt = DateTime.UtcNow
                });
                user.RecentPurchases ??= new List<string>();
                user.RecentPurchases.Insert(0, variant.VariantId);
            }

            await user.SaveAsync();
            return Ok(user.OwnedHeroes);
        }
    }
}
