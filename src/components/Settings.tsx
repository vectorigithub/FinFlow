import React from 'react';
import { Settings as SettingsIcon, Download, Sun, Moon, Monitor } from 'lucide-react';

interface SettingsProps {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
}

export const Settings: React.FC<SettingsProps> = ({ theme, setTheme, animationsEnabled, setAnimationsEnabled }) => {
  const handleExport = () => {
    window.location.href = '/api/export';
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <SettingsIcon className="text-slate-400" size={28} />
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 space-y-8">
        <section>
          <h3 className="text-lg font-bold mb-4">Appearance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ThemeOption 
              active={theme === 'light'} 
              onClick={() => setTheme('light')} 
              icon={<Sun size={20} />} 
              label="Light" 
            />
            <ThemeOption 
              active={theme === 'dark'} 
              onClick={() => setTheme('dark')} 
              icon={<Moon size={20} />} 
              label="Dark" 
            />
            <ThemeOption 
              active={theme === 'system'} 
              onClick={() => setTheme('system')} 
              icon={<Monitor size={20} />} 
              label="System" 
            />
          </div>
        </section>

        <hr className="border-slate-100" />

        <section>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Animations</h3>
              <p className="text-sm text-slate-500">Enable or disable UI animations and transitions.</p>
            </div>
            <button 
              onClick={() => setAnimationsEnabled(!animationsEnabled)}
              className={`w-14 h-8 rounded-full transition-all relative ${animationsEnabled ? 'bg-black' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${animationsEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </section>

        <hr className="border-slate-100" />

        <section>
          <h3 className="text-lg font-bold mb-2">Data Management</h3>
          <p className="text-sm text-slate-500 mb-6">Export your financial data as a JSON file for backup or use in other applications.</p>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-zinc-800 transition-colors font-bold"
          >
            <Download size={20} />
            Export Data (.json)
          </button>
        </section>
      </div>
    </div>
  );
};

const ThemeOption = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-4 rounded-2xl border-2 transition-all ${
      active ? 'border-black bg-slate-50' : 'border-slate-100 hover:border-slate-200'
    }`}
  >
    <div className={`${active ? 'text-black' : 'text-slate-400'}`}>
      {icon}
    </div>
    <span className={`font-bold ${active ? 'text-black' : 'text-slate-500'}`}>{label}</span>
  </button>
);
