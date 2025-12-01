import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { AdminAuditAction } from "@/types/admin";

interface AuditLogPayload {
  action: AdminAuditAction;
  details: Record<string, unknown>;
}

const insertAuditLog = async (payload: AuditLogPayload): Promise<void> => {
  const { error } = await supabase.from("admin_audit_log").insert({
    action: payload.action,
    details: payload.details,
  });

  if (error) {
    throw error;
  }
};

export const useAuditLog = () => {
  const { user } = useAuth();

  const mutation = useMutation<void, Error, AuditLogPayload>({
    mutationFn: async (payload) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      await insertAuditLog(payload);
    },
  });

  const log = async (action: AdminAuditAction, details: Record<string, unknown>) => {
    if (!user?.id) {
      return;
    }

    try {
      await mutation.mutateAsync({ action, details });
    } catch (error) {
      console.error("Failed to log admin action", error);
    }
  };

  return {
    log,
    isLogging: mutation.isPending,
  };
};
