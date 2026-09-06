import {
  useFieldArray,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';
import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/lib/cn';
import type { CreateWorkOrderFormValues } from '../utils/createWorkOrderSchema';

interface InitialTasksEditorProps {
  control: Control<CreateWorkOrderFormValues>;
  register: UseFormRegister<CreateWorkOrderFormValues>;
  errors: FieldErrors<CreateWorkOrderFormValues>;
  disabled?: boolean;
}

export function InitialTasksEditor({
  control,
  register,
  errors,
  disabled = false,
}: InitialTasksEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'initialTasks',
  });

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-sm font-medium text-slate-700">
        Tareas iniciales
      </legend>

      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-3">
          <div className="flex-1 space-y-1">
            <label
              htmlFor={`initialTasks.${index}.description`}
              className="block text-sm text-slate-600"
            >
              Tarea {index + 1}
            </label>
            <input
              id={`initialTasks.${index}.description`}
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2',
                errors.initialTasks?.[index]?.description
                  ? 'border-red-500'
                  : 'border-slate-300',
              )}
              {...register(`initialTasks.${index}.description`)}
            />
            {errors.initialTasks?.[index]?.description && (
              <p className="text-sm text-red-600">
                {errors.initialTasks[index]?.description?.message}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="mt-7"
            disabled={disabled || fields.length <= 1}
            onClick={() => remove(index)}
          >
            Quitar
          </Button>
        </div>
      ))}

      {typeof errors.initialTasks?.message === 'string' && (
        <p className="text-sm text-red-600">{errors.initialTasks.message}</p>
      )}

      <Button
        type="button"
        variant="secondary"
        disabled={disabled}
        onClick={() => append({ description: '' })}
      >
        Agregar tarea
      </Button>
    </fieldset>
  );
}
