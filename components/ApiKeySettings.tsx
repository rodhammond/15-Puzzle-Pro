import React, { useState, useEffect } from 'react';
import { getUserApiKey, setUserApiKey } from '../services/algorithmicHintService';

interface ApiKeySettingsProps {
  onKeyChange?: (hasKey: boolean) => void;
}

export const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ onKeyChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existingKey = getUserApiKey();
    if (existingKey) {
      setApiKey(existingKey);
      setHasKey(true);
    }
  }, []);

  const handleSave = () => {
    setUserApiKey(apiKey);
    const keyExists = Boolean(apiKey.trim());
    setHasKey(keyExists);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onKeyChange?.(keyExists);
  };

  const handleClear = () => {
    setApiKey('');
    setUserApiKey('');
    setHasKey(false);
    onKeyChange?.(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          hasKey
            ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
        }`}
        title={hasKey ? "AI hints enabled" : "Configure AI hints"}
      >
        <i className={`fas ${hasKey ? 'fa-robot' : 'fa-key'}`}></i>
        <span className="hidden sm:inline">{hasKey ? 'AI Active' : 'Add API Key'}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <i className="fas fa-wand-magic-sparkles text-purple-400"></i>
                AI Hint Settings
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <p className="text-slate-400 text-xs mb-3">
              Add your free Gemini API key for AI-powered hints.
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline ml-1"
              >
                Get a free key <i className="fas fa-external-link-alt text-[10px]"></i>
              </a>
            </p>

            <div className="relative mb-3">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <i className={`fas ${showKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {saved ? (
                  <>
                    <i className="fas fa-check"></i>
                    Saved!
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Save Key
                  </>
                )}
              </button>
              {hasKey && (
                <button
                  onClick={handleClear}
                  className="px-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg py-2 text-sm font-medium transition-colors"
                >
                  <i className="fas fa-trash"></i>
                </button>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700">
              <p className="text-slate-500 text-xs">
                <i className="fas fa-shield-alt mr-1"></i>
                Key is stored locally in your browser only.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
