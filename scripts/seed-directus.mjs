/**
 * Заливает контент из репозитория в Directus (идемпотентно: upsert по locale/slug).
 *
 *   node --env-file=.env scripts/seed-directus.mjs
 */

const DIRECTUS_URL = (process.env.DIRECTUS_URL || process.env.DIRECTUS_PUBLIC_URL || 'http://localhost:8055').replace(
  /\/+$/,
  '',
);
const EMAIL = process.env.BOOTSTRAP_ADMIN_EMAIL || process.env.DIRECTUS_ADMIN_EMAIL;
const PASSWORD = process.env.BOOTSTRAP_ADMIN_PASSWORD || process.env.DIRECTUS_ADMIN_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error('Нужны BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD');
  process.exit(1);
}

const settings = {
  legal_name: 'ИП Филимонова Т. А.',
  inn: '651200771931',
  ogrnip: '324650000004441',
  legal_address: '693005, Сахалинская область, г. Южно-Сахалинск, пер. Дачный, д. 8',
  phone: '+7 (924) 182-19-64',
  phone_href: 'tel:+79241821964',
  email: 'tanjafil@list.ru',
  telegram_bot: 'https://t.me/Hizhina_booking_bot',
  whatsapp: 'https://wa.me/79241821964',
  vk: 'https://vk.com/hizhina',
  address: '693005, Сахалинская область, г. Южно-Сахалинск, пер. Дачный, д. 8',
  lat: null,
  lng: null,
  directions: [],
};

const pages = {
  ru: {
    status: 'published',
    locale: 'ru',
    wordmark: 'Хижина',
    legal_name: settings.legal_name,
    hero_title: 'База отдыха «Хижина»',
    hero_subtitle: 'Отдых на природе с комфортом',
    about_title: 'Место, где выдыхают',
    about_body: [
      'Тишина, лес, баня на дровах. Идеальное место для перезагрузки.',
      'Мы построили «Хижину» для тех, кому нужен не отель, а пауза: несколько домиков на краю леса, чан с горячей водой под открытым небом и никакой спешки.',
    ],
  },
  en: {
    status: 'published',
    locale: 'en',
    wordmark: 'Hizhina',
    legal_name: 'Tatiana Filimonova, sole proprietor',
    hero_title: 'Hizhina Retreat',
    hero_subtitle: 'Nature, comfortably',
    about_title: 'A place to exhale',
    about_body: [
      'Silence, forest, a wood-fired banya. A perfect place to reset.',
      'We built Hizhina for people who need a pause rather than a hotel: a few cabins at the forest edge, a hot tub under open sky, and no rush at all.',
    ],
  },
};

const cabins = {
  ru: [
    {
      status: 'published',
      locale: 'ru',
      sort: 1,
      slug: 'cabin-a',
      name: 'Домик',
      description:
        'Тёплый дом с большим окном в лес: двуспальная кровать, раскладной диван, обеденный стол и терраса. Постель, полотенца и свет — всё уже внутри, привозить ничего не нужно.',
      meta: 'до 4 гостей · 22 часа · заезд с 14:00',
      price_per_night: 15000,
      price_unit: 'за дом, 22 часа, до 4 гостей',
      price_note: 'Продление до 6 часов — 5 000 ₽',
      features: [
        'Двуспальная кровать',
        'Раскладной диван на двоих',
        'Постельные принадлежности',
        'Отопление',
        'Освещение и розетки',
        'Стол и терраса',
      ],
      rules: [
        'Заезд с 14:00, проживание 22 часа',
        'Продление до 6 часов — 5 000 ₽',
        'Максимум 4 гостя',
        'Фурако и баня бронируются отдельно',
      ],
    },
  ],
  en: [
    {
      status: 'published',
      locale: 'en',
      sort: 1,
      slug: 'cabin-a',
      name: 'The cabin',
      description:
        'A warm cabin with a wide window into the forest: a double bed, a sofa bed, a dining table and a terrace. Linen, towels and lighting are already inside — bring nothing.',
      meta: 'up to 4 guests · 22 hours · check-in from 2 pm',
      price_per_night: 15000,
      price_unit: 'per cabin, 22 hours, up to 4 guests',
      price_note: 'Extension up to 6 hours — 5,000 ₽',
      features: [
        'Double bed',
        'Sofa bed for two',
        'Bed linen and towels',
        'Heating',
        'Lighting and power sockets',
        'Dining table and terrace',
      ],
      rules: [
        'Check-in from 2 pm, 22-hour stay',
        'Extension up to 6 hours — 5,000 ₽',
        'Maximum 4 guests',
        'Furako and banya are booked separately',
      ],
    },
  ],
};

