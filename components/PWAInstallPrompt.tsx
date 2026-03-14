"use client";
import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Share, Plus, Home } from 'lucide-react';
import { COLORS } from '@/lib/constants';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detecta iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detecta se já está instalado
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Verifica se já foi dispensado
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Só mostra se: mobile, não instalado, não dispensado recentemente (7 dias)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile && !standalone && daysSinceDismissed > 7) {
      // Para Android/Chrome
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setTimeout(() => setShowPrompt(true), 3000); // Mostra após 3s
      };
      window.addEventListener('beforeinstallprompt', handler);

      // Para iOS, mostra após 3s
      if (iOS) {
        setTimeout(() => setShowPrompt(true), 3000);
      }

      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (isStandalone || !showPrompt) return null;

  if (showInstructions) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
          style={{ background: COLORS.accentGradient }}>
          
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Smartphone size={24} color="white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Instalar App</h3>
                <p className="text-sm text-white/70">Siga os passos abaixo</p>
              </div>
            </div>
            <button onClick={() => setShowInstructions(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10">
              <X size={18} color="white" />
            </button>
          </div>

          {isIOS ? (
            <div className="space-y-4">
              <div className="flex gap-3 p-4 rounded-xl bg-white/10 backdrop-blur">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-white font-bold text-sm">1</div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm mb-1">Toque no botão Compartilhar</p>
                  <div className="flex items-center gap-2 text-white/80 text-xs">
                    <Share size={16} />
                    <span>Na barra inferior do Safari</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-4 rounded-xl bg-white/10 backdrop-blur">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-white font-bold text-sm">2</div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm mb-1">Adicionar à Tela de Início</p>
                  <div className="flex items-center gap-2 text-white/80 text-xs">
                    <Plus size={16} />
                    <span>Role e selecione esta opção</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-4 rounded-xl bg-white/10 backdrop-blur">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-white font-bold text-sm">3</div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm mb-1">Confirme a instalação</p>
                  <div className="flex items-center gap-2 text-white/80 text-xs">
                    <Home size={16} />
                    <span>Toque em "Adicionar"</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 rounded-xl bg-white/10 backdrop-blur">
                <p className="text-white/70 text-xs text-center">
                  💡 Após instalado, o app ficará na sua tela inicial
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-3 p-4 rounded-xl bg-white/10 backdrop-blur">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-white font-bold text-sm">1</div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm mb-1">Toque em "Instalar"</p>
                  <p className="text-white/80 text-xs">O navegador mostrará um prompt de instalação</p>
                </div>
              </div>

              <div className="flex gap-3 p-4 rounded-xl bg-white/10 backdrop-blur">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-white font-bold text-sm">2</div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm mb-1">Confirme a instalação</p>
                  <p className="text-white/80 text-xs">O app será adicionado à sua tela inicial</p>
                </div>
              </div>
            </div>
          )}

          <button onClick={() => setShowInstructions(false)}
            className="w-full mt-6 py-3 rounded-xl bg-white text-indigo-600 font-semibold text-sm transition-transform active:scale-95">
            Entendi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] animate-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-md mx-auto rounded-2xl p-4 shadow-2xl backdrop-blur-xl"
        style={{ background: `linear-gradient(135deg, rgba(99,102,241,0.95) 0%, rgba(139,92,246,0.95) 100%)` }}>
        
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Download size={24} color="white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm mb-1">Instalar NeoDelivery</h3>
            <p className="text-white/80 text-xs leading-relaxed">
              Instale nosso app para acesso rápido e experiência completa
            </p>
          </div>

          <button onClick={handleDismiss}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors hover:bg-white/10">
            <X size={16} color="white" />
          </button>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={handleDismiss}
            className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-sm font-semibold transition-all active:scale-95">
            Agora não
          </button>
          <button onClick={handleInstall}
            className="flex-1 py-2.5 rounded-xl bg-white text-indigo-600 text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2">
            <Download size={16} />
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
}
