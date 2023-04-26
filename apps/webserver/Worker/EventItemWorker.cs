using Microsoft.AspNetCore.SignalR;

namespace WebServer;

public sealed partial class EventItemWorker : BackgroundService
{
    public EventItemWorker(
        CurrentData current,
        IHubContext<EventsHub> eventsHub,
        ILogger<EventItemWorker> logger
    )
    {
        Current = current ?? throw new ArgumentNullException(nameof(current));
        EventsHub = eventsHub ?? throw new ArgumentNullException(nameof(eventsHub));
        Logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public CurrentData Current { get; }
    public IHubContext<EventsHub> EventsHub { get; }
    public ILogger<EventItemWorker> Logger { get; }
    private const int MaxItemCount = 50;

    protected override async Task ExecuteAsync(CancellationToken token)
    {
        var randGen = new Random();

        await Task.Delay(2000, token);
        if (token.IsCancellationRequested)
        {
            return;
        }

        await Initialize(token);
        if (token.IsCancellationRequested)
        {
            return;
        }

        while (!token.IsCancellationRequested)
        {
            var value = randGen.NextSingle();
            var items = Current.EventItems.ToList();
            if (value < 0.15)
            {
                if (Current.EventItems.Count < MaxItemCount)
                {
                    var item = NewEventItem();
                    Current.AddEventItem(item);
                    Logger.LogInformation($"Created {item}");
                    await EventsHub.Clients.All.SendAsync("eventAdded", item, token);
                }
            }
            else if (value < 0.20)
            {
                if (items.Count > 0)
                {
                    var item = items.ElementAt(Faker.RandomNumber.Next(items.Count - 1));
                    Current.RemoveEventItem(item);
                    Logger.LogInformation($"Removed {item}");
                    await EventsHub.Clients.All.SendAsync("eventRemoved", item, token);
                }
            }
            else
            {
                if (items.Count > 0)
                {
                    var original = items.ElementAt(Faker.RandomNumber.Next(items.Count - 1));
                    var updated = original with
                    {
                        Description = FakeDescription(),
                        LastModifiedUTC = DateTime.UtcNow
                    };
                    Current.UpdateEventItem(updated);
                    Logger.LogInformation($"Updated {updated}");
                    await EventsHub.Clients.All.SendAsync("eventUpdated", updated, token);
                }
            }

            int mSecs = (int)(randGen.NextSingle() * 2000);
            await Task.Delay(mSecs, token);
        }
    }

    private async Task Initialize(CancellationToken token)
    {
        for (int i = 0; i < 3 && !token.IsCancellationRequested; i++)
        {
            var item = NewEventItem();
            Current.AddEventItem(item);
            Logger.LogInformation($"Created {item}");
            await EventsHub.Clients.All.SendAsync("eventAdded", item, token);
        }
    }

    private EventItem NewEventItem() =>
        new EventItem(
            Name: Faker.Company.Name(),
            Description: FakeDescription()
        );

    private string FakeDescription() => string.Join(" ", Faker.Lorem.Words(6));
}
