using System.Collections.Concurrent;

namespace WebServer;

public class CurrentData
{
    private readonly ConcurrentDictionary<string, EventItem> eventItems;

    public CurrentData()
    {
        eventItems = new ConcurrentDictionary<string, EventItem>();
    }

    public ICollection<EventItem> EventItems => eventItems.Values;

    public bool AddEventItem(EventItem eventItem)
    {
        return eventItems.TryAdd(eventItem.EventId, eventItem);
    }

    public bool UpdateEventItem(EventItem updated)
    {
        var id = updated.EventId;
        return
            eventItems.TryGetValue(id, out EventItem? original) &&
            eventItems.TryUpdate(id, updated, original);
    }

    public bool RemoveEventItem(EventItem eventItem)
    {
        return eventItems.TryRemove(eventItem.EventId, out EventItem? original);
    }
}
