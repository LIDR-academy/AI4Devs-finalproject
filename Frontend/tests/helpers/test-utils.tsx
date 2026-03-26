/**
 * Test render utilities. Add wrappers (QueryClient, Router, etc.) here
 * so components and hooks can be tested with consistent providers.
 */
/* eslint-disable react-refresh/only-export-components -- Test helper: exports both wrapper component and render utility */

import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

interface AllProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

function AllProviders({
  children,
  queryClient = defaultQueryClient,
}: AllProvidersProps): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

/**
 * Renders ui with QueryClient and BrowserRouter. Use for component tests
 * that need routing or React Query.
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient },
): ReturnType<typeof render> {
  const { queryClient, ...renderOptions } = options ?? {};
  return render(ui, {
    wrapper: ({ children }) => <AllProviders queryClient={queryClient}>{children}</AllProviders>,
    ...renderOptions,
  });
}

export * from '@testing-library/react';
export { customRender as render };
