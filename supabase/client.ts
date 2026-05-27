import { createClient } from '@supabase/supabase-js';

// =================================================================
// TODO: ใส่ค่า Supabase URL และ Anon Key ของคุณที่นี่
// คุณสามารถคัดลอกค่าเหล่านี้ได้จาก Supabase Dashboard
// ไปที่ Project Settings > API
// =================================================================
const supabaseUrl = 'YOUR_SUPABASE_URL';      // <--- ใส่ค่าของคุณ (e.g., https://xyz.supabase.co)
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // <--- ใส่ค่าของคุณ

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL' || !supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn("Supabase URL หรือ Anon Key ยังไม่ได้ตั้งค่า กรุณาตรวจสอบไฟล์ supabase/client.ts");
  alert("การเชื่อมต่อ Supabase ยังไม่สมบูรณ์ โปรดตรวจสอบ Console");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
