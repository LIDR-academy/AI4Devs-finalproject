import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCoachee } from "@/domain/usecases/updateCoachee";
import { useToast } from "@/infrastructure/context/ToastContext";

export function useUpdateCoachee(id: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (data: {
      name?: string;
      email?: string;
      phone?: string;
      classTypePreference?: string | null;
      additionalInfo?: string | null;
    }) => updateCoachee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coachees"] });
      queryClient.invalidateQueries({ queryKey: ["coachee", id] });
      showToast("Profile updated successfully", "success");
    },
    onError: () => {
      showToast("Something went wrong updating the profile", "error");
    },
  });
}
