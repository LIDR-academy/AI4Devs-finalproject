import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  { number: 1, label: 'Envío' },
  { number: 2, label: 'Pago' },
  { number: 3, label: 'Revisión' },
] as const;

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Progreso del checkout" className="mb-8">
      <ol className="flex items-center justify-center gap-0">
        {STEPS.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;

          return (
            <li
              key={step.number}
              role="listitem"
              aria-current={isActive ? 'step' : undefined}
              className="flex items-center"
            >
              <div className="flex flex-col items-center">
                <div
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                    isCompleted
                      ? 'bg-green-600 text-white'
                      : isActive
                        ? 'bg-rm-cta text-rm-cta-fg'
                        : 'bg-muted text-muted-foreground',
                  ].join(' ')}
                >
                  {isCompleted ? (
                    <Check data-testid="step-check" className="h-4 w-4" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={[
                    'mt-1 text-xs',
                    isActive ? 'font-semibold text-foreground' : 'text-muted-foreground',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={[
                    'mx-2 mb-4 h-px w-12 transition-colors',
                    step.number < currentStep ? 'bg-green-600' : 'bg-border',
                  ].join(' ')}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
