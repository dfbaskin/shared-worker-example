namespace WebServer;

public record EventItem(
  string EventId,
  string Name,
  string Description,
  DateTime LastModifiedUTC
)
{
    public EventItem(string Name, string Description) : this(
        EventId: Guid.NewGuid().ToString(),
        Name: Name,
        Description: Description,
        LastModifiedUTC: DateTime.UtcNow
    )
    {
    }
}
