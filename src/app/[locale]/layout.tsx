import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
import { YandexMetrica } from '@/components/analytics/yandex-metrica';
import { BookingProvider } from '@/components/booking/booking-provider';
import { ContactPopup } from '@/components/booking/contact-popup';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { MobileCtaBar } from '@/components/layout/mobile-cta-bar';
import { getMessages, htmlLang, isLocale, locales, type Locale } from '@/i18n/config';
import { getSiteContent } from '@/lib/content';
import { metricaId, siteUrl } from '@/lib/site';
import { display, sans } from '@/styles/fonts';
import '@/styles/globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * Локалей ровно две и они известны на билде. `dynamicParams = false` отдаёт
 * 404 на любой другой сегмент (`/de`, `/admin`) силами роутера — не доходя
 * до рендера лейаута.
 */
// Было false: Next отдавал 404, если страницы не оказалось в сборке.
// Любой сбой Directus в момент сборки клал весь сайт. Теперь
// недостающая страница рендерится по запросу.
export const dynamicParams = true;

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f5f0' },
    { media: '(prefers-color-scheme: dark)', color: '#14120f' },
  ],
  colorScheme: 'light',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const content = await getSiteContent(locale);

  const title = content.hero.title + ' — ' + content.hero.subtitle;
  const description = content.about.body[0];

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: '%s · ' + content.brand.wordmark,
    },
    description,
    applicationName: content.brand.wordmark,
    alternates: {
      canonical: '/' + locale,
      languages: { 'ru-RU': '/ru', 'en-US': '/en', 'x-default': '/ru' },
    },
    /**
     * Файлы иконок лежат в /public, а файловые конвенции Next ищут их
     * в app/. Без этого блока вкладка оставалась без иконки во всех браузерах.
     */
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/icon-light-32x32.png', sizes: '32x32', media: '(prefers-color-scheme: light)' },
        { url: '/icon-dark-32x32.png', sizes: '32x32', media: '(prefers-color-scheme: dark)' },
      ],
      apple: '/apple-icon.png',
    },
    openGraph: {
      type: 'website',
      siteName: content.brand.wordmark,
      locale: htmlLang[locale],
      title,
      description,
      url: '/' + locale,
      // images подставляет opengraph-image.tsx — руками дублировать не нужно.
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const messages = getMessages(typedLocale);
  const content = await getSiteContent(typedLocale);

  return (
    <html lang={htmlLang[typedLocale]} className={display.variable + ' ' + sans.variable}>
      <body>
        <BookingProvider>
          <a
            href="#main"
            className="focus:z-modal focus:bg-surface-raised focus:text-text-primary sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:rounded-sm focus:px-4 focus:py-2 focus:shadow-pop"
          >
            {messages.common.skipToContent}
          </a>
          <Header
            locale={typedLocale}
            messages={messages}
            settings={content.settings}
            wordmark={content.brand.wordmark}
          />
          <main id="main">{children}</main>
          <Footer locale={typedLocale} messages={messages} content={content} />
          <MobileCtaBar messages={messages} settings={content.settings} />
          <ContactPopup settings={content.settings} messages={messages} />
        </BookingProvider>
        <YandexMetrica counterId={metricaId} />
        <Analytics />
      </body>
    </html>
  );
}
