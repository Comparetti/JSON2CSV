using Domain.Models;

namespace Domain.Interfaces
{
    public interface IConversaoService
    {
        ConversaoResultado ConverterJsonParaCsv(string jsonString);
    }
}
