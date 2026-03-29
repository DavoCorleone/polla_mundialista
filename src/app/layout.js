import './globals.css';

export const metadata = {
  title: 'Polla Mundialista | Grupo Palacios',
  description: 'Participa en la polla mundialista de Grupo Palacios para el partido Ecuador vs Marruecos.',
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: '/logo-gp-favicon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <main className="container">
          <header className="header">
            <img src="/logo-gp-horizontal.svg" alt="Grupo Palacios" className="logo" />
          </header>
          {children}
        </main>
      </body>
    </html>
  )
}
