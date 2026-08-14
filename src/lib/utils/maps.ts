import type { GeoPoint } from '@/lib/content/types';

/** Встраиваемый виджет 2ГИС с меткой базы — сгенерирован в конструкторе 2ГИС. */
export const MAP_EMBED_URL =
  'https://makemap.2gis.ru/widget?data=eJw1kFFvgjAUhf9L9yhxrVRISXwgNVOXjsBeFrf4wGyHzSolpeiU-N93wa2P_c45957bI-ukckqulD0q77RqUfLRI39pFErQkyp95xQKUONso5wfeY_21lgH_KGM5mo2cK-9GRz4eV20GQ-xSCss4tfKc4y3p9eD5OcNF0UjOcXis-gyzkCjwSpVu3e68drWEJCv0wkWL90m490gPEk-EZIfsFiOIVic7ubtuuj0GYY8Fl6uUqGXhcmAb7_AsxJYfLeQgYVOac7ZOa8WCxh23dRS_aCE4P93C1B1L38Zqv01z62uPej3Fg6k69KPhyF0No0YoySg0ZRFBJNwB34tUTJn-LYL0LFsctvqe5kemdKj5K6lM8bmLCSUxDRAZuBDXAwrhARQHIchgKu1RyAxxMJZrDFvB6XM-_jrXaduv0Aqhag';

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

/**
 * Короткий адрес для тесной подложки на карте: без индекса и области —
 * это не письмо, гость и так смотрит на карту с меткой города.
 */
export function shortAddress(address: string): string {
  return address
    .replace(/^\d{6},\s*/, '')
    .replace(/Сахалинская область,\s*/i, '')
    .trim();
}

/** Ссылка на построение маршрута из текущей точки пользователя. */
export function buildRouteUrl(address: string, coordinates?: GeoPoint): string {
  const destination = coordinates ? `${coordinates.lat},${coordinates.lng}` : address;
  return `https://yandex.ru/maps/?${new URLSearchParams({ rtext: `~${destination}`, rtt: 'auto' }).toString()}`;
}
