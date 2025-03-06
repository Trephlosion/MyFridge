import { useMutation } from "@tanstack/react-query";
import { signInAccount } from "@/lib/firebase/api.ts";

/**
 * Hook for handling user sign-in using React Query.
 * Calls the Firebase `signInAccount` function and handles mutations.
 */
export const useSignInAccount = () => {
    return useMutation({
        mutationFn: async ({ email, password }: { email: string; password: string }) => {
            return await signInAccount({ email, password });
        },
    });
};
