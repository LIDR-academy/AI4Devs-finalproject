using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Infrastructure.Data;

namespace Aura.Infrastructure.Repositories;

public class PaymentRepository : Repository<Payment>, IPaymentRepository
{
    public PaymentRepository(ApplicationDbContext context) : base(context)
    {
    }
}
