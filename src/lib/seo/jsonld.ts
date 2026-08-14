import type { SiteContent } from '@/lib/content/types';
import { absoluteUrl } from '@/lib/site';

/**
 * Фото для карточки в поиске. Тот же приоритет, что у фона первого экрана
 * (см. `Hero`): постер видео главнее статичной картинки. Без него Google
 * не показывает расширенный сниппет для LodgingBusiness.
 */
function representativeImage(content: SiteContent): string | undefined {
  const src =
    content.hero.video?.poster.src ??
    content.hero.image?.src ??
    content.about.image?.src ??
    content.cabins[0]?.image?.src;
  if (!src) return undefined;
  return src.startsWith('http') ? src : absoluteUrl(src);
}

/**
 * Микроразметка LodgingBusiness. Для загородного объекта это единственный
 * способ попасть в карточку организации в выдаче: сайт одностраничный,
 * ссылочной массы нет, поэтому структурированные данные несут основную
 * нагрузку по идентификации бизнеса.
 */
export function lodgingJsonLd(content: SiteContent, url: string) {
  const { settings, brand } = content;
  const image = representativeImage(content);

  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    '@id': url + '#business',
    name: content.hero.title,
    alternateName: brand.wordmark,
    description: content.about.body[0],
    url,
    ...(image ? { image } : {}),
    telephone: settings.phone,
    email: settings.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address,
      addressCountry: 'RU',
      addressRegion: 'Сахалинская область',
      addressLocality: 'Южно-Сахалинск',
      postalCode: '693005',
    },
    ...(settings.coordinates
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: settings.coordinates.lat,
            longitude: settings.coordinates.lng,
          },
        }
      : {}),
    sameAs: [settings.vk, settings.telegramBot].filter(Boolean),
    priceRange: '5000–15000 RUB',
    currenciesAccepted: 'RUB',
    amenityFeature: content.services.map((service) => ({
      '@type': 'LocationFeatureSpecification',
      name: service.name,
      value: true,
    })),
    makesOffer: [
      ...content.cabins.map((cabin) => ({
        '@type': 'Offer',
        name: cabin.name,
        description: cabin.description,
        price: cabin.pricePerNight,
        priceCurrency: 'RUB',
        availability: 'https://schema.org/InStock',
      })),
      ...content.extras.map((extra) => ({
        '@type': 'Offer',
        name: extra.name,
        price: extra.price,
        priceCurrency: 'RUB',
      })),
    ],
  };
}
