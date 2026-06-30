using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Infrastructure.Data;

namespace Aura.Infrastructure.Repositories;

public class MessageTemplateRepository : Repository<MessageTemplate>, IMessageTemplateRepository
{
    public MessageTemplateRepository(ApplicationDbContext context) : base(context)
    {
    }
}
