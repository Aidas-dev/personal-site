import { createContext, useContext, useState, type ReactNode } from 'react';

export type PricingMode = 'b2c' | 'b2b';

interface PricingModeContextValue {
  mode: PricingMode;
  isB2B: boolean;
  toggleMode: () => void;
  setMode: (mode: PricingMode) => void;
}

const PricingModeContext = createContext<PricingModeContextValue | null>(null);

export function PricingModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<PricingMode>('b2c');

  const toggleMode = () => {
    setModeState((prev) => (prev === 'b2c' ? 'b2b' : 'b2c'));
  };

  const setMode = (mode: PricingMode) => {
    setModeState(mode);
  };

  return (
    <PricingModeContext.Provider
      value={{
        mode,
        isB2B: mode === 'b2b',
        toggleMode,
        setMode,
      }}
    >
      {children}
    </PricingModeContext.Provider>
  );
}

export function usePricingMode(): PricingModeContextValue {
  const context = useContext(PricingModeContext);
  if (!context) {
    throw new Error('usePricingMode must be used within a PricingModeProvider');
  }
  return context;
}
