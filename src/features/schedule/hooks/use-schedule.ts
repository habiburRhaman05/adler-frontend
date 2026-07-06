import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ScheduleAPI } from "../api/schedule-api";

export * from "../api/schedule-api"; // re-export types and constants

export function useSchedulePlanner(month: number, weekRange: number) {
  const queryClient = useQueryClient();
  const queryKey = ["schedule", month, weekRange];

  const { data: state, isLoading } = useQuery({
    queryKey,
    queryFn: () => ScheduleAPI.getSchedule(month, weekRange),
  });

  const generateMutation = useMutation({
    mutationFn: () => ScheduleAPI.generateSchedule(month, weekRange),
    onSuccess: (newData) => {
      queryClient.setQueryData(queryKey, newData);
      toast.success("Schedule generated successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to generate schedule"),
  });

  const approveMutation = useMutation({
    mutationFn: () => ScheduleAPI.approveSchedule(month, weekRange),
    onSuccess: (newData) => {
      queryClient.setQueryData(queryKey, newData);
      toast.success("Schedule published and emails sent to staff.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to approve"),
  });

  const removeShiftMutation = useMutation({
    mutationFn: ({ staffId, dayIdx, shiftId }: { staffId: number; dayIdx: number; shiftId: string }) =>
      ScheduleAPI.removeShift(month, weekRange, staffId, dayIdx, shiftId),
    onSuccess: (newData) => {
      queryClient.setQueryData(queryKey, newData);
      toast.success("Shift removed.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to remove shift"),
  });

  const editShiftTimeMutation = useMutation({
    mutationFn: ({ staffId, dayIdx, shiftId, newTm }: { staffId: number; dayIdx: number; shiftId: string, newTm: string }) =>
      ScheduleAPI.editShiftTime(month, weekRange, staffId, dayIdx, shiftId, newTm),
    onSuccess: (newData) => {
      queryClient.setQueryData(queryKey, newData);
      toast.success("Shift time updated.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update time"),
  });

  const assignSlotMutation = useMutation({
    mutationFn: ({ violId, staffName, dayIdx, fnKey, tm, compOption }: { violId: string | null; staffName: string, dayIdx: number, fnKey: string, tm: string, compOption?: "overtime" | "reduce-future" }) =>
      ScheduleAPI.assignSlot(month, weekRange, violId, staffName, dayIdx, fnKey, tm, compOption),
    onSuccess: (newData) => {
      queryClient.setQueryData(queryKey, newData);
      toast.success(`Assigned successfully ✓`);
    },
    onError: (err: any) => toast.error(err.message || "Failed to assign"),
  });

  const applyFixMutation = useMutation({
    mutationFn: (violId: string) => ScheduleAPI.applyFix(month, weekRange, violId),
    onSuccess: (newData) => {
      queryClient.setQueryData(queryKey, newData);
      toast.success("Fixed — rule now passes ✓");
    },
    onError: (err: any) => toast.error(err.message || "Failed to apply fix"),
  });

  const simulateStaffResponseMutation = useMutation({
    mutationFn: ({ staffId, dayIdx, shiftId, action }: { staffId: number; dayIdx: number; shiftId: string; action: "accepted" | "rejected" }) =>
      ScheduleAPI.simulateStaffResponse(month, weekRange, staffId, dayIdx, shiftId, action),
    onSuccess: (newData, variables) => {
      queryClient.setQueryData(queryKey, newData);
      if (variables.action === "accepted") {
        toast.success(`Staff member accepted the shift.`);
      } else {
        toast.error(`Staff member rejected the shift. Unfilled demand created.`);
      }
    },
  });

  return {
    state,
    isLoading,
    generateSchedule: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    approveSchedule: approveMutation.mutateAsync,
    removeShift: removeShiftMutation.mutateAsync,
    editShiftTime: editShiftTimeMutation.mutateAsync,
    assignSlot: assignSlotMutation.mutateAsync,
    applyFix: applyFixMutation.mutateAsync,
    simulateStaffResponse: simulateStaffResponseMutation.mutateAsync,
  };
}
