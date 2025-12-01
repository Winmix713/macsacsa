import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callEdgeFunction, type ApiResponse } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface EdgeQueryOptions<T = unknown> {
  functionName: string;
  options?: Parameters<typeof callEdgeFunction>[1];
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
  refetchInterval?: number | false;
  staleTime?: number;
}

interface EdgeMutationOptions<T = unknown, V = unknown> {
  functionName: string;
  options?: Parameters<typeof callEdgeFunction>[1];
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export function useEdgeFunction<T = unknown>(
  functionName: string,
  options: Parameters<typeof callEdgeFunction>[1] = {}
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<T>, Error, unknown>({
    mutationFn: (variables?: unknown) =>
      callEdgeFunction<T>(functionName, {
        ...options,
        body: variables ?? options.body,
      }),
    onSuccess: (result) => {
      if (result.success && result.data !== undefined) {
        queryClient.invalidateQueries({ queryKey: [functionName] });
        toast({
          title: 'Success',
          description: `${functionName} completed successfully`,
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Unknown error occurred',
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useEdgeFunctionQuery<T = unknown>({
  functionName,
  options,
  onSuccess,
  onError,
  enabled = true,
  refetchInterval,
  staleTime,
}: EdgeQueryOptions<T>) {
  const { toast } = useToast();

  return useQuery({
    queryKey: [functionName, options],
    queryFn: () => callEdgeFunction<T>(functionName, options),
    enabled: enabled && Boolean(functionName),
    refetchInterval,
    staleTime,
    onSuccess: (response) => {
      if (response.success && response.data !== undefined) {
        onSuccess?.(response.data);
      } else {
        const errorMessage = response.error || 'Unknown error';
        onError?.(errorMessage);
        toast({
          title: 'Query Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      onError?.(error.message);
      toast({
        title: 'Query Error',
        description: error.message,
        variant: 'destructive',
      });
    },
    select: (response) => (response.success ? response.data ?? null : null),
  });
}

export function useEdgeFunctionMutation<T = unknown, V = unknown>({
  functionName,
  options,
  onSuccess,
  onError,
}: EdgeMutationOptions<T, V>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<T>, Error, V>({
    mutationFn: (variables: V) =>
      callEdgeFunction<T>(functionName, {
        ...options,
        body: variables,
      }),
    onSuccess: (result) => {
      if (result.success && result.data !== undefined) {
        onSuccess?.(result.data);
        queryClient.invalidateQueries({ queryKey: [functionName] });
        toast({
          title: 'Success',
          description: `${functionName} completed successfully`,
        });
      } else {
        const errorMessage = result.error || 'Unknown error';
        onError?.(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      onError?.(error.message);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export const useJobsList = () =>
  useEdgeFunctionQuery({
    functionName: 'jobs-list',
    options: { method: 'GET' },
  });

export const useJobCreate = () => useEdgeFunctionMutation({ functionName: 'jobs-create' });

export const useJobToggle = () => useEdgeFunctionMutation({ functionName: 'jobs-toggle' });

export const useModelsPerformance = () =>
  useEdgeFunctionQuery({
    functionName: 'models-performance',
    options: { method: 'GET' },
  });

export const useModelCompare = () => useEdgeFunctionMutation({ functionName: 'models-compare' });

export const useMonitoringMetrics = () =>
  useEdgeFunctionQuery({
    functionName: 'monitoring-metrics',
    options: { method: 'GET' },
  });

export const useAnalyticsData = () =>
  useEdgeFunctionQuery({
    functionName: 'analytics-data',
    options: { method: 'GET' },
  });

export const usePhase9CollaborativeIntelligence = () =>
  useEdgeFunctionQuery({
    functionName: 'phase9-collaborative-intelligence',
    options: { method: 'GET' },
  });

export const usePhase9MarketIntegration = () =>
  useEdgeFunctionMutation({ functionName: 'phase9-market-integration' });

export const useCrossLeagueAnalyze = () =>
  useEdgeFunctionMutation({ functionName: 'cross-league-analyze' });

export const useCrossLeagueCorrelations = () =>
  useEdgeFunctionQuery({
    functionName: 'cross-league-correlations',
    options: { method: 'GET' },
  });

export const usePatternsDetect = () => useEdgeFunctionMutation({ functionName: 'patterns-detect' });

export const useMetaPatternsDiscover = () =>
  useEdgeFunctionMutation({ functionName: 'meta-patterns-discover' });

export const useAIChat = () => useEdgeFunctionMutation({ functionName: 'ai-chat' });

export const useAdminModelAnalytics = () =>
  useEdgeFunctionQuery({
    functionName: 'admin-model-analytics',
    options: { method: 'GET' },
  });

export const useAdminModelTriggerTraining = () =>
  useEdgeFunctionMutation({ functionName: 'admin-model-trigger-training' });

export const useAdminPredictionReview = () =>
  useEdgeFunctionQuery({
    functionName: 'admin-prediction-review',
    options: { method: 'GET' },
  });

export const usePredictionAnalyzer = (params?: {
  metric?: 'accuracy_trends' | 'league_breakdown' | 'confidence_calibration';
  start_date?: string;
  end_date?: string;
  league?: string;
}) =>
  useEdgeFunctionQuery({
    functionName: 'prediction-analyzer',
    options: {
      method: 'GET',
      params,
    },
    enabled: Boolean(params && Object.keys(params).length > 0),
  });

export const useValueRankedPredictions = (matchIds?: string[]) =>
  useEdgeFunctionQuery({
    functionName: 'get-predictions',
    options: {
      method: 'GET',
      params: {
        value_ranking: 'true',
        match_ids: matchIds?.join(','),
      },
    },
    enabled: Array.isArray(matchIds) && matchIds.length > 0,
  });
