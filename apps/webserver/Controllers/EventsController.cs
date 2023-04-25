using Microsoft.AspNetCore.Mvc;

namespace WebServer;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    public EventsController(CurrentData current, ILogger<EventsController> logger)
    {
        Current = current ?? throw new ArgumentNullException(nameof(current));
        Logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public CurrentData Current { get; }
    public ILogger<EventsController> Logger { get; }

    [HttpGet]
    public IEnumerable<EventItem> Get()
    {
        return Current.EventItems;
    }
}
