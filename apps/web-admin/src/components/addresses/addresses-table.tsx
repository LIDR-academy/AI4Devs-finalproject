'use client';

import { Star } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddressesSortableColumnHeader } from './addresses-sortable-column-header';
import { formatAddress, formatFullName } from '@/lib/utils';
import type { AdminAddress, AddressSortByColumn, SortDir } from '@/types/api';

interface AddressesTableProps {
  addresses: AdminAddress[];
  sortBy: AddressSortByColumn;
  sortDir: SortDir;
}

export function AddressesTable({ addresses, sortBy, sortDir }: AddressesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead
            scope="col"
            aria-sort={sortBy === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
          >
            <AddressesSortableColumnHeader
              column="name"
              label="Usuario"
              currentSort={sortBy}
              currentDir={sortDir}
            />
          </TableHead>
          <TableHead
            scope="col"
            aria-sort={sortBy === 'alias' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
          >
            <AddressesSortableColumnHeader
              column="alias"
              label="Alias"
              currentSort={sortBy}
              currentDir={sortDir}
            />
          </TableHead>
          <TableHead scope="col">Dirección</TableHead>
          <TableHead
            scope="col"
            aria-sort={sortBy === 'postalCode' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
          >
            <AddressesSortableColumnHeader
              column="postalCode"
              label="Código Postal"
              currentSort={sortBy}
              currentDir={sortDir}
            />
          </TableHead>
          <TableHead
            scope="col"
            aria-sort={sortBy === 'city' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
          >
            <AddressesSortableColumnHeader
              column="city"
              label="Ciudad"
              currentSort={sortBy}
              currentDir={sortDir}
            />
          </TableHead>
          <TableHead
            scope="col"
            aria-sort={sortBy === 'province' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
          >
            <AddressesSortableColumnHeader
              column="province"
              label="Provincia"
              currentSort={sortBy}
              currentDir={sortDir}
            />
          </TableHead>
          <TableHead
            scope="col"
            aria-sort={sortBy === 'country' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
          >
            <AddressesSortableColumnHeader
              column="country"
              label="País"
              currentSort={sortBy}
              currentDir={sortDir}
            />
          </TableHead>
          <TableHead
            scope="col"
            aria-sort={sortBy === 'favorite' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
          >
            <AddressesSortableColumnHeader
              column="favorite"
              label="Favorita"
              currentSort={sortBy}
              currentDir={sortDir}
            />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {addresses.map((address) => (
          <TableRow key={address.id}>
            <TableCell className="font-medium">
              {formatFullName(address.user.firstName, address.user.lastName)}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {address.label ?? '—'}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground max-w-xs">
              {formatAddress(address)}
            </TableCell>
            <TableCell className="text-sm">{address.postalCode}</TableCell>
            <TableCell className="text-sm">{address.city}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {address.province ?? '—'}
            </TableCell>
            <TableCell className="text-sm">{address.country}</TableCell>
            <TableCell>
              {address.isDefault ? (
                <Star
                  className="h-4 w-4 fill-amber-400 text-amber-400"
                  aria-label="Favorita"
                />
              ) : (
                <Star
                  className="h-4 w-4 text-muted-foreground/40"
                  aria-label="No favorita"
                />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
