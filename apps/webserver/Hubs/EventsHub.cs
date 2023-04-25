using Microsoft.AspNetCore.SignalR;

namespace WebServer;

public class EventsHub : Hub
{
    public async Task EventAdded(string eventId) =>
        await Clients.All.SendAsync("eventAdded", eventId);
    public async Task EventUpdated(string eventId) =>
        await Clients.All.SendAsync("eventUpdated", eventId);
    public async Task EventRemoved(string eventId) =>
        await Clients.All.SendAsync("eventRemoved", eventId);
}
