import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { TransactionModal } from './components/TransactionModal';
import { VoiceCommand } from './components/VoiceCommand';
import { 
  Home, 
  PieChart, 
  CreditCard, 
  User, 
  Plus,
  Mic
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <main className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative overflow-hidden">
        <Dashboard />
        
        {/* Floating Voice Button */}
        <button 
          onClick={() => setIsVoiceOpen(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20 active:scale-90 transition-all z-40"
        >
          <Mic size={24} />
        </button>

        {/* Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-xl border-t border-slate-100 px-8 py-5 flex justify-between items-center z-40">
          <button 
            onClick={() => setActiveTab('home')}
            className={`p-2 transition-all ${activeTab === 'home' ? 'text-indigo-600' : 'text-slate-300'}`}
          >
            <Home className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`p-2 transition-all ${activeTab === 'stats' ? 'text-indigo-600' : 'text-slate-300'}`}
          >
            <PieChart className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center shadow-2xl shadow-slate-900/20 -mt-14 border-8 border-white active:scale-90 transition-all"
          >
            <Plus className="w-8 h-8" />
          </button>

          <button 
            onClick={() => setActiveTab('cards')}
            className={`p-2 transition-all ${activeTab === 'cards' ? 'text-indigo-600' : 'text-slate-300'}`}
          >
            <CreditCard className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`p-2 transition-all ${activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-300'}`}
          >
            <User className="w-6 h-6" />
          </button>
        </nav>

        <TransactionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />

        <VoiceCommand 
          isOpen={isVoiceOpen} 
          onClose={() => setIsVoiceOpen(false)} 
        />
      </main>
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
