import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Raiz HTML gerada no Expo Router para a Web.
 * Contém metadados de SEO, OpenGraph, Twitter Cards e verificação do Search Console.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* SEO Metadados Primários */}
        <title>Va'aFlow • Canoa Para Todos | Canoagem Inclusiva em São Sebastião/SP</title>
        <meta
          name="description"
          content="Agendamento inclusivo de canoagem polinésia adaptada (Va'a) para paratletas e pessoas com deficiência na Praia Grande em São Sebastião - SP. Vivências no mar 100% gratuitas."
        />
        <meta
          name="keywords"
          content="canoa havaiana, va'a, inclusão, paratleta, são sebastião, acessibilidade, canoa para todos, esporte adaptado, wcag, praia grande são sebastião"
        />
        <meta name="author" content="Projeto Canoa Para Todos" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://canoaparatodos.org/" />

        {/* Geolocalização Náutica (Praia Grande • São Sebastião - SP) */}
        <meta name="geo.region" content="BR-SP" />
        <meta name="geo.placename" content="São Sebastião" />
        <meta name="geo.position" content="-23.8166;-45.4166" />
        <meta name="ICBM" content="-23.8166, -45.4166" />

        {/* OpenGraph / Facebook / WhatsApp */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://canoaparatodos.org" />
        <meta property="og:title" content="Va'aFlow • Canoa Para Todos | Inclusão sobre as Águas" />
        <meta
          property="og:description"
          content="A água não impõe barreiras. Ela liberta. Agendamento inclusivo de canoagem adaptada em São Sebastião/SP com esteira plana e monitores."
        />
        <meta property="og:image" content="https://canoaparatodos.org/cpt-logo.png" />
        <meta property="og:image:alt" content="Logo Oficial do Projeto Canoa Para Todos" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:site_name" content="Canoa Para Todos" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Va'aFlow • Canoa Para Todos" />
        <meta
          name="twitter:description"
          content="Canoagem polinésia inclusiva na Praia Grande em São Sebastião - SP."
        />
        <meta name="twitter:image" content="https://canoaparatodos.org/cpt-logo.png" />

        {/* Verificação Google Search Console (Substituir pelo token da propriedade) */}
        <meta name="google-site-verification" content="GSC_VERIFICATION_TOKEN_CPT_2026" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}

