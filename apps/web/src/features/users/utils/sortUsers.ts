import type { UserListItem } from '../types/user.types';

export function sortUsers(users: UserListItem[]): UserListItem[] {
  return [...users].sort((a, b) => {
    if (a.active !== b.active) {
      return a.active ? -1 : 1;
    }

    return a.fullName.localeCompare(b.fullName, 'es');
  });
}
