import ClientProvider from '../components/ClientProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Mapping Tool</title>
        <link rel="icon" href="/CareSoftLogo.svg" />
      </head>
      <body>
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}