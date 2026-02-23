import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserRegisteredBadge } from './user-registered-badge';
import { formatFullName, formatPhone } from '@/lib/utils';
import { RelativeDateCell } from './relative-date-cell';
import type { AdminUser } from '@/types/api';

interface UsersTableProps {
  users: AdminUser[];
}

export function UsersTable({ users }: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Nombre</TableHead>
          <TableHead scope="col">Teléfono</TableHead>
          <TableHead scope="col">Email</TableHead>
          <TableHead scope="col">Registrado</TableHead>
          <TableHead scope="col">Pedidos</TableHead>
          <TableHead scope="col">Direcciones</TableHead>
          <TableHead scope="col">Última interacción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">
              {formatFullName(user.firstName, user.lastName)}
            </TableCell>
            <TableCell className="text-sm">
              {formatPhone(user.phone?.e164)}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {user.email ?? '—'}
            </TableCell>
            <TableCell>
              <UserRegisteredBadge isRegistered={user.isRegistered} />
            </TableCell>
            <TableCell className="text-sm">{user._count.orders}</TableCell>
            <TableCell className="text-sm">{user._count.addresses}</TableCell>
            <TableCell>
              <RelativeDateCell iso={user.lastInteractionAt} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
