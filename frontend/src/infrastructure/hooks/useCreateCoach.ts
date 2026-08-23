import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Coach, CoachFormData } from "@/domain/types/coach";
import { createCoach } from "@/domain/usecases/createCoach";
import { useToast } from "@/infrastructure/context/ToastContext";

export function useCreateCoach() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<Coach, Error, CoachFormData>({
    mutationFn: (form: CoachFormData) => createCoach(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      showToast("Coach created successfully", "success");
    },
    onError: () => {
      showToast("Something went wrong creating the coach", "error");
    },
  });
}
