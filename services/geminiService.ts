import { GoogleGenAI, Type } from "@google/genai";
import { WoundAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    visualEvidence: {
      type: Type.STRING,
      description: "Detailed description of what the AI sees (colors, textures, edges). Reasoning before staging.",
    },
    stage: {
      type: Type.STRING,
      description: "Stage of injury (Stage 1-4, Unstageable, Deep Tissue) based on NPUAP 2016.",
    },
    anatomicalLocation: {
      type: Type.STRING,
      description: "Estimated anatomical site based on visual cues (e.g., Sacrum, Heel).",
    },
    infectionSigns: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Signs of infection (Erythema, Malodor, Purulent exudate, Heat).",
    },
    tissueType: {
      type: Type.STRING,
      description: "Primary wound bed tissue description.",
    },
    dimensionsDescription: {
      type: Type.STRING,
      description: "Estimated size description.",
    },
    exudateLevel: {
      type: Type.STRING,
      description: "None, Light, Moderate, Heavy.",
    },
    surroundingSkin: {
      type: Type.STRING,
      description: "Condition of periwound skin (Macerated, Dry, Red, Normal).",
    },
    aiConfidence: {
      type: Type.STRING,
      description: "Confidence level percentage based on image clarity.",
    },
    tissuePercentages: {
      type: Type.OBJECT,
      properties: {
        necrotic: { type: Type.NUMBER },
        slough: { type: Type.NUMBER },
        granulation: { type: Type.NUMBER },
        epithelial: { type: Type.NUMBER }
      },
      required: ["necrotic", "slough", "granulation", "epithelial"]
    },
    careRecommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Dressing recommendations with specific brands (Duoderm, Mepilex, Aquacel).",
    },
    visualBradenHints: {
      type: Type.OBJECT,
      properties: {
        moistureObservation: { type: Type.STRING },
        frictionObservation: { type: Type.STRING }
      },
      required: ["moistureObservation", "frictionObservation"]
    },
    pushToolHints: {
      type: Type.OBJECT,
      properties: {
        exudateScore: { type: Type.NUMBER },
        tissueScore: { type: Type.NUMBER },
        reasoning: { type: Type.STRING },
        estimatedLength: { type: Type.NUMBER },
        estimatedWidth: { type: Type.NUMBER }
      },
      required: ["exudateScore", "tissueScore", "reasoning", "estimatedLength", "estimatedWidth"]
    }
  },
  required: ["visualEvidence", "stage", "tissueType", "tissuePercentages", "careRecommendations", "visualBradenHints", "pushToolHints"]
};

export const analyzeWoundImage = async (base64Image: string, siteInfo?: string): Promise<WoundAnalysisResult> => {
  try {
    const modelId = "gemini-3-pro-preview"; // ใช้รุ่น Pro เพื่อความแม่นยำสูงสุดในเชิงการแพทย์
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: "image/jpeg", 
            },
          },
          {
            text: `คุณคือพยาบาลผู้เชี่ยวชาญด้านแผลและทวารเทียม (ET Nurse/WOC Nurse) 
            ${siteInfo ? `ข้อมูลตำแหน่งแผล: ${siteInfo}` : ""}
            
            จงทำตามขั้นตอนการวิเคราะห์เชิงคลินิก (Clinical Logic) ดังนี้:
            1. [Visual Scan]: บรรยายสิ่งที่เห็นในภาพอย่างละเอียด (สีขอบแผล, ลักษณะเนื้อเยื่อที่มองเห็น, ความชัดเจนของรูปภาพ)
            2. [Tissue Identification]: แยกแยะสีและพื้นผิว (Texture) ห้ามสับสนระหว่าง Slough กับ Fat หรือ Fibrin
            3. [Staging]: ตัดสิน Stage ตาม NPUAP 2016 หากเห็นเนื้อตายปิดบังจนไม่เห็นความลึก ให้ระบุเป็น Unstageable
            4. [Infection Check]: ตรวจหาสัญญาณ Erythema หรือ Maceration รอบแผล
            5. [PUSH Tool Score]: ประเมินคะแนน 0-17 ตามมาตรฐาน
            6. [Dressing Selection]: แนะนำวัสดุตามความแฉะและเป้าหมายการรักษา (Debridement/Protection)
            
            ข้อกำหนดเข้มงวด: 
            - หากภาพไม่ชัดให้แจ้งใน visualEvidence และให้คะแนน aiConfidence ต่ำ
            - แนะนำยี่ห้อ Dressing ที่มีในโรงพยาบาล (เช่น Mepilex, Duoderm, Aquacel Ag+, Intrasite Gel)
            - ผลลัพธ์ต้องเป็นภาษาไทยทางการแพทย์`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        temperature: 0.1, 
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as WoundAnalysisResult;
    } else {
      throw new Error("Analysis failed");
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};