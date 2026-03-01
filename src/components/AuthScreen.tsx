import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Lock, Fingerprint } from 'lucide-react';
import { motion } from 'motion/react';

export const AuthScreen: React.FC = () => {
  const [pin, setPin] = useState('');
  const { login } = useFinance();
  const [error, setError] = useState(false);

  const handlePinClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (!login(newPin)) {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 1000);
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-slate-900 p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-100">
          <Lock className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2 tracking-tight">Bora Finanças</h1>
        <p className="text-slate-500 text-sm">Insira seu PIN para acessar</p>
      </motion.div>

      <div className="flex gap-4 mb-12">
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i}
            className={`w-3 h-3 rounded-full border transition-all duration-200 ${
              pin.length > i 
                ? 'bg-indigo-600 border-indigo-600 scale-125' 
                : 'border-slate-200 bg-slate-100'
            } ${error ? 'border-red-500 bg-red-500 animate-shake' : ''}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-8 max-w-xs w-full">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            onClick={() => handlePinClick(num)}
            className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-xl font-semibold text-slate-700 active:bg-slate-50 active:scale-95 transition-all"
          >
            {num}
          </button>
        ))}
        <div className="flex items-center justify-center">
          <Fingerprint className="w-8 h-8 text-slate-300" />
        </div>
        <button
          onClick={() => handlePinClick('0')}
          className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-xl font-semibold text-slate-700 active:bg-slate-50 active:scale-95 transition-all"
        >
          0
        </button>
        <button
          onClick={() => setPin(pin.slice(0, -1))}
          className="w-16 h-16 flex items-center justify-center text-sm font-semibold text-slate-400 active:text-slate-600"
        >
          Apagar
        </button>
      </div>
    </div>
  );
};
