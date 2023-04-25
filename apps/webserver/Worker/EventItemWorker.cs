namespace WebServer;

public sealed partial class EventItemWorker : BackgroundService
{
    public EventItemWorker(
        CurrentData current,
        ILogger<EventItemWorker> logger
    )
    {
        Current = current ?? throw new ArgumentNullException(nameof(current));
        Logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public CurrentData Current { get; }
    public ILogger<EventItemWorker> Logger { get; }
    private const int MaxItemCount = 50;

    protected override async Task ExecuteAsync(CancellationToken token)
    {
        var randGen = new Random();
        Initialize();

        while (!token.IsCancellationRequested)
        {
            var value = randGen.NextSingle();
            var items = Current.EventItems.ToList();
            if (value < 0.10)
            {
                if (Current.EventItems.Count < MaxItemCount)
                {
                    var item = NewEventItem();
                    Current.AddEventItem(item);
                    Logger.LogInformation($"Created {item}");
                }
            }
            else if (value < 0.20)
            {
                if (items.Count > 0)
                {
                    var item = items.ElementAt(Faker.RandomNumber.Next(items.Count - 1));
                    Current.RemoveEventItem(item);
                    Logger.LogInformation($"Removed {item}");
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
                }
            }

            int mSecs = (int)(randGen.NextSingle() * 2000);
            await Task.Delay(mSecs, token);
        }
    }

    private void Initialize()
    {
        for (int i = 0; i < 3; i++)
        {
            var item = NewEventItem();
            Current.AddEventItem(item);
            Logger.LogInformation($"Created {item}");
        }
    }

    private EventItem NewEventItem() =>
        new EventItem(
            Name: Faker.Company.Name(),
            Description: FakeDescription()
        );

    private string FakeDescription() => string.Join(" ", Faker.Lorem.Words(6));
}
