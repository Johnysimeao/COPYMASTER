import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, COPY_STRATEGIES } from "./templates";
import { ReferenceMaterial } from "./supabase";

let genAI: GoogleGenAI | null = null;

function getAI() {
  if (!genAI) {
    const apiKey = (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined) 
      || (import.meta.env?.VITE_GEMINI_API_KEY);
    
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      return null;
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

const LOCAL_TEMPLATES: Record<string, (input: CopyInput) => string> = {
  bridge_presell: (i) => `
# 🚀 PÁGINA PRESELL: ${i.productName}

## ⚡ A descoberta que está mudando o nicho de ${i.niche}
Você já se sentiu travado por causa de **${i.mainPain}**? Eu sei exatamente como é.

Recentemente, algo bizarro aconteceu. Descobrimos um método para **${i.mainBenefit}** sem precisar de ferramentas complexas.

## 🎯 Por que isso funciona?
Diferente de tudo o que você já viu em ${i.niche}, o **${i.productName}** foca no que realmente importa para **${i.targetAudience}**.

**Gatilho Ativado:** ${i.mentalTrigger}

### ✅ O que você vai encontrar no próximo passo:
- Como vencer o desafio de ${i.keywords}
- O segredo por trás do sucesso em ${i.niche}

[ BOTÃO: QUERO VER O VÍDEO COMPLETO ]
`,
  vsl_structure: (i) => `
# 🎬 ROTEIRO DE VSL: ${i.productName}

## [0:00 - 0:30] O Gancho Disruptivo
"Atenção ${i.targetAudience}: Se você sofre com **${i.mainPain}**, os próximos 3 minutos podem ser os mais importantes da sua vida."

## [0:30 - 1:30] A Dor e a Empatia
Eu sei que você já tentou de tudo em ${i.niche}. Mas a culpa não é sua. O sistema foi feito para você falhar.

## [1:30 - 3:00] A Solução (O Mecanismo)
Imagine conseguir **${i.mainBenefit}** usando apenas o que eu chamo de **${i.keywords}**. É exatamente isso que o **${i.productName}** faz por você.

## [3:00+] A Oferta e o Fechamento
**Gatilho de ${i.mentalTrigger}:** As vagas são extremamente limitadas. Clique agora para garantir seu acesso.
`,
  facebook_ads: (i) => `
# 📱 COPY PARA ANÚNCIO (FACE/INSTA)

## Opção 1: Direta ao Ponto
Cansado de **${i.mainPain}**? 😫
Descubra como **${i.mainBenefit}** com o novo método **${i.productName}**.
Validado para o público de **${i.targetAudience}**.
Toque em 'Saiba Mais' 👇

## Opção 2: Curiosidade (${i.mentalTrigger})
O que aconteceria se você pudesse dominar **${i.niche}** em tempo recorde?
Sem enrolação: **${i.keywords}** simplificado.
[LINK DA BIO]

## Opção 3: Autoridade
A maior autoridade em **${i.niche}** acaba de revelar o segredo para **${i.mainBenefit}**.
Pare de perder tempo com os erros comuns de ${i.targetAudience}.
`,
  email_sequence: (i) => `
# 📧 SEQUÊNCIA DE E-MAILS: ${i.productName}

## E-mail 1: O Alerta
Assunto: Sobre aquele problema com ${i.mainPain}...
Corpo: Olá, no mundo de ${i.niche}, poucos admitem a verdade. Você está sendo bloqueado por **${i.keywords}**. Mas tenho uma boa notícia sobre **${i.mainBenefit}**.

## E-mail 2: A Prova (${i.mentalTrigger})
Assunto: Como ${i.targetAudience} estão vencendo
Corpo: O **${i.productName}** não é apenas teoria. É o que permitiu alcançar o topo.

## E-mail 3: Última Chamada
Assunto: [URGENTE] Seu acesso expira em breve
Corpo: A oportunidade de transformar sua realidade em ${i.niche} está passando.
`,
  sales_page: (i) => `
# 💎 PÁGINA DE VENDAS: ${i.productName}

## 🔝 Headline Principal
**Finalmente Revelado: O Sistema de ${i.niche} que Faz Você ${i.mainBenefit} sem ${i.mainPain}**

## 🛑 O Problema
Para a maioria dos **${i.targetAudience}**, o sucesso parece impossível. Especialmente quando **${i.keywords}** se torna um obstáculo.

## ✨ A Solução: ${i.productName}
O **${i.productName}** foi desenhado para ser o seu atalho definitivo. 

### O que você recebe:
- Acesso ao método completo de ${i.niche}
- Suporte para superar **${i.mainPain}**
- Bônus exclusivo: Estratégias de ${i.keywords}

**Gatilho de ${i.mentalTrigger}:** Garantia incondicional de satisfação.
`,
  advertorial_news: (i) => `
# 📰 ADVERTORIAL: NOTÍCIA DE ÚLTIMA HORA

## TITULO: Especialista revela método bizarro para ${i.mainBenefit} no Brasil.
**Subtítulo:** ${i.targetAudience} estão abandonando métodos antigos de ${i.niche} para adotar o novo **${i.productName}**.

SAN PAULO — Uma nova descoberta no setor de **${i.niche}** está causando polêmica. 
O motivo? Um sistema simples que permite **${i.mainBenefit}** resolvendo o temido problema de **${i.mainPain}**.

"Eu não acreditava que **${i.keywords}** pudesse ser tão simples", afirma um dos usuários graduados no método.

**Gatilho: ${i.mentalTrigger}**
A reportagem apurou que as licenças do **${i.productName}** podem ser suspensas a qualquer momento devido à alta demanda.
`
};

export async function generateCopy(input: CopyInput, materials: ReferenceMaterial[] = []) {
  const model = "gemini-3-flash-preview";
  const ai = getAI();
  
  if (!ai) {
    console.warn("Gemini key missing. Using local generation engine.");
    const fallbackFn = LOCAL_TEMPLATES[input.strategyId] || LOCAL_TEMPLATES.sales_page;
    return fallbackFn(input).trim();
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
    // Even on API error, return a local fallback instead of crashing
    const fallbackFn = LOCAL_TEMPLATES[input.strategyId] || LOCAL_TEMPLATES.sales_page;
    return fallbackFn(input).trim();
  }
}
