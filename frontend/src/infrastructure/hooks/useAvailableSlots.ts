import { useQuery } from "@tanstack/react-query";
import type { AvailableSlot, ClassType } from "@/domain/types/class";
import { getAvailableSlots } from "@/domain/usecases/getAvailableSlots";

export function useAvailableSlots(date?: string, coachId?: string, classType?: ClassType) {
  return useQuery<AvailableSlot[]>({
    queryKey: ["available-slots", { date, coachId, classType }],
    queryFn: async () => {
      if (!date || !coachId || !classType) {
        throw new Error("Missing required slot parameters");
      }
      return getAvailableSlots({ date, coachId, classType });
    },
    enabled: Boolean(date && coachId && classType),
  });
}
