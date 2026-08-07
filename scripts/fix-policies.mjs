const URL_ = (process.env.DIRECTUS_URL || 'http://directus:8055').replace(/\/+$/, '');
const EMAIL = process.env.BOOTSTRAP_ADMIN_EMAIL || process.env.DIRECTUS_ADMIN_EMAIL;
const PASSWORD = process.env.BOOTSTRAP_ADMIN_PASSWORD || process.env.DIRECTUS_ADMIN_PASSWORD;

const r = await fetch(`${URL_}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
if (!r.ok) throw new Error(`login: ${r.status} ${await r.text()}`);
const TOKEN = (await r.json()).data.access_token;
const H = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

const get = async (p) => { const x = await fetch(`${URL_}${p}`, { headers: H }); return { ok: x.ok, body: await x.json().catch(() => null) }; };
const post = async (p, d) => { const x = await fetch(`${URL_}${p}`, { method: 'POST', headers: H, body: JSON.stringify(d) }); return { ok: x.ok, status: x.status, body: await x.json().catch(() => null) }; };
const patch = async (p, d) => { const x = await fetch(`${URL_}${p}`, { method: 'PATCH', headers: H, body: JSON.stringify(d) }); return { ok: x.ok, status: x.status, body: await x.json().catch(() => null) }; };

// --- роль Website ---
const roles = await get('/roles?filter[name][_eq]=Website');
const roleId = roles.body?.data?.[0]?.id;
if (!roleId) throw new Error('роль Website не найдена — сначала bootstrap-directus.mjs');
console.log('роль Website:', roleId);

// --- политика Website ---
let pol = await get('/policies?filter[name][_eq]=Website');
let policyId = pol.body?.data?.[0]?.id;
if (!policyId) {
  const c = await post('/policies', { name: 'Website', icon: 'public', description: 'Read-only для сайта', admin_access: false, app_access: false });
  if (!c.ok) throw new Error(`create policy: ${c.status} ${JSON.stringify(c.body)}`);
  policyId = c.body.data.id;
  console.log('политика Website создана:', policyId);
} else console.log('политика Website уже есть:', policyId);

// --- связь роль → политика ---
const acc = await get(`/access?filter[role][_eq]=${roleId}&filter[policy][_eq]=${policyId}`);
if (!acc.body?.data?.length) {
  const c = await post('/access', { role: roleId, policy: policyId });
  if (!c.ok) throw new Error(`link access: ${c.status} ${JSON.stringify(c.body)}`);
  console.log('роль связана с политикой');
} else console.log('связь уже есть');

// --- публичная политика (access с role=null и user=null) ---
const allAccess = await get('/access?limit=-1&fields=id,role,user,policy');
const publicRow = (allAccess.body?.data || []).find((a) => !a.role && !a.user);
const publicPolicyId = publicRow?.policy ?? null;
console.log('публичная политика:', publicPolicyId ?? 'НЕ НАЙДЕНА');

// --- права ---
async function perm(policy, collection, filter) {
  const ex = await get(`/permissions?filter[policy][_eq]=${policy}&filter[collection][_eq]=${collection}&filter[action][_eq]=read`);
  if (ex.body?.data?.length) { console.log(`  ${collection} — уже есть`); return; }
  const p = { policy, collection, action: 'read', fields: ['*'] };
  if (filter) p.permissions = filter;
  const c = await post('/permissions', p);
  if (!c.ok) throw new Error(`perm ${collection}: ${c.status} ${JSON.stringify(c.body)}`);
  console.log(`  ${collection} — создано`);
}

console.log('права Website…');
const published = { status: { _eq: 'published' } };
for (const col of ['pages', 'cabins', 'services', 'extras']) await perm(policyId, col, published);
for (const col of ['settings', 'directus_files']) await perm(policyId, col, null);

if (publicPolicyId) {
  console.log('права Public…');
  await perm(publicPolicyId, 'directus_files', null);
} else {
  console.log('!! публичную политику не нашёл — откройте directus_files для Public в админке');
}

// --- техпользователь и токен ---
const users = await get('/users?filter[email][_eq]=website@hizhina.ru');
let userId = users.body?.data?.[0]?.id;
let token = users.body?.data?.[0]?.token || null;
if (!userId) {
  const c = await post('/users', { email: 'website@hizhina.ru', password: crypto.randomUUID(), role: roleId, status: 'active', first_name: 'Website', last_name: 'Reader' });
  if (!c.ok) throw new Error(`create user: ${c.status} ${JSON.stringify(c.body)}`);
  userId = c.body.data.id;
  console.log('пользователь создан');
}
if (!token) {
  token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  const p = await patch(`/users/${userId}`, { token });
  if (!p.ok) throw new Error(`set token: ${p.status} ${JSON.stringify(p.body)}`);
}

console.log('\nDIRECTUS_TOKEN=' + token);
