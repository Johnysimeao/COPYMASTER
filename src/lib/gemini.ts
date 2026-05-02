import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "./templates";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface CopyInput {
  productName: string;
  niche: string;
  targetAudience: string;
  mainBenefit: string;
  mainPain: string;
  keywords: string;
  strategyId: string;
  mentalTrigger: string;
}

export async function generateCopy(input: CopyInput) {
  const model = "gemini-3-flash-preview";
  
  const userPrompt = `
Gere uma copy profissional de alta performance com os seguintes parâmetros:
- Nome do Ativo/Oferta: ${input.productName}
- Nicho de Atuação: ${input.niche}
- Persona/Público: ${input.targetAudience}
- Promessa Central: ${input.mainBenefit}
- Dor/Problema Crítico: ${input.mainPain}
- Palavras de Impacto: ${input.keywords}
- Modelo de Escrita Solicitado: ${input.strategyId}
- Gatilho Mental Dominante: ${input.mentalTrigger}

A copy deve seguir exatamente o modelo de escrita solicitado, focando em máxima persuasão e conversão.
`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.8,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Erro ao gerar copy:", error);
    throw new Error("Falha na geração da copy. Verifique sua conexão ou chave de API.");
  }
}
