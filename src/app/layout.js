import ClientProvider from './components/ClientProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}