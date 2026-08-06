import type { SiteContent } from '@/lib/content/types';

/**
 * Микроразметка LodgingBusiness. Для загородного объекта это единственный
 * способ попасть в карточку организации в выдаче: сайт одностраничный,
 * ссылочной массы нет, поэтому структурированные данные несут основную
 * нагрузку по идентификации бизнеса.
 */
export function lodgingJsonLd(content: SiteContent, url: string) {
  const { settings, brand } = content;

  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    '@id': url + '#business',
    name: content.hero.title,
    alternateName: brand.wordmark,
    description: content.about.body[0],
    url,
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
