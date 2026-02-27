'use client';

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
import { UsersSortableColumnHeader } from './users-sortable-column-header';
import type { AdminUser, UserSortByColumn, SortDir } from '@/types/api';

interface UsersTableProps {
  users: AdminUser[];
  sortBy: UserSortByColumn;
  sortDir: SortDir;
}

export function UsersTable({ users, sortBy, sortDir }: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead
            scope="col"
            aria-sort={sortBy === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
          >
            <UsersSortableColumnHeader
              column="name"
              label="Nombre"
              currentSort={sortBy}
              currentDir={sortDir}
            />
          </TableHead>
          <TableHead scope="col">Teléfono</TableHead>
          <TableHead
            scope="col"
            aria-sort={sortBy === 'email' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
          >
            <UsersSortableColumnHeader
              column="email"
              label="Email"
              currentSort={sortBy}
              currentDir={sortDir}
            />
          </TableHead>
          <TableHead scope="col">Registrado</TableHead>
          <TableHead
            scope="col"
            aria-sort={sortBy === 'orders' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
          >
            <UsersSortableColumnHeader
              column="orders"
              label="Pedidos"
              currentSort={sortBy}
              currentDir={sortDir}
            />
          </TableHead>
          <TableHead
            scope="col"
            aria-sort={sortBy === 'addresses' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
          >
            <UsersSortableColumnHeader
              column="addresses"
              label="Direcciones"
              currentSort={sortBy}
              currentDir={sortDir}
            />
          </TableHead>
          <TableHead
            scope="col"
            aria-sort={sortBy === 'lastInteraction' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
          >
            <UsersSortableColumnHeader
              column="lastInteraction"
              label="Última interacción"
              currentSort={sortBy}
              currentDir={sortDir}
            />
          </TableHead>
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
