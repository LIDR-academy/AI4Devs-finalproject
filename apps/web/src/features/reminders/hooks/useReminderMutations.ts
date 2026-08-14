import { useMutation, useQueryClient } from '@tanstack/react-query';
import { remindersApi } from '../services/remindersApi';

function invalidateReminderLists(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['reminders'] });
}

export function useSendReminders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehicleIds: string[]) =>
      remindersApi.sendReminders(vehicleIds),
    onSuccess: () => {
      invalidateReminderLists(queryClient);
    },
  });
}

export function useReminderOptOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehicleId: string) => remindersApi.optOut(vehicleId),
    onSuccess: () => {
      invalidateReminderLists(queryClient);
    },
  });
}

export function useReminderOptIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehicleId: string) => remindersApi.optIn(vehicleId),
    onSuccess: () => {
      invalidateReminderLists(queryClient);
    },
  });
}
