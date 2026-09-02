import React from 'react';
import { X, Check, User, Sparkles } from 'lucide-react';
import { TRY_ON_MODELS } from '../data/products';

export const ModelSelectionModal = ({
  isOpen,
  onClose,
  selectedModelId,
  onSelectModel,
}) => {
  if (!isOpen) return null;

  const maleModels = TRY_ON_MODELS.filter((m) => m.category === 'male' || m.gender === 'men');
  const femaleModels = TRY_ON_MODELS.filter((m) => m.category === 'female' || m.gender === 'women');

  const handleSelect = (model) => {
    onSelectModel(model);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-[#16161a] border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl text-white max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 pb-5 border-b border-white/10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c87d4a]/20 border border-[#c87d4a]/40 text-[#c87d4a] text-xs font-bold uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Virtual Fitting Room</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
            CHOOSE A MODEL
          </h2>
          <p className="text-xs text-white/50 max-w-md mx-auto">
            Select a professional model to try on clothing with LightX AI synthesis
          </p>
        </div>

        <div className="space-y-6 pt-5">
          {/* ── SECTION 1: MALE MODELS ───────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c87d4a]" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-white/80 font-bold">
                MALE MODELS
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {maleModels.map((model) => {
                const isSelected = selectedModelId === model.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => handleSelect(model)}
                    className={`relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 text-left group cursor-pointer ${
                      isSelected
                        ? 'border-[#c87d4a] ring-2 ring-[#c87d4a]/60 shadow-lg shadow-[#c87d4a]/25 bg-[#1f1a16]'
                        : 'border-white/10 hover:border-white/30 bg-[#1a1a1f] hover:scale-[1.02]'
                    }`}
                  >
                    {/* Model Image Frame */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/40">
                      <img
                        src={model.fullBody || model.avatar}
                        alt={model.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Selected Pill Badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-[#c87d4a] text-white flex items-center justify-center shadow-lg animate-scaleIn">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                      
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-xs font-bold text-white truncate drop-shadow-md">
                          {model.name}
                        </p>
                        <p className="text-[10px] text-white/60 drop-shadow-sm">
                          {model.height} • {model.size}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── SECTION 2: FEMALE MODELS ─────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c87d4a]" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-white/80 font-bold">
                FEMALE MODELS
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {femaleModels.map((model) => {
                const isSelected = selectedModelId === model.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => handleSelect(model)}
                    className={`relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 text-left group cursor-pointer ${
                      isSelected
                        ? 'border-[#c87d4a] ring-2 ring-[#c87d4a]/60 shadow-lg shadow-[#c87d4a]/25 bg-[#1f1a16]'
                        : 'border-white/10 hover:border-white/30 bg-[#1a1a1f] hover:scale-[1.02]'
                    }`}
                  >
                    {/* Model Image Frame */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/40">
                      <img
                        src={model.fullBody || model.avatar}
                        alt={model.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Selected Pill Badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-[#c87d4a] text-white flex items-center justify-center shadow-lg animate-scaleIn">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                      
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-xs font-bold text-white truncate drop-shadow-md">
                          {model.name}
                        </p>
                        <p className="text-[10px] text-white/60 drop-shadow-sm">
                          {model.height} • {model.size}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelSelectionModal;
