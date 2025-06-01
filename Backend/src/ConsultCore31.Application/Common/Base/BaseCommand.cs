using MediatR;
using System;

namespace ConsultCore31.Application.Common.Base
{
    public abstract class BaseCommand<TResponse> : IRequest<TResponse>
    {
        public Guid Id { get; }

        protected BaseCommand()
        {
            Id = Guid.NewGuid();
        }

        protected BaseCommand(Guid id)
        {
            Id = id;
        }
    }

    public abstract class BaseCommand : BaseCommand<Unit>
    {
        protected BaseCommand() : base() { }
        protected BaseCommand(Guid id) : base(id) { }
    }

    public abstract class BaseQuery<TResponse> : IRequest<TResponse>
    {
        public Guid Id { get; }

        protected BaseQuery()
        {
            Id = Guid.NewGuid();
        }
    }
}
