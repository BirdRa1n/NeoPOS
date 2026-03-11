import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="pt-br">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366F1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NeoPOS" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </Head>
      <body className="antialiased bg-[#F7F8FA] dark:bg-background">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