const services = {
  ru: [
    {
      status: 'published',
      locale: 'ru',
      sort: 1,
      key: 'furako',
      name: 'Японская баня «Фурако»',
      description:
        'Горячий чан под открытым небом. Предоставляем халаты, тапочки, полотенца и шапки.',
      meta: 'нагрев до 40 °C · до 4 гостей',
      price: '7 000 ₽',
      standalone_bookable: false,
    },
    {
      status: 'published',
      locale: 'ru',
      sort: 2,
      key: 'banya',
      name: 'Русская баня на дровах',
      description:
        'Парная с настоящим жаром. Простыни, полотенца, тапочки, шапки, чай и снэки включены.',
      meta: 'до 6 гостей · 2 часа',
      price: '5 000 ₽ · продление 1 000 ₽/час',
      standalone_bookable: true,
    },
    {
      status: 'published',
      locale: 'ru',
      sort: 3,
      key: 'common_house',
      name: 'Общий дом с детской комнатой',
      description: 'Камин, кухонное оборудование, зона отдыха и отдельная детская с игрушками.',
      meta: 'до 25 гостей · 14:00–24:00',
      price: 'до 15 чел. — 15 000 ₽ · от 16 до 25 — 1 000 ₽/чел.',
      standalone_bookable: true,
    },
  ],
  en: [
    {
      status: 'published',
      locale: 'en',
      sort: 1,
      key: 'furako',
      name: 'Furako hot tub',
      description: 'An open-air hot tub. Robes, slippers, towels and hats are provided.',
      meta: 'heated to 40 °C · up to 4 guests',
      price: '7,000 RUB',
      standalone_bookable: false,
    },
    {
      status: 'published',
      locale: 'en',
      sort: 2,
      key: 'banya',
      name: 'Wood-fired Russian banya',
      description: 'A real steam room. Sheets, towels, slippers, hats, tea and snacks included.',
      meta: 'up to 6 guests · 2 hours',
      price: '5,000 RUB · extension 1,000 RUB/hour',
      standalone_bookable: true,
    },
    {
      status: 'published',
      locale: 'en',
      sort: 3,
      key: 'common_house',
      name: 'Common house with a kids room',
      description: 'Fireplace, kitchen equipment, lounge area and a separate room for children.',
      meta: 'up to 25 guests · 14:00–24:00',
      price: 'up to 15 guests — 15,000 RUB · 16 to 25 — 1,000 RUB per guest',
      standalone_bookable: true,
    },
  ],
};

const extras = {
  ru: [
    { status: 'published', locale: 'ru', sort: 1, slug: 'coal', name: 'Уголь древесный, 3 кг', price: 500 },
    { status: 'published', locale: 'ru', sort: 2, slug: 'firestarter', name: 'Средство для розжига', price: 300 },
    { status: 'published', locale: 'ru', sort: 3, slug: 'broom', name: 'Веник дубовый или берёзовый', price: 500 },
  ],
  en: [
    { status: 'published', locale: 'en', sort: 1, slug: 'coal', name: 'Charcoal, 3 kg', price: 500 },
    { status: 'published', locale: 'en', sort: 2, slug: 'firestarter', name: 'Fire starter', price: 300 },
    { status: 'published', locale: 'en', sort: 3, slug: 'broom', name: 'Oak or birch broom', price: 500 },
  ],
};

async function login() {
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`login: ${res.status} ${await res.text()}`);
  return (await res.json()).data.access_token;
}

function client(token) {
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  return {
    async get(path) {
      const res = await fetch(`${DIRECTUS_URL}${path}`, { headers });
      const body = await res.json().catch(() => null);
      return { ok: res.ok, status: res.status, body };
    },
    async post(path, data) {
      const res = await fetch(`${DIRECTUS_URL}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => null);
      return { ok: res.ok, status: res.status, body };
    },
    async patch(path, data) {
      const res = await fetch(`${DIRECTUS_URL}${path}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => null);
      return { ok: res.ok, status: res.status, body };
    },
  };
}

async function upsertSingleton(api, collection, data) {
  const existing = await api.get(`/items/${collection}`);
  if (existing.ok && existing.body?.data) {
    const id = existing.body.data.id;
    const res = await api.patch(id ? `/items/${collection}/${id}` : `/items/${collection}`, data);
    if (!res.ok) throw new Error(`patch ${collection}: ${JSON.stringify(res.body)}`);
    console.log(`  ${collection} — обновлён`);
    return;
  }
  const res = await api.post(`/items/${collection}`, data);
  if (!res.ok) throw new Error(`post ${collection}: ${JSON.stringify(res.body)}`);
  console.log(`  ${collection} — создан`);
}

async function upsertByFilter(api, collection, filterQuery, data) {
  const existing = await api.get(`/items/${collection}?${filterQuery}&limit=1`);
  const row = existing.body?.data?.[0];
  if (row?.id) {
    const res = await api.patch(`/items/${collection}/${row.id}`, data);
    if (!res.ok) throw new Error(`patch ${collection}: ${JSON.stringify(res.body)}`);
    return 'updated';
  }
  const res = await api.post(`/items/${collection}`, data);
  if (!res.ok) throw new Error(`post ${collection}: ${JSON.stringify(res.body)}`);
  return 'created';
}

async function main() {
  console.log(`Seed → ${DIRECTUS_URL}`);
  const token = await login();
  const api = client(token);

  console.log('settings…');
  await upsertSingleton(api, 'settings', settings);

  for (const locale of ['ru', 'en']) {
    console.log(`pages ${locale}…`);
    await upsertByFilter(
      api,
      'pages',
      `filter[locale][_eq]=${locale}`,
      pages[locale],
    );

    console.log(`cabins ${locale}…`);
    for (const cabin of cabins[locale]) {
      const action = await upsertByFilter(
        api,
        'cabins',
        `filter[locale][_eq]=${locale}&filter[slug][_eq]=${cabin.slug}`,
        cabin,
      );
      console.log(`  ${cabin.slug} — ${action}`);
    }

    console.log(`services ${locale}…`);
    for (const service of services[locale]) {
      const action = await upsertByFilter(
        api,
        'services',
        `filter[locale][_eq]=${locale}&filter[key][_eq]=${service.key}`,
        service,
      );
      console.log(`  ${service.key} — ${action}`);
    }

    console.log(`extras ${locale}…`);
    for (const extra of extras[locale]) {
      const action = await upsertByFilter(
        api,
        'extras',
        `filter[locale][_eq]=${locale}&filter[slug][_eq]=${extra.slug}`,
        extra,
      );
      console.log(`  ${extra.slug} — ${action}`);
    }
  }

  console.log('\nSeed готов.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
