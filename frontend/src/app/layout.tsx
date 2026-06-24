import { GoogleOAuthProvider } from '@react-oauth/google';
import './globals.css';
import { ToastProvider } from './components/ToastProvider';
import { FloatingLogo } from './components/FloatingLogo';
import { AppProvider } from './context/AppContext';

export const metadata = {
  title: 'StudyCircle - Collaborative Learning Workspace',
  description: 'Structured study workspace for B.Tech & degree students in Vijayawada, Guntur, Vizag, and surrounding colleges.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#0A0B10] text-zinc-100 min-h-screen antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {(() => {
          const primaryClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
          const fallbackClientId = process.env.VITE_GOOGLE_CLIENT_ID;
          
          // Next.js convention is primary, Vite is compatibility fallback
          const googleClientId = (primaryClientId || fallbackClientId || "").trim();
          
          if (!googleClientId) {
            return (
              <AppProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </AppProvider>
            );
          }

          return (
            <GoogleOAuthProvider clientId={googleClientId}>
              <AppProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </AppProvider>
            </GoogleOAuthProvider>
          );
        })()}
        <FloatingLogo />
      </body>
    </html>
  );
}