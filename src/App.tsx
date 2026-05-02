import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  FileText, 
  Copy, 
  Loader2, 
  Check,
  X,
  Printer,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
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
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

import { generateCopy, CopyInput } from "@/src/lib/gemini";
import { COPY_STRATEGIES, MENTAL_TRIGGERS } from "@/src/lib/templates";
import { storage, ReferenceMaterial } from "@/src/lib/supabase";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [referenceMaterials, setReferenceMaterials] = useState<ReferenceMaterial[]>([]);
  const [isLearning, setIsLearning] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: "", content: "", category: "Exemplo" });
  const [activeTab, setActiveTab ] = useState("editor");

  // Handle window resizing
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load data from Storage on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const historyData = await storage.getHistory();
        setHistory(historyData);

        const refData = await storage.getMaterials();
        setReferenceMaterials(refData);
      } catch (e) {
        console.warn("Storage fetch failed:", e);
      }
    };
    fetchData();
  }, []);

  const [formData, setFormData] = useState<CopyInput>({
    productName: "",
    niche: "",
    targetAudience: "",
    mainBenefit: "",
    mainPain: "",
    keywords: "",
    strategyId: "bridge_presell",
    mentalTrigger: MENTAL_TRIGGERS[0],
  });

  const handleGenerate = async () => {
    if (!formData.productName || !formData.mainBenefit || !formData.mainPain) {
      toast.error("Por favor, preencha os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const result = await generateCopy(formData, referenceMaterials);
      if (result) {
        setGeneratedCopy(result);
        
        // Save to Storage
        await storage.saveHistory(result, formData);

        const newHistory = [result, ...history].slice(0, 10);
        setHistory(newHistory);
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

  const handleAddMaterial = async () => {
    if (!newMaterial.title || !newMaterial.content) {
      toast.error("Preencha título e conteúdo do material.");
      return;
    }

    setIsLearning(true);
    try {
      const data = await storage.addMaterial(newMaterial);
      setReferenceMaterials([data, ...referenceMaterials]);
      setNewMaterial({ title: "", content: "", category: "Exemplo" });
      toast.success("Conhecimento absorvido!");
    } catch (e) {
      toast.error("Erro ao salvar material.");
    } finally {
      setIsLearning(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    try {
      await storage.deleteMaterial(id);
      setReferenceMaterials(referenceMaterials.filter(m => m.id !== id));
      toast.info("Material removido.");
    } catch (e) {
      toast.error("Erro ao remover material.");
    }
  };

  const clearHistory = async () => {
    try {
      await storage.clearHistory();
    } catch (e) {
      console.error("Erro ao limpar histórico:", e);
    }
    
    setHistory([]);
    toast.info("Histórico limpo.");
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#0A0A0B] text-neutral-300 font-sans flex flex-col selection:bg-amber-500/30 selection:text-amber-200 normal-case" id="app-container">
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
        <AnimatePresence mode="popLayout" initial={false}>
          {isSidebarOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0, x: -50 }}
              animate={{ 
                width: isMobile ? "100%" : 480, 
                opacity: 1, 
                x: 0 
              }}
              exit={{ width: 0, opacity: 0, x: -50 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full lg:w-[480px] lg:border-r border-white/5 bg-[#0D0D0F] p-8 lg:p-14 flex flex-col gap-10 overflow-y-auto custom-scrollbar shrink-0"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mb-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Copy Architect v3</span>
                </div>
                <h2 className="text-3xl font-serif text-white tracking-tight">Engenharia de <span className="text-neutral-600">Alta Conversão</span></h2>
              </div>

              <div className="space-y-8">
                {/* Ativo / Oferta */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="productName" className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold ml-1">Ativo / Oferta *</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center cursor-help transition-colors hover:border-amber-500/50">
                          <span className="text-[8px] font-bold text-neutral-600">?</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1A1A1C] border-white/10 text-neutral-300 max-w-[200px]">
                        <p>O nome do seu curso, produto, serviço ou oferta principal.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input 
                    id="productName" 
                    className="bg-[#141416]/50 border-white/5 rounded-2xl h-14 px-6 focus-visible:ring-amber-500/20 focus-visible:border-amber-500/30 text-neutral-200 transition-all placeholder:text-neutral-800 font-medium text-base shadow-inner hover:bg-[#141416] border"
                    placeholder="Ex: Método Flow Profissional" 
                    value={formData.productName}
                    onChange={(e) => setFormData({...formData, productName: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Nicho */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="niche" className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold ml-1">Nicho</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center cursor-help transition-colors hover:border-amber-500/50">
                            <span className="text-[8px] font-bold text-neutral-600">?</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1A1A1C] border-white/10 text-neutral-300 max-w-[200px]">
                          <p>A área de atuação (ex: Finanças, Emagrecimento, Marketing).</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input 
                      id="niche" 
                      className="bg-[#141416]/50 border-white/5 rounded-2xl h-14 px-6 focus-visible:ring-amber-500/20 focus-visible:border-amber-500/30 text-neutral-200 transition-all placeholder:text-neutral-800 hover:bg-[#141416] border"
                      placeholder="Ex: Fitness" 
                      value={formData.niche}
                      onChange={(e) => setFormData({...formData, niche: e.target.value})}
                    />
                  </div>
                  {/* Público */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="targetAudience" className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold ml-1">Público</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center cursor-help transition-colors hover:border-amber-500/50">
                            <span className="text-[8px] font-bold text-neutral-600">?</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1A1A1C] border-white/10 text-neutral-300 max-w-[200px]">
                          <p>Quem é o seu avatar ideal? (ex: Mulheres 40+, Pequenos empresários).</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input 
                      id="targetAudience" 
                      className="bg-[#141416]/50 border-white/5 rounded-2xl h-14 px-6 focus-visible:ring-amber-500/20 focus-visible:border-amber-500/30 text-neutral-200 transition-all placeholder:text-neutral-800 hover:bg-[#141416] border"
                      placeholder="Ex: Iniciantes" 
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                    />
                  </div>
                </div>

                {/* Promessa Central */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mainBenefit" className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold ml-1">Promessa Central *</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center cursor-help transition-colors hover:border-amber-500/50">
                          <span className="text-[8px] font-bold text-neutral-600">?</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1A1A1C] border-white/10 text-neutral-300 max-w-[200px]">
                        <p>O maior benefício que o cliente terá ao adquirir sua oferta.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input 
                    id="mainBenefit" 
                    className="bg-[#141416]/50 border-white/5 rounded-2xl h-14 px-6 focus-visible:ring-amber-500/20 focus-visible:border-amber-500/30 text-neutral-200 transition-all placeholder:text-neutral-800 font-medium text-base hover:bg-[#141416] border"
                    placeholder="Ex: Venda sem investir 1 real" 
                    value={formData.mainBenefit}
                    onChange={(e) => setFormData({...formData, mainBenefit: e.target.value})}
                  />
                </div>

                {/* Problema Crítico */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mainPain" className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold ml-1">Problema Crítico *</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center cursor-help transition-colors hover:border-amber-500/50">
                          <span className="text-[8px] font-bold text-neutral-600">?</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1A1A1C] border-white/10 text-neutral-300 max-w-[200px]">
                        <p>A maior dor ou frustração que seu público enfrenta hoje.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input 
                    id="mainPain" 
                    className="bg-[#141416]/50 border-white/5 rounded-2xl h-14 px-6 focus-visible:ring-amber-500/20 focus-visible:border-amber-500/30 text-neutral-200 transition-all placeholder:text-neutral-800 font-medium text-base hover:bg-[#141416] border"
                    placeholder="Ex: Bloqueios constants no Facebook" 
                    value={formData.mainPain}
                    onChange={(e) => setFormData({...formData, mainPain: e.target.value})}
                  />
                </div>

                {/* Palavras de Impacto */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="keywords" className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold ml-1">Palavras de Impacto</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center cursor-help transition-colors hover:border-amber-500/50">
                          <span className="text-[8px] font-bold text-neutral-600">?</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1A1A1C] border-white/10 text-neutral-300 max-w-[200px]">
                        <p>Palavras que geram curiosidade ou autoridade.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input 
                    id="keywords" 
                    className="bg-[#141416]/50 border-white/5 rounded-2xl h-14 px-6 focus-visible:ring-amber-500/20 focus-visible:border-amber-500/30 text-neutral-200 transition-all placeholder:text-neutral-800 hover:bg-[#141416] border"
                    placeholder="Ex: bizarro, hack, revelado" 
                    value={formData.keywords}
                    onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold ml-1">Modelo de Escrita</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center cursor-help transition-colors hover:border-amber-500/50">
                          <span className="text-[8px] font-bold text-neutral-600">?</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1A1A1C] border-white/10 text-neutral-300 max-w-[200px]">
                        <p>Diferentes abordagens de copy para diferentes objetivos e canais.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select 
                    value={formData.strategyId} 
                    onValueChange={(val) => setFormData({...formData, strategyId: val})}
                  >
                    <SelectTrigger className="w-full bg-[#141416]/50 border-white/5 rounded-2xl h-14 px-6 text-neutral-200 focus:ring-amber-500/20 transition-all text-left font-medium hover:bg-[#141416] border">
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
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold ml-1">Gatilho Primário</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center cursor-help transition-colors hover:border-amber-500/50">
                          <span className="text-[8px] font-bold text-neutral-600">?</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1A1A1C] border-white/10 text-neutral-300 max-w-[200px]">
                        <p>O conceito psicológico que será a base da persuasão nesta peça.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select 
                    value={formData.mentalTrigger} 
                    onValueChange={(val) => setFormData({...formData, mentalTrigger: val})}
                  >
                    <SelectTrigger className="w-full bg-[#141416]/50 border-white/5 rounded-2xl h-14 px-6 text-neutral-200 focus:ring-amber-500/20 transition-all text-left font-medium hover:bg-[#141416] border">
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
                    className="w-full h-16 bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-black font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[12px] shadow-2xl shadow-amber-600/20 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] border-none px-4 group/btn relative overflow-hidden" 
                    id="generate-btn"
                    onClick={handleGenerate}
                    disabled={loading}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-in-out skew-x-12" />
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        <span>Engenhando...</span>
                      </>
                    ) : (
                      <span className="truncate relative z-10">Gerar Copy de Alta Performance</span>
                    )}
                  </Button>
                </div>

                {history.length > 0 && (
                  <div className="pt-10 border-t border-white/5 space-y-6">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-[10px] uppercase tracking-[0.3em] text-neutral-600 font-bold">REPROCESSADOS RECENTES</h3>
                      <button onClick={clearHistory} className="text-[9px] text-neutral-700 hover:text-red-900 font-black uppercase transition-colors tracking-widest">
                        LIMPAR
                      </button>
                    </div>
                    <div className="space-y-3">
                      {history.map((content, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setGeneratedCopy(content)}
                          className="p-4 bg-[#141416]/30 border border-white/5 rounded-xl cursor-pointer hover:bg-amber-500/5 hover:border-amber-500/20 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <FileText className="w-4 h-4 text-neutral-600 group-hover:text-amber-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] text-neutral-400 font-medium truncate leading-tight">
                                {content.split('\n')[0].replace(/[#*]/g, '').trim() || "Cópia Gerada #" + (history.length - idx)}
                              </p>
                              <p className="text-[9px] text-neutral-700 font-bold uppercase mt-0.5 tracking-tighter">
                                Arquivo de Memória {idx + 1}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Content Area - Right */}
        <section className="flex-1 p-6 lg:p-12 bg-[#0A0A0B] flex flex-col min-h-screen lg:min-h-0 lg:overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(217,119,6,0.03),transparent_40%)] pointer-events-none" />
          
          <div className="h-full flex flex-col z-10">
            <div className="flex items-center justify-between mb-8 lg:mb-10">
              <div className="flex items-center gap-6">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="rounded-xl border border-white/5 bg-white/5 hover:bg-amber-500/10 hover:text-amber-500 transition-all hidden lg:flex h-12 w-12"
                  title={isSidebarOpen ? "Recolher Arquiteto" : "Expandir Arquiteto"}
                >
                  {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
                </Button>
                <div>
                  <p className="text-[10px] text-amber-500/60 uppercase tracking-[0.4em] mb-1 px-1 font-bold">Prancheta</p>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight uppercase">Arquitetura da <span className="opacity-40">Página</span></h2>
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white/5 p-1 rounded-xl border border-white/5 hidden sm:flex">
                <TabsList className="bg-transparent border-none p-0 h-10 gap-1">
                  <TabsTrigger value="editor" className="rounded-lg px-6 data-[state=active]:bg-amber-500 data-[state=active]:text-black text-[10px] font-bold uppercase tracking-widest transition-all">Editor</TabsTrigger>
                  <TabsTrigger value="knowledge" className="rounded-lg px-6 data-[state=active]:bg-amber-500 data-[state=active]:text-black text-[10px] font-bold uppercase tracking-widest transition-all">Cérebro</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Mobile toggle button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden rounded-lg border border-white/5 bg-white/5 text-[10px] font-bold uppercase tracking-widest px-4 h-10"
              >
                {isSidebarOpen ? "Ocultar Dados" : "Ver Dados"}
              </Button>
            </div>

            <div className="mt-0 flex-1 lg:overflow-hidden" id="copy-result">
              <AnimatePresence mode="wait">
                {activeTab === "editor" ? (
                  generatedCopy ? (
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
                  )
                ) : (
                  <motion.div
                    key="knowledge-base"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full flex flex-col gap-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 min-h-0">
                      {/* Form side */}
                      <Card className="bg-white/[0.02] border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                        <CardHeader className="p-8 pb-4">
                          <CardTitle className="text-white text-lg tracking-wider uppercase font-black">Adicionar Estudo</CardTitle>
                          <CardDescription className="text-neutral-500 text-xs uppercase tracking-widest font-bold">Alimente o cérebro do Titan-G3</CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                           <div className="space-y-2">
                              <Label className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest">Título do Material</Label>
                              <Input 
                                className="bg-[#0A0A0B]/50 border-white/5 rounded-xl text-neutral-300"
                                placeholder="Ex: Modelo de Anúncio VSL"
                                value={newMaterial.title}
                                onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                              />
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest">Categoria</Label>
                              <Select value={newMaterial.category} onValueChange={(val) => setNewMaterial({...newMaterial, category: val})}>
                                <SelectTrigger className="bg-[#0A0A0B]/50 border-white/5 rounded-xl text-neutral-300">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1C] border-white/10 text-neutral-300">
                                  <SelectItem value="Exemplo">Exemplo de Copy</SelectItem>
                                  <SelectItem value="Framework">Framework / Estrutura</SelectItem>
                                  <SelectItem value="Estudo">Material de Estudo</SelectItem>
                                  <SelectItem value="Outros">Outros</SelectItem>
                                </SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-2 flex-1 flex flex-col">
                              <Label className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest">Conteúdo / Texto</Label>
                              <Textarea 
                                className="bg-[#0A0A0B]/50 border-white/5 rounded-xl text-neutral-300 flex-1 min-h-[150px] resize-none"
                                placeholder="Cole aqui o texto do material de estudo..."
                                value={newMaterial.content}
                                onChange={(e) => setNewMaterial({...newMaterial, content: e.target.value})}
                              />
                           </div>
                        </CardContent>
                        <CardFooter className="p-8 pt-0">
                          <Button 
                            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-[10px] h-12 rounded-xl"
                            onClick={handleAddMaterial}
                            disabled={isLearning}
                          >
                            {isLearning ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fixar Conhecimento"}
                          </Button>
                        </CardFooter>
                      </Card>

                      {/* List side */}
                      <div className="md:col-span-2 flex flex-col gap-6 overflow-hidden">
                        <div className="flex items-center justify-between px-2">
                           <h3 className="text-[10px] text-neutral-500 uppercase font-bold tracking-[0.3em]">Materiais Aspirados ({referenceMaterials.length})</h3>
                        </div>
                        <ScrollArea className="flex-1 rounded-3xl pr-4">
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-10">
                              {referenceMaterials.length > 0 ? (
                                referenceMaterials.map((material) => (
                                  <Card key={material.id} className="bg-white/[0.015] border-white/5 hover:border-amber-500/20 transition-all rounded-2xl group flex flex-col">
                                    <CardHeader className="p-5 flex-row items-center justify-between space-y-0">
                                      <div className="space-y-1">
                                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase border-none px-2 rounded-lg">{material.category}</Badge>
                                        <CardTitle className="text-white text-[13px] font-bold truncate pr-2">{material.title}</CardTitle>
                                      </div>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-neutral-700 hover:text-red-500 transition-colors"
                                        onClick={() => handleDeleteMaterial(material.id)}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </CardHeader>
                                    <CardContent className="p-5 pt-0 flex-1">
                                      <p className="text-[11px] text-neutral-500 line-clamp-3 leading-relaxed">
                                        {material.content}
                                      </p>
                                    </CardContent>
                                    <CardFooter className="p-5 pt-0 border-t border-white/[0.02] flex justify-between items-center bg-white/[0.005]">
                                      <span className="text-[9px] text-neutral-700 font-mono italic">
                                        {new Date(material.created_at).toLocaleDateString()}
                                      </span>
                                      <Button variant="ghost" size="sm" className="h-6 text-[9px] font-bold text-neutral-600 hover:text-amber-500 uppercase p-0">Ver Detalhes</Button>
                                    </CardFooter>
                                  </Card>
                                ))
                              ) : (
                                <div className="col-span-full h-64 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-neutral-700 space-y-3">
                                  <Zap className="w-10 h-10 opacity-20" />
                                  <p className="text-xs uppercase font-bold tracking-widest text-neutral-800">O cérebro está vazio</p>
                                </div>
                              )}
                           </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>
    </div>
    </TooltipProvider>
  );
}
