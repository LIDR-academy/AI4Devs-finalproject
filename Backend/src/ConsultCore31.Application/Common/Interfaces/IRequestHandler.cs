using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace ConsultCore31.Application.Common.Interfaces
{
    public interface IRequestHandler<TRequest, TResponse> : MediatR.IRequestHandler<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        new Task<TResponse> Handle(TRequest request, CancellationToken cancellationToken = default);
    }

    public interface IRequestHandler<TRequest> : IRequestHandler<TRequest, Unit>
        where TRequest : IRequest<Unit>
    {
    }
}
