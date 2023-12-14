"use client"
import { trpc } from '@/app/_trpc/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { SessionProvider } from 'next-auth/react';
import { PropsWithChildren, useState } from "react"
import { absoluteUrl } from '@/lib/utils';

const Provider = ({ children }: PropsWithChildren) => {
    const [queryClient] = useState(() => new QueryClient())
    const [trpcClient] = useState(() => trpc.createClient({
        links: [
            httpBatchLink({
                url: absoluteUrl('/api/trpc'),
            
            }),
        ]
    }))
    return (
        <trpc.Provider
            client={trpcClient}
            queryClient={queryClient} >
            <QueryClientProvider client={queryClient}>
                <SessionProvider>
                    {children}
                </SessionProvider>
            </QueryClientProvider>
        </trpc.Provider>
    )
}

export default Provider
