/**
 * Создаёт коллекции, поля, роль Website и static token в Directus.
 *
 * Usage:
 *   cp .env.example .env   # заполнить пароли
 *   docker compose up -d db directus
 *   node --env-file=.env scripts/bootstrap-directus.mjs
 *
 * Повторный запуск идемпотентен: существующие коллекции/роль пропускаются.
 */

const DIRECTUS_URL = (process.env.DIRECTUS_URL || process.env.DIRECTUS_PUBLIC_URL || 'http://localhost:8055').replace(
  /\/+$/,
  '',
);
const EMAIL = process.env.BOOTSTRAP_ADMIN_EMAIL || process.env.DIRECTUS_ADMIN_EMAIL;
const PASSWORD = process.env.BOOTSTRAP_ADMIN_PASSWORD || process.env.DIRECTUS_ADMIN_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error('Нужны BOOTSTRAP_ADMIN_EMAIL и BOOTSTRAP_ADMIN_PASSWORD (или DIRECTUS_ADMIN_*).');
  process.exit(1);
}

async function waitForDirectus(maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${DIRECTUS_URL}/server/health`);
      if (res.ok) return;
    } catch {
      // ещё не поднялся
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Directus не ответил на ${DIRECTUS_URL}`);
}

async function login() {
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) {
    throw new Error(`Login failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return json.data.access_token;
}

function api(token) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  return {
    async get(path) {
      const res = await fetch(`${DIRECTUS_URL}${path}`, { headers });
      const text = await res.text();
      const body = text ? JSON.parse(text) : null;
      return { ok: res.ok, status: res.status, body };
    },
    async post(path, data) {
      const res = await fetch(`${DIRECTUS_URL}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      const text = await res.text();
      const body = text ? JSON.parse(text) : null;
      return { ok: res.ok, status: res.status, body };
    },
    async patch(path, data) {
      const res = await fetch(`${DIRECTUS_URL}${path}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });
      const text = await res.text();
      const body = text ? JSON.parse(text) : null;
      return { ok: res.ok, status: res.status, body };
    },
  };
}

async function ensureCollection(client, collection, meta = {}) {
  const existing = await client.get(`/collections/${collection}`);
  if (existing.ok) {
    console.log(`  collection ${collection} — уже есть`);
    return;
  }
  const res = await client.post('/collections', {
    collection,
    meta: {
      accountability: 'all',
      ...meta,
    },
    schema: {},
  });
  if (!res.ok) {
    throw new Error(`create collection ${collection}: ${res.status} ${JSON.stringify(res.body)}`);
  }
  console.log(`  collection ${collection} — создана`);
}

async function ensureField(client, collection, field) {
  const existing = await client.get(`/fields/${collection}/${field.field}`);
  if (existing.ok) {
    return;
  }
  const res = await client.post(`/fields/${collection}`, field);
  if (!res.ok) {
    throw new Error(
      `create field ${collection}.${field.field}: ${res.status} ${JSON.stringify(res.body)}`,
    );
  }
}

const stringField = (field, opts = {}) => ({
  field,
  type: 'string',
  meta: {
    interface: 'input',
    required: !!opts.required,
    width: opts.width || 'full',
    note: opts.note,
    options: opts.options,
  },
  schema: {
    is_nullable: !opts.required,
    default_value: opts.defaultValue ?? null,
  },
});

const textField = (field, opts = {}) => ({
  field,
  type: 'text',
  meta: {
    interface: 'input-multiline',
    required: !!opts.required,
    width: opts.width || 'full',
    note: opts.note,
  },
  schema: { is_nullable: !opts.required },
});

const integerField = (field, opts = {}) => ({
  field,
  type: 'integer',
  meta: {
    interface: 'input',
    required: !!opts.required,
    width: opts.width || 'half',
    note: opts.note,
  },
  schema: { is_nullable: !opts.required },
});

const floatField = (field, opts = {}) => ({
  field,
  type: 'float',
  meta: {
    interface: 'input',
    required: !!opts.required,
    width: opts.width || 'half',
    note: opts.note,
  },
  schema: { is_nullable: !opts.required },
});

const booleanField = (field, opts = {}) => ({
  field,
  type: 'boolean',
  meta: {
    interface: 'boolean',
    required: !!opts.required,
    width: opts.width || 'half',
    note: opts.note,
  },
  schema: {
    is_nullable: false,
    default_value: opts.defaultValue ?? false,
  },
});

const jsonField = (field, opts = {}) => ({
  field,
  type: 'json',
  meta: {
    interface: 'input-code',
    options: { language: 'json' },
    required: !!opts.required,
    width: 'full',
    note: opts.note,
  },
  schema: { is_nullable: !opts.required },
});

const selectField = (field, choices, opts = {}) => ({
  field,
  type: 'string',
  meta: {
    interface: 'select-dropdown',
    required: !!opts.required,
    width: opts.width || 'half',
    options: { choices: choices.map((c) => ({ text: c, value: c })) },
    note: opts.note,
  },
  schema: { is_nullable: !opts.required },
});

const fileField = (field, opts = {}) => ({
  field,
  type: 'uuid',
  meta: {
    interface: 'file-image',
    special: ['file'],
    required: !!opts.required,
    width: opts.width || 'half',
    note: opts.note,
  },
  schema: { is_nullable: !opts.required, foreign_key_table: 'directus_files' },
});

const statusField = () => ({
  field: 'status',
  type: 'string',
  meta: {
    interface: 'select-dropdown',
    options: {
      choices: [
        { text: 'Published', value: 'published' },
        { text: 'Draft', value: 'draft' },
      ],
    },
    width: 'half',
    required: true,
  },
  schema: { is_nullable: false, default_value: 'published' },
});

const sortField = () => ({
  field: 'sort',
  type: 'integer',
  meta: { interface: 'input', width: 'half' },
  schema: { is_nullable: true },
});

async function ensureRelation(client, relation) {
  const list = await client.get(
    `/relations?filter[collection][_eq]=${relation.collection}&filter[field][_eq]=${relation.field}`,
  );
  const found = list.body?.data?.length > 0;
  if (found) return;
  const res = await client.post('/relations', relation);
  if (!res.ok && res.status !== 400) {
    // 400 часто = уже существует с другим сообщением
    console.warn(`  relation ${relation.collection}.${relation.field}: ${res.status}`, res.body);
  }
}

async function createSchema(client) {
  console.log('Коллекции и поля…');

  // --- settings (singleton) ---
  await ensureCollection(client, 'settings', {
    singleton: true,
    icon: 'settings',
    note: 'Контакты и реквизиты',
  });
  for (const f of [
    stringField('legal_name', { required: true }),
    stringField('inn', { required: true }),
    stringField('ogrnip', { required: true }),
    textField('legal_address', { required: true }),
    stringField('phone', { required: true }),
    stringField('phone_href', { required: true }),
    stringField('email', { required: true }),
    stringField('telegram_bot', { required: true }),
    stringField('whatsapp', { required: true }),
    stringField('vk', { required: true }),
    textField('address', { required: true }),
    floatField('lat', { note: 'Широта базы' }),
    floatField('lng', { note: 'Долгота базы' }),
    jsonField('directions', { note: 'Массив строк — ориентиры' }),
  ]) {
    await ensureField(client, 'settings', f);
  }

  // --- pages (one per locale) ---
  await ensureCollection(client, 'pages', {
    icon: 'article',
    note: 'Brand / hero / about по локалям',
    display_template: '{{locale}} — {{hero_title}}',
  });
  for (const f of [
    statusField(),
    selectField('locale', ['ru', 'en'], { required: true }),
    stringField('wordmark', { required: true }),
    stringField('legal_name', { required: true }),
    stringField('hero_title', { required: true }),
    stringField('hero_subtitle', { required: true }),
    fileField('hero_image'),
    stringField('hero_video_mp4'),
    stringField('hero_video_webm'),
    fileField('hero_video_poster'),
    stringField('about_title', { required: true }),
    jsonField('about_body', { required: true, note: 'Массив абзацев' }),
    fileField('about_image'),
  ]) {
    await ensureField(client, 'pages', f);
  }
  await ensureRelation(client, {
    collection: 'pages',
    field: 'hero_image',
    related_collection: 'directus_files',
    meta: { one_field: null },
    schema: {
      on_delete: 'SET NULL',
    },
  });
  await ensureRelation(client, {
    collection: 'pages',
    field: 'hero_video_poster',
    related_collection: 'directus_files',
    meta: {},
    schema: { on_delete: 'SET NULL' },
  });
  await ensureRelation(client, {
    collection: 'pages',
    field: 'about_image',
    related_collection: 'directus_files',
    meta: {},
    schema: { on_delete: 'SET NULL' },
  });

  // --- cabins ---
  await ensureCollection(client, 'cabins', {
    icon: 'cottage',
    note: 'Домики',
    display_template: '{{locale}} / {{slug}} — {{name}}',
    sort_field: 'sort',
  });
  for (const f of [
    statusField(),
    sortField(),
    selectField('locale', ['ru', 'en'], { required: true }),
    stringField('slug', {
      required: true,
      note: 'Код для Telegram (?start=). Только [A-Za-z0-9_-], до 64 символов.',
    }),
    stringField('name', { required: true }),
    textField('description', { required: true }),
    stringField('meta', { required: true }),
    integerField('price_per_night', { required: true }),
    stringField('price_note'),
    stringField('price_unit'),
    fileField('image'),
    jsonField('gallery', { note: 'Массив UUID файлов Directus (опционально)' }),
    jsonField('features', { note: 'Массив строк' }),
    jsonField('rules', { note: 'Массив строк' }),
  ]) {
    await ensureField(client, 'cabins', f);
  }
  await ensureRelation(client, {
    collection: 'cabins',
    field: 'image',
    related_collection: 'directus_files',
    meta: {},
    schema: { on_delete: 'SET NULL' },
  });

  // --- services ---
  await ensureCollection(client, 'services', {
    icon: 'spa',
    note: 'Услуги',
    display_template: '{{locale}} / {{key}} — {{name}}',
    sort_field: 'sort',
  });
  for (const f of [
    statusField(),
    sortField(),
    selectField('locale', ['ru', 'en'], { required: true }),
    selectField('key', ['furako', 'banya', 'common_house'], { required: true }),
    stringField('name', { required: true }),
    textField('description', { required: true }),
    stringField('meta', { required: true }),
    stringField('price', { required: true, note: 'Свободный текст цены' }),
    booleanField('standalone_bookable', { defaultValue: true }),
    fileField('image'),
  ]) {
    await ensureField(client, 'services', f);
  }
  await ensureRelation(client, {
    collection: 'services',
    field: 'image',
    related_collection: 'directus_files',
    meta: {},
    schema: { on_delete: 'SET NULL' },
  });

  // --- extras ---
  await ensureCollection(client, 'extras', {
    icon: 'shopping_bag',
    note: 'Дополнительные товары',
    display_template: '{{locale}} / {{slug}} — {{name}}',
    sort_field: 'sort',
  });
  for (const f of [
    statusField(),
    sortField(),
    selectField('locale', ['ru', 'en'], { required: true }),
    stringField('slug', { required: true }),
    stringField('name', { required: true }),
    integerField('price', { required: true }),
  ]) {
    await ensureField(client, 'extras', f);
  }
}

async function ensureWebsiteRole(client) {
  console.log('Роль Website…');
  const roles = await client.get('/roles?filter[name][_eq]=Website');
  let roleId = roles.body?.data?.[0]?.id;

  if (!roleId) {
    const created = await client.post('/roles', {
      name: 'Website',
      icon: 'public',
      description: 'Read-only доступ сайта к опубликованному контенту',
      admin_access: false,
      app_access: false,
    });
    if (!created.ok) {
      throw new Error(`create role: ${created.status} ${JSON.stringify(created.body)}`);
    }
    roleId = created.body.data.id;
    console.log('  роль Website создана');
  } else {
    console.log('  роль Website уже есть');
  }

  const collections = ['settings', 'pages', 'cabins', 'services', 'extras', 'directus_files'];
  for (const collection of collections) {
    const existing = await client.get(
      `/permissions?filter[role][_eq]=${roleId}&filter[collection][_eq]=${collection}&filter[action][_eq]=read`,
    );
    if (existing.body?.data?.length) continue;

    const permission = {
      role: roleId,
      collection,
      action: 'read',
      fields: ['*'],
    };
    if (collection !== 'settings' && collection !== 'directus_files') {
      permission.permissions = { status: { _eq: 'published' } };
    }

    const res = await client.post('/permissions', permission);
    if (!res.ok) {
      throw new Error(`permission ${collection}: ${res.status} ${JSON.stringify(res.body)}`);
    }
  }
  console.log('  права read выданы');

  // Пользователь + static token
  const users = await client.get(
    `/users?filter[email][_eq]=website@internal.hizhina&fields=id,token`,
  );
  let userId = users.body?.data?.[0]?.id;
  let token = users.body?.data?.[0]?.token;

  if (!userId) {
    const created = await client.post('/users', {
      email: 'website@internal.hizhina',
      password: crypto.randomUUID() + 'Aa1!',
      role: roleId,
      status: 'active',
      first_name: 'Website',
      last_name: 'Reader',
    });
    if (!created.ok) {
      throw new Error(`create user: ${created.status} ${JSON.stringify(created.body)}`);
    }
    userId = created.body.data.id;
    console.log('  пользователь website@internal.hizhina создан');
  }

  if (!token) {
    token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const patched = await client.patch(`/users/${userId}`, { token });
    if (!patched.ok) {
      throw new Error(`set token: ${patched.status} ${JSON.stringify(patched.body)}`);
    }
    console.log('  static token выдан');
  } else {
    console.log('  static token уже задан');
  }

  return token;
}

async function main() {
  console.log(`Directus: ${DIRECTUS_URL}`);
  await waitForDirectus();
  const token = await login();
  const client = api(token);
  await createSchema(client);
  const websiteToken = await ensureWebsiteRole(client);

  console.log('\nГотово. Добавьте в .env / .env.local:\n');
  console.log(`DIRECTUS_TOKEN=${websiteToken}`);
  console.log('\nДальше: pnpm seed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
