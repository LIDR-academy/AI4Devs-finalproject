'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { AdminUser } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

export interface UserComboboxValue {
  existingUserId?: string;
  firstName: string;
  lastName: string;
  phone: string;
  isRegistered?: boolean;
  addressCount?: number;
}

interface UserComboboxProps {
  users: AdminUser[];
  label: string;
  value: UserComboboxValue | null;
  onChange: (v: UserComboboxValue | null) => void;
}

export function UserCombobox({ users, label, value, onChange }: UserComboboxProps) {
  const [open, setOpen] = useState(false);

  const isFromDb = !!value?.existingUserId;
  const isReadonly = isFromDb;

  function handleSelectUser(user: AdminUser) {
    onChange({
      existingUserId: user.id,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phone: user.phone?.e164 ?? '',
      isRegistered: user.isRegistered,
      addressCount: user._count.addresses,
    });
    setOpen(false);
  }

  function handleManualEntry() {
    // Quitar existingUserId del value hace que isFromDb pase a false, liberando los campos
    onChange({ firstName: value?.firstName ?? '', lastName: value?.lastName ?? '', phone: value?.phone ?? '' });
  }

  function handleFieldChange(field: keyof Pick<UserComboboxValue, 'firstName' | 'lastName' | 'phone'>, val: string) {
    onChange({ ...(value ?? { firstName: '', lastName: '', phone: '' }), [field]: val });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-sm font-medium">{label}</Label>

        {/* Combobox de búsqueda */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal"
            >
              {isFromDb
                ? `${value!.firstName} ${value!.lastName} (${value!.phone})`
                : 'Buscar usuario...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar por nombre o teléfono..." />
              <CommandList>
                <CommandEmpty>Sin resultados.</CommandEmpty>
                <CommandGroup>
                  {users.map((user) => {
                    const display = [user.firstName, user.lastName].filter(Boolean).join(' ') || '(sin nombre)';
                    const phone = user.phone?.e164 ?? '';
                    return (
                      <CommandItem
                        key={user.id}
                        value={`${display} ${phone}`}
                        onSelect={() => handleSelectUser(user)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value?.existingUserId === user.id ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        <span className="flex-1">{display}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{phone}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Badge de estado Adresles */}
      {isFromDb && value && (
        <div className="flex items-center gap-2">
          {value.isRegistered ? (
            <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100">
              Registrado Adresles · {value.addressCount ?? 0} dirección(es)
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-muted-foreground">
              No Registrado Adresles · 0 direcciones
            </Badge>
          )}
          <button
            type="button"
            className="text-xs text-muted-foreground underline hover:text-foreground"
            onClick={handleManualEntry}
          >
            Introducir manualmente
          </button>
        </div>
      )}

      {/* Campos de texto */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Nombre</Label>
          <Input
            value={value?.firstName ?? ''}
            readOnly={isReadonly}
            onChange={(e) => handleFieldChange('firstName', e.target.value)}
            placeholder="Nombre"
            className={isReadonly ? 'bg-muted' : ''}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Apellidos</Label>
          <Input
            value={value?.lastName ?? ''}
            readOnly={isReadonly}
            onChange={(e) => handleFieldChange('lastName', e.target.value)}
            placeholder="Apellidos"
            className={isReadonly ? 'bg-muted' : ''}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Teléfono</Label>
        <Input
          value={value?.phone ?? ''}
          readOnly={isReadonly}
          onChange={(e) => handleFieldChange('phone', e.target.value)}
          placeholder="+34612345678"
          className={isReadonly ? 'bg-muted' : ''}
        />
      </div>

      {/* Botón manual si no hay usuario de DB seleccionado */}
      {!isFromDb && (
        <p className="text-xs text-muted-foreground">
          Busca un usuario de la base de datos o introduce los datos manualmente.
        </p>
      )}
    </div>
  );
}
