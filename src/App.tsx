import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  FileText, 
  Copy, 
  Loader2, 
  Check,
  Printer
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast, Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { generateCopy, CopyInput } from "@/src/lib/gemini";
import { COPY_STRATEGIES, MENTAL_TRIGGERS } from "@/src/lib/templates";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState<string>("");
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem("copy_history");
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState<CopyInput>({
    productName: "",
    niche: "",
    targetAudience: "",
    mainBenefit: "",
    mainPain: "",
    keywords: "",
    strategyId: "bridge_vsl",
    mentalTrigger: MENTAL_TRIGGERS[0],
  });

  const handleGenerate = async () => {
    if (!formData.productName || !formData.mainBenefit || !formData.mainPain) {
      toast.error("Por favor, preencha os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const result = await generateCopy(formData);
      if (result) {
        setGeneratedCopy(result);
        const newHistory = [result, ...history].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem("copy_history", JSON.stringify(newHistory));
        toast.success("Estratégia calculada!");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("copy_history");
    toast.info("Histórico limpo.");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-neutral-300 font-sans flex flex-col selection:bg-amber-500/30 selection:text-amber-200 uppercase-none" id="app-container">
      <Toaster position="top-center" theme="dark" richColors />
      
      {/* Header */}
      <header className="h-20 lg:h-24 border-b border-white/5 flex items-center justify-between px-6 lg:px-16 bg-[#0E0E10]/80 backdrop-blur-xl sticky top-0 shrink-0 z-50">
        <div className="flex items-center gap-3 lg:gap-4 group cursor-default">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-900/20 group-hover:scale-105 transition-transform duration-500">
            <Zap className="w-6 h-6 lg:w-7 lg:h-7 text-black fill-current" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg lg:text-xl font-bold text-white tracking-[0.2em] uppercase leading-none">
              Copy<span className="text-amber-500">Master</span>
            </h1>
            <span className="text-[9px] lg:text-[10px] text-neutral-600 font-bold uppercase tracking-[0.5em] mt-1 ml-0.5">Titan-G3</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="flex flex-col items-end hidden sm:flex">
            <Badge variant="outline" className="border-amber-500/20 text-amber-500 bg-amber-500/5 px-4 py-1.5 font-mono text-[10px] tracking-widest rounded-full">
              SISTEMA ATIVO
            </Badge>
          </div>
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl border border-white/5 bg-gradient-to-b from-neutral-800 to-neutral-900 flex items-center justify-center shadow-xl">
             <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-sm bg-amber-500/40 animate-pulse" />
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden bg-[#0D0D0F]">
        
        {/* Sidebar - Left (Inputs) */}
        <aside className="w-full lg:w-[480px] lg:border-r border-white/5 bg-[#0D0D0F] p-8 lg:p-14 flex flex-col gap-10 overflow-y-auto custom-scrollbar shrink-0">
            <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mb-2">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Copy Architect v3</span>
            </div>
            <h2 className="text-3xl font-serif text-white tracking-tight">Engenharia de <span className="text-neutral-600">Alta Conversão</span></h2>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="productName" className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold ml-1">Ativo / Oferta *</Label>
              <Input 
                id="productName" 
                className="bg-[#141416] border-white/5 rounded-2xl h-14 px-6 focus-visible:ring-amber-500/20 focus-visible:border-amber-500/30 text-neutral-200 transition-all placeholder:text-neutral-800 font-medium text-base shadow-inner"
                placeholder="Ex: Método Flow Profissional" 
                value={formData.productName}
                onChange={(e) => setFormData({...formData, productName: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="niche" className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold ml-1">Nicho</Label>
                <Input 
                  id="niche" 
                  className="bg-[#141416] border-white/5 rounded-2xl h-14 px-6 focus-visible:ring-amber-500/20 focus-visible:border-amber-500/30 text-neutral-200 transition-all placeholder:text-neutral-800"
                  placeholder="Ex: Fitness" 
                  value={formData.niche}
                  onChange={(e) => setFormData({...formData, niche: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="targetAudience" className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold ml-1">Público</Label>
                <Input 
                  id="targetAudience" 
                  className="bg-[#141416] border-white/5 rounded-2xl h-14 px-6 focus-visible:ring-amber-500/20 focus-visible:border-amber-500/30 text-neutral-200 transition-all placeholder:text-neutral-800"
                  placeholder="Ex: Iniciantes" 
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="mainBenefit" className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold ml-1">Promessa Central *</Label>
              <Input 
                id="mainBenefit" 
                className="bg-[#141416] border-white/5 rounded-2xl h-14 px-6 focus-visible:ring-amber-500/20 focus-visible:border-amber-500/30 text-neutral-200 transition-all placeholder:text-neutral-800 font-medium text-base h-14"
                placeholder="Ex: Venda sem investir 1 real" 
                value={formData.mainBenefit}
                onChange={(e) => setFormData({...formData, mainBenefit: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="mainPain" className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold ml-1">Problema Crítico *</Label>
              <Input 
                id="mainPain" 
                className="bg-[#141416] border-white/5 rounded-2xl h-14 px-6 focus-visible:ring-amber-500/20 focus-visible:border-amber-500/30 text-neutral-200 transition-all placeholder:text-neutral-800 font-medium text-base h-14"
                placeholder="Ex: Bloqueios constants no Facebook" 
                value={formData.mainPain}
                onChange={(e) => setFormData({...formData, mainPain: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="keywords" className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold ml-1">Palavras de Impacto</Label>
              <Input 
                id="keywords" 
                className="bg-[#141416] border-white/5 rounded-2xl h-14 px-6 focus-visible:ring-amber-500/20 focus-visible:border-amber-500/30 text-neutral-200 transition-all placeholder:text-neutral-800 h-14"
                placeholder="Ex: bizarro, hack, revelado" 
                value={formData.keywords}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold ml-1">Modelo de Escrita</Label>
              <Select 
                value={formData.strategyId} 
                onValueChange={(val) => setFormData({...formData, strategyId: val})}
              >
                <SelectTrigger className="w-full bg-[#141416] border-white/5 rounded-2xl h-14 px-6 text-neutral-200 focus:ring-amber-500/20 transition-all text-left font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1C] border-white/10 text-neutral-200">
                  {COPY_STRATEGIES.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="focus:bg-amber-500/10 focus:text-amber-400 cursor-pointer py-3 rounded-lg mx-2 my-1">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold ml-1">Gatilho Primário</Label>
              <Select 
                value={formData.mentalTrigger} 
                onValueChange={(val) => setFormData({...formData, mentalTrigger: val})}
              >
                <SelectTrigger className="w-full bg-[#141416] border-white/5 rounded-2xl h-14 px-6 text-neutral-200 focus:ring-amber-500/20 transition-all text-left font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1C] border-white/10 text-neutral-200">
                  {MENTAL_TRIGGERS.map((trigger) => (
                    <SelectItem key={trigger} value={trigger} className="focus:bg-amber-500/10 focus:text-amber-400 cursor-pointer py-3 rounded-lg mx-2 my-1 text-left">
                      {trigger}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-8">
              <Button 
                className="w-full h-16 bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-black font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[12px] shadow-2xl shadow-amber-600/30 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] border-none px-4" 
                id="generate-btn"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    <span>Engenhando...</span>
                  </>
                ) : (
                  <span className="truncate">Gerar Copy de Alta Performance</span>
                )}
              </Button>
            </div>
          </div>
        </aside>

        {/* Content Area - Right */}
        <section className="flex-1 p-6 lg:p-12 bg-[#0A0A0B] flex flex-col min-h-screen lg:min-h-0 lg:overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(217,119,6,0.03),transparent_40%)] pointer-events-none" />
          
          <div className="h-full flex flex-col z-10">
            <div className="flex items-center justify-between mb-8 lg:mb-10">
              <div>
                <p className="text-[10px] text-amber-500/60 uppercase tracking-[0.4em] font-black mb-1 px-1 font-bold">Prancheta</p>
                <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight uppercase">Arquitetura da <span className="opacity-40">Página</span></h2>
              </div>
            </div>

            <div className="mt-0 flex-1 lg:overflow-hidden" id="copy-result">
              <AnimatePresence mode="wait">
                {generatedCopy ? (
                  <motion.div
                    key="copy-content"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    className="h-full flex flex-col gap-8"
                  >
                    <div className="flex-1 bg-white/[0.015] border border-white/5 rounded-3xl relative overflow-hidden group shadow-2xl backdrop-blur-sm">
                      <div className="absolute top-0 right-0 p-6 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <Button variant="secondary" size="sm" className="bg-white/10 border-white/5 hover:bg-amber-500 hover:text-black rounded-lg text-[10px] font-black tracking-widest uppercase h-9" onClick={() => copyToClipboard(generatedCopy)}>
                          <Copy className="w-3 h-3 mr-2" />
                          COPIAR
                        </Button>
                      </div>
                      
                      <ScrollArea className="h-full p-10 md:p-16 custom-scrollbar">
                        <div className="max-w-2xl mx-auto py-4">
                          <div className="markdown-body">
                            <ReactMarkdown>{generatedCopy}</ReactMarkdown>
                          </div>
                        </div>
                      </ScrollArea>
                      
                      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0A0A0B] to-transparent pointer-events-none" />
                    </div>

                    <div className="flex gap-4 pb-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <Button variant="outline" className="rounded-xl border-white/5 bg-white/5 hover:bg-white/10 h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-all" onClick={() => copyToClipboard(generatedCopy)}>
                        <Copy className="w-4 h-4 mr-3 text-amber-500" />
                        Copiar Conteúdo
                      </Button>
                      <Button variant="outline" className="rounded-xl border-white/5 bg-white/5 hover:bg-white/10 h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-all" onClick={() => window.print()}>
                        <Printer className="w-4 h-4 mr-3 text-amber-500" />
                        Salvar PDF
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-copy"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-8"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-amber-500/10 blur-[100px] rounded-full animate-pulse" />
                      <div className="relative w-32 h-32 bg-white/[0.02] rounded-[40px] border border-white/5 flex items-center justify-center rotate-6 shadow-2xl">
                        <FileText className="w-12 h-12 text-amber-500/20" />
                      </div>
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1] }} 
                        transition={{ repeat: Infinity, duration: 4 }}
                        className="absolute -top-3 -right-3 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-black shadow-xl"
                      >
                        <Check className="w-6 h-6" strokeWidth={3} />
                      </motion.div>
                    </div>
                    <div className="space-y-3 max-w-sm">
                      <h2 className="text-2xl font-bold text-white tracking-tight uppercase">O palco está pronto.</h2>
                      <p className="text-neutral-500 text-sm leading-relaxed font-medium">Preencha os dados técnicos à esquerda para iniciar o processamento da sua copy de alta performance.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
