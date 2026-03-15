import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

type OptimisticConfig<TData, TVariables, TContext> = {
    /** The function that mutates the server data */
    mutationFn: (variables: TVariables) => Promise<TData>;
    /** An array of query keys that will be optimistically updated */
    queryKeys: unknown[][];
    /** The function that applies the optimistic update to the cache */
    optimisticUpdateFn: (variables: TVariables, queryClient: ReturnType<typeof useQueryClient>) => void;
    /** Optional onSuccess callback */
    onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void;
    /** Optional onError callback */
    onError?: (error: unknown, variables: TVariables, context: TContext | undefined) => void;
    /** Success message to display */
    successMessage?: { title: string; subtitle?: string };
    /** Error message to display on failure */
    errorMessage?: { title: string; subtitle?: string };
};

export function useOptimisticMutation<TData = unknown, TVariables = void, TContext = unknown>({
    mutationFn,
    queryKeys,
    optimisticUpdateFn,
    onSuccess,
    onError,
    successMessage,
    errorMessage,
}: OptimisticConfig<TData, TVariables, TContext>) {
    const queryClient = useQueryClient();

    return useMutation<TData, unknown, TVariables, { previousData: Record<string, unknown> }>({
        mutationFn,
        onMutate: async (variables) => {
            // Cancel any outgoing refetches so they don't overwrite optimistic update
            await Promise.all(queryKeys.map(key => queryClient.cancelQueries({ queryKey: key })));

            // Snapshot the previous values
            const previousData: Record<string, unknown> = {};
            queryKeys.forEach(key => {
                const queryHash = JSON.stringify(key);
                previousData[queryHash] = queryClient.getQueryData(key);
            });

            // Optimistically update
            optimisticUpdateFn(variables, queryClient);

            return { previousData };
        },
        onError: (err, variables, context) => {
            // Rollback to previous state
            if (context?.previousData) {
                queryKeys.forEach(key => {
                    const queryHash = JSON.stringify(key);
                    queryClient.setQueryData(key, context.previousData[queryHash]);
                });
            }

            console.error('Optimistic update failed:', err);

            if (errorMessage) {
                Toast.show({
                    type: 'error',
                    text1: errorMessage.title,
                    text2: errorMessage.subtitle || 'Could not communicate with the server. Reverting changes.',
                });
            }

            if (onError) onError(err, variables, context as unknown as TContext);
        },
        onSuccess: (data, variables, context) => {
            if (successMessage) {
                Toast.show({
                    type: 'success',
                    text1: successMessage.title,
                    text2: successMessage.subtitle,
                });
            }

            if (onSuccess) onSuccess(data, variables, context as unknown as TContext);
        },
        onSettled: () => {
             // Optional: Force a refetch in the background to ensure parity
             // queryKeys.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
        },
    });
}
