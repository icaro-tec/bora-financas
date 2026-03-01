import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../context/FinanceContext';
import { GoogleGenAI } from "@google/genai";

interface VoiceCommandProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
}

export const VoiceCommand: React.FC<VoiceCommandProps> = ({ isOpen, onClose, setActiveTab }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const { addTransaction, stats, cards, logout } = useFinance();

  const processVoiceCommand = useCallback(async (text: string) => {
    // Using the API key provided by the user
    const apiKey = "AIzaSyDlHNxpN0mIaZs4-YEXVRbQm4s6oIu_w1M";
    
    setIsProcessing(true);
    setAiResponse(null);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Você é o assistente do app "Bora Finanças". Analise o comando: "${text}".
        
        Contexto Atual:
        - Saldo Total: ${stats.totalBalance}
        - Gastos do Mês: ${stats.monthlyExpenses}
        - Ganhos do Mês: ${stats.monthlyIncome}
        - Cartões: ${cards.map(c => `${c.brand} (Final ${c.lastFour}): Fatura ${c.currentInvoice}`).join(', ')}

        Determine a intenção e retorne APENAS um JSON:
        1. "add_transaction": Para adicionar gastos/ganhos. { "intent": "add_transaction", "params": { "description", "amount", "type", "category" }, "message": "Ok, adicionei [desc] de [valor]" }
        2. "consult_invoice": Para saber valor de fatura. { "intent": "consult_invoice", "message": "Sua fatura do [cartão] está em [valor]" }
        3. "consult_report": Para resumos de gastos. { "intent": "consult_report", "message": "Este mês você já gastou [valor]..." }
        4. "navigate": Para mudar de tela (home, stats, cards, profile). { "intent": "navigate", "params": { "screen" }, "message": "Indo para [tela]..." }
        5. "logout": Para sair. { "intent": "logout", "message": "Até logo!" }`,
        config: {
          responseMimeType: "application/json",
        }
      });

      const result = JSON.parse(response.text || '{}');
      setAiResponse(result.message);

      // Execute actions based on intent
      setTimeout(() => {
        if (result.intent === 'add_transaction' && result.params) {
          addTransaction({
            description: result.params.description,
            amount: result.params.amount,
            type: result.params.type || 'expense',
            category: result.params.category || 'Outros',
            date: new Date().toISOString(),
          });
        } else if (result.intent === 'logout') {
          logout();
        } else if (result.intent === 'navigate' && result.params?.screen) {
          setActiveTab(result.params.screen);
        }
        
        // Speak the response
        if (window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(result.message);
          utterance.lang = 'pt-BR';
          window.speechSynthesis.speak(utterance);
        }

        // Close after a delay to let user read/hear
        setTimeout(() => {
          if (result.intent !== 'consult_report' && result.intent !== 'consult_invoice') {
            onClose();
          }
        }, 3000);
      }, 500);

    } catch (error) {
      console.error("Erro ao processar comando de voz:", error);
      setAiResponse("Desculpe, não consegui entender. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  }, [addTransaction, stats, cards, logout, onClose, setActiveTab]);

  useEffect(() => {
    if (!isOpen) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de voz nativo. Tente usar o Chrome ou um navegador compatível.");
      onClose();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = true;

    const startRecognition = async () => {
      try {
        // Explicitly request microphone permission to trigger system prompt
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognition.start();
      } catch (e) {
        console.error("Permissão negada ou erro ao acessar microfone:", e);
        alert("Permissão de microfone negada. Por favor, habilite o microfone nas configurações do seu celular/navegador.");
        onClose();
      }
    };

    recognition.onstart = () => {
      setIsListening(true);
      setAiResponse(null);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Erro no reconhecimento:", event.error);
      if (event.error === 'not-allowed') {
        alert("Permissão de microfone negada. Por favor, habilite o microfone nas configurações do seu celular/navegador.");
      }
      setIsListening(false);
      onClose();
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);
      
      if (event.results[current].isFinal) {
        processVoiceCommand(transcriptText);
      }
    };

    startRecognition();

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [isOpen, onClose, processVoiceCommand]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] flex items-center justify-center p-6"
          >
            <div className="w-full max-w-sm bg-white border border-slate-100 rounded-[40px] p-8 text-center relative shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-50">
                <motion.div 
                  className="h-full bg-indigo-600"
                  initial={{ width: "0%" }}
                  animate={{ width: isListening ? "100%" : "0%" }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>

              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-8 mt-4">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  {isProcessing ? (
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                  ) : (
                    <motion.div
                      animate={{ scale: isListening ? [1, 1.2, 1] : 1 }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <Mic className="w-10 h-10 text-indigo-600" />
                    </motion.div>
                  )}
                  {isListening && (
                    <motion.div 
                      className="absolute inset-0 border-2 border-indigo-600 rounded-full"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
                  {isProcessing ? 'Analisando...' : aiResponse ? 'Bora lá!' : isListening ? 'Ouvindo...' : 'Aguardando...'}
                </h2>
                <p className="text-slate-500 text-sm px-4 font-medium min-h-[40px]">
                  {aiResponse || transcript || 'Diga: "Quanto gastei este mês?" ou "Qual a fatura do Visa?"'}
                </p>
              </div>

              <div className="flex justify-center gap-4">
                {aiResponse ? (
                  <div className="px-4 py-2 bg-indigo-600 rounded-full text-[10px] font-bold text-white uppercase tracking-widest animate-pulse">
                    Comando Executado
                  </div>
                ) : (
                  <div className="px-4 py-2 bg-slate-50 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Português (Brasil)
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
