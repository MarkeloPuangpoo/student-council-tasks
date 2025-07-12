# ระบบติดตามงานสภานักเรียน

ระบบติดตามงานของสภานักเรียนที่พัฒนาด้วย Next.js 15, Supabase, Tailwind CSS, และ ShadCN UI

## คุณสมบัติ

- 📊 แสดงรายการงานในรูปแบบตาราง
- 📅 แสดงงานในรูปแบบปฏิทิน
- 🔍 ค้นหาและกรองงาน
- 👤 ระบบล็อกอิน
- ✏️ เพิ่ม แก้ไข ลบงาน (สำหรับผู้ที่ล็อกอินแล้ว)

## เทคโนโลยีที่ใช้

- Next.js 15 (App Router)
- Supabase (ฐานข้อมูล + Authentication)
- Tailwind CSS + ShadCN UI
- React Query
- React Big Calendar
- React Hook Form + Zod

## การติดตั้ง

1. Clone repository:
```bash
git clone [repository-url]
cd student-council-tasks
```

2. ติดตั้ง dependencies:
```bash
npm install
```

3. สร้างไฟล์ .env.local และกำหนดค่า environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. รัน development server:
```bash
npm run dev
```

5. เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

## การตั้งค่า Supabase

1. สร้างโปรเจคใหม่ใน Supabase

2. สร้างตาราง tasks:
```sql
create table tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  assigned_department text not null,
  signup_date date not null,
  start_date date not null,
  due_date date not null,
  status text not null
);

-- ตั้งค่า Row Level Security
alter table tasks enable row level security;

-- อนุญาตให้ทุกคนอ่านข้อมูล
create policy "Public read access" on tasks
for select
to anon
using (true);

-- อนุญาตให้เฉพาะผู้ที่ล็อกอินแล้วเพิ่ม/แก้ไข/ลบข้อมูล
create policy "Authenticated write access" on tasks
for all
to authenticated
using (auth.uid() IS NOT NULL)
with check (auth.uid() IS NOT NULL);
```

3. เปิดใช้งาน Email Auth ใน Authentication settings

## การพัฒนา

- `npm run dev` - รัน development server
- `npm run build` - สร้าง production build
- `npm run start` - รัน production server
- `npm run lint` - ตรวจสอบ code style
