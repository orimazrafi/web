import { useQuery } from "@tanstack/react-query";
import { fetchAuditLog } from "./client";

export function useAuditLog(params: { message?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ["auditLog", params.message ?? "", params.from ?? "", params.to ?? ""],
    queryFn: ({ signal }) => fetchAuditLog({ ...params, signal }),
    enabled: true,
  });
}
