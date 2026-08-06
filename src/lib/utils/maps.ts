import type { GeoPoint } from '@/lib/content/types';

/**
 * Раньше `mapsUrl` был захардкожен как `https://yandex.ru/maps/` — то есть
 * кнопка «Показать карту» открывала главную страницу Яндекс.Карт, а не объект.
 *
 * Теперь ссылка выводится из данных:
 *   • есть координаты → открываем точку с меткой и зумом;
 *   • координат нет   → открываем поиск по адресу.
 * Второй вариант хуже первого, но принципиально лучше главной страницы:
 * гость всё-таки попадает в нужный район.
 */
export function buildMapsUrl(address: string, coordinates?: GeoPoint): string {
  if (coordinates) {
    const { lat, lng } = coordinates;
    // Яндекс принимает ll как «долгота,широта» — порядок обратный привычному.
    const params = new URLSearchParams({
      ll: `${lng},${lat}`,
      z: '16',
      pt: `${lng},${lat},pm2rdm`,
    });
    return `https://yandex.ru/maps/?${params.toString()}`;
  }

  return `https://yandex.ru/maps/?${new URLSearchParams({ text: address }).toString()}`;
}

/** Ссылка на построение маршрута из текущей точки пользователя. */
export function buildRouteUrl(address: string, coordinates?: GeoPoint): string {
  const destination = coordinates ? `${coordinates.lat},${coordinates.lng}` : address;
  return `https://yandex.ru/maps/?${new URLSearchParams({ rtext: `~${destination}`, rtt: 'auto' }).toString()}`;
}
