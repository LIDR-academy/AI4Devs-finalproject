using MediatR;

namespace ConsultCore31.Application.Common.Base
{
    public abstract class BaseCommand<TResponse> : IRequest<TResponse>
    {
        protected BaseCommand()
        {
            Id = Guid.NewGuid();
        }

        protected BaseCommand(Guid id)
        {
            Id = id;
        }

        public Guid Id { get; }
    }

    public abstract class BaseCommand : BaseCommand<Unit>
    {
        protected BaseCommand() : base()
        {
        }

        protected BaseCommand(Guid id) : base(id)
        {
        }
    }

    public abstract class BaseQuery<TResponse> : IRequest<TResponse>
    {
        protected BaseQuery()
        {
            Id = Guid.NewGuid();
        }

        public Guid Id { get; }
    }
}