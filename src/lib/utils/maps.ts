import type { GeoPoint } from '@/lib/content/types';

/** Встраиваемый виджет 2ГИС с меткой базы — сгенерирован в конструкторе 2ГИС. */
export const MAP_EMBED_URL =
  'https://makemap.2gis.ru/widget?data=eJw1kFFvgjAUhf9L9yhxRaFYEh9IzdSlI-DL4hYfmO2wWaWkFJ0a__su4PrY75xzc84NGSuklWIpzVE6q2SD4s8bcpdaohi9yMK1ViIP1dbU0rqe39DeaGOBPxUklJOOO-V058Cvq7xJ2RTzpMQ82pSOYbw9bQ6CndeM57VgAeZfeZsyChoFViGbvVW1U6aCgGyVjDB_a9cpazvhSbARF-yA-aIPwfw0mLervFVnOPKcO7FMuFrkOgW-_QbPkmP-00AG5ioJMkbPWTmfw7HruhLyF8U-_n93D5VD-UtX7dE8M6pyoN8bGEhVheuH8YPJmFAa-F5AxpT42J_uwK8EikOK7zsPHYs6M40aytyQLhyKB60f-hFcnRFCiYd0xx9xExzOonBKSQTgaswRSASxMIvR-v0gpf7of51t5f0PQdyFuA';

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
