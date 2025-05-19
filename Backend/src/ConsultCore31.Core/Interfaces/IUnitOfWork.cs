using System.Threading.Tasks;

namespace ConsultCore31.Core.Interfaces
{
    public interface IUnitOfWork
    {
        Task<int> CommitAsync();
        void Rollback();
    }
}
