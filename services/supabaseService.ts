import { supabase } from '../supabase/client';
import { WoundAnalysisResult } from '../types';

export const saveAssessment = async (
    patientId: string,
    assessment: WoundAnalysisResult,
    bradenScore: number | string,
    pushScore: number,
    depth: number // เพิ่ม parameter ความลึก
) => {
  if (!patientId || !assessment) {
    throw new Error('ต้องระบุรหัสผู้ป่วยและข้อมูลการประเมิน');
  }

  try {
    const { data, error } = await supabase
      .from('assessments') // 'assessments' คือชื่อตารางใน Supabase
      .insert([
        {
          patient_id: patientId, // แนะนำให้ใช้ snake_case ใน Supabase
          braden_total_score: bradenScore,
          push_total_score: pushScore,
          depth: depth, // เพิ่มการบันทึกความลึก
          created_at: new Date().toISOString(),
          // คัดลอกข้อมูลทั้งหมดจาก assessment object
          ...assessment
        }
      ])
      .select(); // .select() เพื่อให้ Supabase คืนค่าข้อมูลที่ถูกเพิ่ม

    if (error) {
      console.error('Supabase Error:', error);
      throw new Error(error.message);
    }

    console.log('บันทึกข้อมูลลง Supabase สำเร็จ:', data);
    return data; // คืนค่าข้อมูลที่บันทึกสำเร็จ
  } catch (e) {
    console.error('เกิดข้อผิดพลาดในการบันทึกลง Supabase: ', e);
    if (e instanceof Error) {
        throw new Error(`ไม่สามารถบันทึกข้อมูลลง Supabase ได้ ${e.message}`);
    }
    throw new Error('ไม่สามารถบันทึกข้อมูลลง Supabase ได้');
  }
};