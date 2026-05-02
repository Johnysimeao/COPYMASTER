import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "./templates";
import { ReferenceMaterial } from "./supabase";

let genAI: GoogleGenAI | null = null;

function getAI() {
  if (!genAI) {
    // Priority: process.env (AI Studio standard) -> import.meta.env (Vite standard)
    const apiKey = (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined) 
      || (import.meta.env?.VITE_GEMINI_API_KEY);
    
    // Se não houver chave, lançamos um erro capturável que ativará o modo demo
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      throw new Error("API Key missing");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

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

export async function generateCopy(input: CopyInput, materials: ReferenceMaterial[] = []) {
  const model = "gemini-3-flash-preview";
  let ai;
  
  try {
    ai = getAI();
  } catch (error) {
    console.warn("Gemini key missing. Falling back to simulated copy.");
    // Simulated high conversion copy for demo purposes when key is missing
    return `
# 🚀 ESTRATÉGIA DE COPY GERADA

## 🎯 Headline (Gancho)
**Pare de sofrer com ${input.mainPain} e descubra como finalmente alcançar ${input.mainBenefit}!**

## 💡 A Oferta
Apresentamos o **${input.productName}**, o sistema definitivo para o nicho de **${input.niche}**, focado especialmente em **${input.targetAudience}**.

## 🔥 Gatilho Mental: ${input.mentalTrigger}
Imagine ter acesso exclusivo ao que os experts escondem. Não é apenas sorte, é o método validado.

## ✅ Benefícios
- Transformação real focada em resultados.
- Palavras-chave estratégicas: ${input.keywords}.
- Modelo aplicado: ${input.strategyId}.

---
*Processo concluído com sucesso.*
    `.trim();
  }
  
  const materialsContext = materials.length > 0 
    ? `
USE ESTES MATERIAIS DE REFERÊNCIA/ESTUDO COMO BASE PARA SUA CRIAÇÃO:
${materials.map(m => `--- MATERIAL (${m.category}): ${m.title} ---\n${m.content}`).join('\n\n')}
` : "";

  const userPrompt = `
${materialsContext}

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
Aproveite os estilos e frameworks dos materiais de referência fornecidos acima para elevar o nível da copy.
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

    const text = response.text;
    if (!text) {
      throw new Error("O modelo não retornou nenhum texto.");
    }
    return text;
  } catch (error) {
    console.error("Erro ao gerar copy:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Falha na geração da copy. Verifique sua conexão ou chave de API.");
  }
}
