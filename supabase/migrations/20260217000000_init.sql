-- NailsHub：店家、服務、可預約時段、預約（Supabase SQL Editor 或 CLI 執行）

create table public.shops (
  id text primary key,
  name text not null,
  cover_image_url text not null,
  district text not null,
  summary text not null,
  address text not null,
  description text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

create table public.shop_services (
  id text primary key,
  shop_id text not null references public.shops (id) on delete cascade,
  name text not null,
  price_ntd integer not null check (price_ntd >= 0),
  duration_minutes integer not null check (duration_minutes > 0)
);

create table public.shop_availability (
  shop_id text not null references public.shops (id) on delete cascade,
  date text not null,
  slots text[] not null,
  primary key (shop_id, date)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid (),
  shop_id text not null references public.shops (id),
  service_id text not null references public.shop_services (id),
  date text not null,
  time_slot text not null,
  customer_name text not null,
  customer_phone text not null,
  customer_notes text,
  status text not null default 'pending',
  created_at timestamptz not null default now ()
);

alter table public.shops enable row level security;
alter table public.shop_services enable row level security;
alter table public.shop_availability enable row level security;
alter table public.bookings enable row level security;

-- MVP：公開讀取目錄；建立預約；以 UUID 查詢預約（靠 id 難猜）
create policy "shops_select_public" on public.shops for select using (true);

create policy "shop_services_select_public" on public.shop_services for select using (true);

create policy "shop_availability_select_public" on public.shop_availability for select using (true);

create policy "bookings_insert_public" on public.bookings for insert with check (true);

create policy "bookings_select_public" on public.bookings for select using (true);

-- 種子資料（與先前 FastAPI 假資料對齊）
insert into public.shops (id, name, cover_image_url, district, summary, address, description, phone)
values
  (
    'shop-001',
    '晨光美甲工作室',
    'https://picsum.photos/seed/nails1/800/500',
    '中西區',
    '手繪花卉與漸層專長，舒適一對一服務。',
    '台南市中西區民權路一段 100 號 2 樓',
    '使用日系凝膠品牌，提供手繪、貼鑽與延甲服務。採預約制，每位客人獨立座位與消毒流程，讓你可以放心放鬆。',
    '06-2200-0101'
  ),
  (
    'shop-002',
    '南薑指彩',
    'https://picsum.photos/seed/nails2/800/500',
    '東區',
    '日系簡約、凝膠指甲與足部保養。',
    '台南市東區崇善路 256 號',
    '簡約線條與溫柔色系是強項，另有足部保養與足部凝膠可加購。',
    '06-2900-0202'
  ),
  (
    'shop-003',
    '海安街美甲館',
    'https://picsum.photos/seed/nails3/800/500',
    '中西區',
    '鄰近海安路，夜間營業方便下班後預約。',
    '台南市中西區海安路二段 78 號',
    '平日晚間與週末時段友善，提供凝膠、延甲與卸甲服務。',
    '06-2230-0303'
  );

insert into public.shop_services (id, shop_id, name, price_ntd, duration_minutes)
values
  ('svc-001-a', 'shop-001', '凝膠單色（含基礎保養）', 900, 90),
  ('svc-001-b', 'shop-001', '手繪造型（簡單款）', 1400, 120),
  ('svc-002-a', 'shop-002', '凝膠美甲（單色／漸層）', 1100, 100),
  ('svc-002-b', 'shop-002', '足部凝膠 + 基礎保養', 1300, 110),
  ('svc-003-a', 'shop-003', '凝膠維持／卸甲（他店作品可詢價）', 800, 75),
  ('svc-003-b', 'shop-003', '延甲 + 凝膠單色', 1600, 130);

insert into public.shop_availability (shop_id, date, slots)
values
  ('shop-001', '2026-04-21', array['10:00', '13:30', '16:00']),
  ('shop-001', '2026-04-22', array['11:00', '14:00', '18:30']),
  ('shop-001', '2026-04-23', array['10:00', '15:00']),
  ('shop-002', '2026-04-21', array['09:30', '12:00', '16:30']),
  ('shop-002', '2026-04-22', array['10:30', '14:30']),
  ('shop-003', '2026-04-21', array['12:00', '18:00', '20:00']),
  ('shop-003', '2026-04-22', array['12:00', '19:00']),
  ('shop-003', '2026-04-24', array['11:00', '15:00', '17:00']);
