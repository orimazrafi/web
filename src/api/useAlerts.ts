import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAlerts, postAlert, type AlertSeverity } from "./client";

export function useAlerts(params: { message?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ["alerts", params.message ?? "", params.from ?? "", params.to ?? ""],
    queryFn: ({ signal }) => fetchAlerts({ ...params, signal }),
    enabled: true,
  });
}

export function useAddAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ message, severity }: { message: string; severity?: AlertSeverity }) =>
      postAlert({ message, severity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
