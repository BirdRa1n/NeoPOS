import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from '@/contexts/AuthContext';
import { StoreProvider } from '@/contexts/StoreContext';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <StoreProvider>
        <Component {...pageProps} />
        <Toaster position="top-right" />
      </StoreProvider>
    </AuthProvider>
  );
}
