// src/app/layout.tsx

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { CssBaseline } from '@mui/material';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider options={{ key: 'mui' }}>
          <CssBaseline />
          {children}
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}


