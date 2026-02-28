import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../context/FinanceContext';
import { GoogleGenAI } from "@google/genai";

interface VoiceCommandProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceCommand: React.FC<VoiceCommandProps> = ({ isOpen, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { addTransaction } = useFinance();

  const processVoiceCommand = useCallback(async (text: string) => {
    // Using the API key provided by the user
    const apiKey = "AIzaSyDlHNxpN0mIaZs4-YEXVRbQm4s6oIu_w1M";
    
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extraia informações de transação financeira do seguinte texto em português: "${text}". 
        Retorne APENAS um JSON com os campos: description (string), amount (number), type ('income' | 'expense'), category (string).
        Exemplo: "Recebi 50 reais de presente" -> {"description": "Presente", "amount": 50, "type": "income", "category": "Outros"}
        Exemplo: "Gastei 30 reais no mercado" -> {"description": "Mercado", "amount": 30, "type": "expense", "category": "Mercado"}`,
        config: {
          responseMimeType: "application/json",
        }
      });

      const result = JSON.parse(response.text || '{}');
      if (result.description && result.amount) {
        addTransaction({
          description: result.description,
          amount: result.amount,
          type: result.type || 'expense',
          category: result.category || 'Outros',
          date: new Date().toISOString(),
        });
        onClose();
      }
    } catch (error) {
      console.error("Erro ao processar comando de voz:", error);
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
  }, [addTransaction, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de voz.");
      onClose();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);
      
      if (event.results[current].isFinal) {
        processVoiceCommand(transcriptText);
      }
    };

    recognition.start();

    return () => {
      recognition.stop();
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
                  {isProcessing ? 'Processando...' : isListening ? 'Ouvindo...' : 'Aguardando...'}
                </h2>
                <p className="text-slate-500 text-sm px-4 font-medium">
                  {transcript || 'Diga algo como "Gastei 50 reais com pizza"'}
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <div className="px-4 py-2 bg-slate-50 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Português (Brasil)
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
