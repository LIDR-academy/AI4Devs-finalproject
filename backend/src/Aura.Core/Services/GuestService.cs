using Aura.Core.DTOs.Guests;
using Aura.Core.Exceptions;
using Aura.Core.Enums;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Models;
using CsvHelper;
using CsvHelper.Configuration;
using FluentValidation;
using System.Globalization;

namespace Aura.Core.Services;

public class GuestService : IGuestService
{
    private readonly IGuestRepository _guestRepository;
    private readonly IEventRepository _eventRepository;
    private readonly IValidator<AddGuestRequest> _addGuestValidator;
    private readonly IValidator<ImportGuestRow> _importGuestValidator;

    public GuestService(
        IGuestRepository guestRepository,
        IEventRepository eventRepository,
        IValidator<AddGuestRequest> addGuestValidator,
        IValidator<ImportGuestRow> importGuestValidator)
    {
        _guestRepository = guestRepository;
        _eventRepository = eventRepository;
        _addGuestValidator = addGuestValidator;
        _importGuestValidator = importGuestValidator;
    }

    private async Task<Event> GetEventAndVerifyAccessAsync(Guid userId, string eventSlug)
    {
        var evt = await _eventRepository.GetBySlugAsync(eventSlug);
        if (evt == null || evt.UserId != userId)
            throw new NotFoundException("Event not found or access denied.");
        return evt;
    }

    private async Task EnsureGuestLimitNotExceededAsync(Guid eventId, EventStatus status, int newGuestsCount)
    {
        if (status == EventStatus.Draft)
        {
            var currentCount = await _guestRepository.GetGuestCountAsync(eventId);
            if (currentCount + newGuestsCount > 5)
                throw new DomainValidationException("Guest limit exceeded for draft event. Maximum is 5. Please publish your event to add more.");
        }
    }

    public async Task<GuestResponse> AddGuestAsync(Guid userId, string eventSlug, AddGuestRequest request)
    {
        var evt = await GetEventAndVerifyAccessAsync(userId, eventSlug);

        await _addGuestValidator.ValidateAndThrowAsync(request);

        await EnsureGuestLimitNotExceededAsync(evt.Id, evt.Status, 1);

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var exists = await _guestRepository.ExistsByEmailAsync(evt.Id, request.Email);
            if (exists)
                throw new DomainValidationException("A guest with this email already exists for this event.");
        }

        var guest = new Guest
        {
            EventId = evt.Id,
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Category = request.Category ?? GuestCategory.Other
        };

        var addedGuest = await _guestRepository.AddAsync(guest);

        return new GuestResponse(
            addedGuest.Id,
            addedGuest.Name,
            addedGuest.Email,
            addedGuest.Phone,
            addedGuest.Category,
            addedGuest.InviteStatus,
            addedGuest.CreatedAt
        );
    }

    public async Task<ImportResult> ImportGuestsFromCsvAsync(Guid userId, string eventSlug, Stream csvStream)
    {
        var evt = await GetEventAndVerifyAccessAsync(userId, eventSlug);

        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            TrimOptions = TrimOptions.Trim,
            MissingFieldFound = null,
            HeaderValidated = null
        };

        var imported = 0;
        var skipped = 0;
        var errors = new List<ImportError>();
        var newGuests = new List<Guest>();

        using var reader = new StreamReader(csvStream);
        using var csv = new CsvReader(reader, config);

        // Read header
        await csv.ReadAsync();
        csv.ReadHeader();

        int rowCount = 1;
        while (await csv.ReadAsync())
        {
            rowCount++;
            try
            {
                var row = new ImportGuestRow
                {
                    Name = csv.GetField("name"),
                    Email = csv.GetField("email"),
                    Phone = csv.GetField("phone"),
                    Category = csv.GetField("category")
                };

                var validationResult = await _importGuestValidator.ValidateAsync(row);
                if (!validationResult.IsValid)
                {
                    foreach (var error in validationResult.Errors)
                    {
                        errors.Add(new ImportError(rowCount, error.PropertyName, error.ErrorMessage));
                    }
                    continue;
                }

                if (!string.IsNullOrWhiteSpace(row.Email))
                {
                    // Check against DB
                    if (await _guestRepository.ExistsByEmailAsync(evt.Id, row.Email))
                    {
                        errors.Add(new ImportError(rowCount, "Email", "A guest with this email already exists."));
                        skipped++;
                        continue;
                    }
                    // Check against current import batch
                    if (newGuests.Any(g => g.Email == row.Email))
                    {
                        errors.Add(new ImportError(rowCount, "Email", "Duplicate email within the CSV file."));
                        skipped++;
                        continue;
                    }
                }

                var category = GuestCategory.Other;
                if (!string.IsNullOrWhiteSpace(row.Category) && Enum.TryParse<GuestCategory>(row.Category, true, out var parsedCategory))
                {
                    category = parsedCategory;
                }

                newGuests.Add(new Guest
                {
                    EventId = evt.Id,
                    Name = row.Name!,
                    Email = string.IsNullOrWhiteSpace(row.Email) ? null : row.Email,
                    Phone = string.IsNullOrWhiteSpace(row.Phone) ? null : row.Phone,
                    Category = category
                });
            }
            catch (Exception ex)
            {
                errors.Add(new ImportError(rowCount, "Row", $"Error parsing row: {ex.Message}"));
            }
        }

        if (newGuests.Any())
        {
            await EnsureGuestLimitNotExceededAsync(evt.Id, evt.Status, newGuests.Count);

            foreach (var guest in newGuests)
            {
                await _guestRepository.AddAsync(guest);
                imported++;
            }
        }

        return new ImportResult(rowCount - 1, imported, skipped, errors);
    }

    public async Task<IEnumerable<GuestResponse>> GetGuestsByEventAsync(Guid userId, string eventSlug, string? category = null, string? search = null)
    {
        var evt = await GetEventAndVerifyAccessAsync(userId, eventSlug);

        var guests = await _guestRepository.GetGuestsByEventAsync(evt.Id, category, search);

        return guests.Select(g => new GuestResponse(
            g.Id,
            g.Name,
            g.Email,
            g.Phone,
            g.Category,
            g.InviteStatus,
            g.CreatedAt
        ));
    }

    public async Task SoftDeleteGuestAsync(Guid userId, string eventSlug, Guid guestId)
    {
        var evt = await GetEventAndVerifyAccessAsync(userId, eventSlug);

        var guest = await _guestRepository.GetByIdAsync(guestId);
        if (guest == null || guest.EventId != evt.Id)
            throw new NotFoundException("Guest not found.");

        await _guestRepository.DeleteAsync(guest);
        // Note: Soft delete cascade (Guest -> Invitation) will be handled in DbContext override or intercepted.
    }

    public async Task<int> GetGuestCountAsync(Guid eventId)
    {
        return await _guestRepository.GetGuestCountAsync(eventId);
    }
}
