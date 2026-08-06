import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { getMessages, isLocale, locales, type Locale } from '@/i18n/config';
import { getSiteContent } from '@/lib/content';
import { siteUrl } from '@/lib/site';

/**
 * Свой generateStaticParams обязателен: файл-конвенция изображения не наследует
 * параметры от layout, и без него Next оставляет маршрут динамическим
 * (`/-/opengraph-image`) — картинка генерировалась бы на каждый запрос краулера,
 * а Telegram и VK ждут ответа считаные секунды.
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Описание картинки уходит в `og:image:alt`.
 *
 * Оно двуязычное намеренно. Локализовать его штатным способом —
 * `generateImageMetadata()` — не вышло: внутри динамического сегмента
 * `[locale]` маршрут перестаёт пререндериться вовсе и отдаёт 404
 * (проверено на Next 16.2.6). Статическая генерация здесь важнее
 * идеального alt: краулеры Telegram и VK ждут ответа считаные секунды
 * и холодный старт функции не переживут.
 *
 * Строка одна на обе локали, поэтому в ней есть оба языка.
 */
export const alt = 'Хижина — база отдыха на Сахалине · Hizhina — a retreat on Sakhalin';

/**
 * Превью для мессенджеров.
 *
 * До этого блок `openGraph` существовал, но без `images`, и ссылка в Telegram,
 * VK и WhatsApp разворачивалась пустой карточкой. Для базы отдыха, чей трафик
 * идёт как раз из мессенджеров, это прямая потеря переходов.
 *
 * Шрифт лежит в репозитории, а не тянется из сети на билде: Satori не умеет
 * вариативные оси, поэтому исходный Comfortaa[wght].ttf заранее превращён
 * в два статических начертания и сабсеттнут до latin + cyrillic (38 КБ на файл).
 * Без вшитого шрифта кириллица в картинке превратилась бы в квадраты.
 */
const FONT_DIR = join(process.cwd(), 'src/assets/fonts');

async function loadFont(file: string): Promise<ArrayBuffer> {
  const buffer = await readFile(join(FONT_DIR, file));
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : 'ru';

  const [content, light, semibold] = await Promise.all([
    getSiteContent(locale),
    loadFont('Comfortaa-Light.ttf'),
    loadFont('Comfortaa-SemiBold.ttf'),
  ]);

  const messages = getMessages(locale);

  // В правом нижнем углу — домен, а не название базы: оно и так стоит
  // заголовком, а вот адрес сайта на пересланной карточке полезен.
  // На локальной сборке домена ещё нет — тогда падаем обратно на вордмарк.
  const host = siteUrl.replace(/^https?:\/\//, '');
  const signature = host.startsWith('localhost') ? content.brand.wordmark : host;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        backgroundColor: '#14120f',
        color: '#ede7db',
        fontFamily: 'Comfortaa',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 56, height: 3, backgroundColor: '#c47a45' }} />
        <div
          style={{
            fontSize: 24,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: '#c47a45',
            fontWeight: 600,
          }}
        >
          {messages.hero.eyebrow}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 84, lineHeight: 1.05, fontWeight: 300, color: '#ffffff' }}>
          {content.hero.title}
        </div>
        <div style={{ fontSize: 36, marginTop: 20, fontWeight: 300, opacity: 0.82 }}>
          {content.hero.subtitle}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderTop: '1px solid rgba(237,231,219,0.28)',
          paddingTop: 28,
          fontSize: 26,
          opacity: 0.85,
        }}
      >
        <div style={{ display: 'flex' }}>{content.settings.phone}</div>
        <div style={{ display: 'flex', fontWeight: 600, letterSpacing: 2 }}>{signature}</div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Comfortaa', data: light, weight: 300, style: 'normal' },
        { name: 'Comfortaa', data: semibold, weight: 600, style: 'normal' },
      ],
    },
  );
}
