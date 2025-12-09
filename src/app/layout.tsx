import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Haven & Honey | Making Homes Feel Loved',
  description: 'Haven & Honey offers meal prep, cleaning, and home reset services. We bring warmth, intention, faith, and care into busy families and overwhelmed hearts.',
  keywords: ['meal prep', 'cleaning services', 'home organization', 'home resets', 'family services', 'Haven & Honey'],
  authors: [{ name: 'Linda - Haven & Honey' }],
  icons: {
    icon: '/images/haven-honey-logo-circle-transparent.png',
    shortcut: '/images/haven-honey-logo-circle-transparent.png',
    apple: '/images/haven-honey-logo-circle-transparent.png',
  },
  openGraph: {
    title: 'Haven & Honey | Making Homes Feel Loved',
    description: 'Meal prep, cleaning, and home reset services that bring peace and sweetness to your everyday life.',
    type: 'website',
    images: ['/images/haven-honey-logo-horizontal-transparent.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NCXXT6G8');`,
          }}
        />
        {/* End Google Tag Manager */}

        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-ER984TEN1V"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-ER984TEN1V');
            `,
          }}
        />
        {/* End Google Analytics */}

        <script async src="//www.instagram.com/embed.js"></script>
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NCXXT6G8"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#4E3B32',
              color: '#FDFBF7',
              borderRadius: '1rem',
              padding: '1rem 1.5rem',
              fontFamily: 'Lato, sans-serif',
            },
            success: {
              iconTheme: {
                primary: '#D4A853',
                secondary: '#FDFBF7',
              },
            },
            error: {
              iconTheme: {
                primary: '#E57373',
                secondary: '#FDFBF7',
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}

