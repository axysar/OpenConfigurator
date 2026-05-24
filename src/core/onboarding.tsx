import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { storage } from '@shared/index';

const STORAGE_KEY = 'oc.onboarding.done';

export interface TourStep {
  id: string;
  target: string;
  title: string;
  body: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingContextValue {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  step: TourStep | null;
  next: () => void;
  prev: () => void;
  dismiss: () => void;
  restart: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export const useOnboarding = (): OnboardingContextValue => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
};

interface OnboardingProviderProps {
  steps: TourStep[];
  children: ReactNode;
}

export const OnboardingProvider = ({ steps, children }: OnboardingProviderProps): JSX.Element => {
  const alreadyDone = storage.get<boolean>(STORAGE_KEY, false);
  const [isActive, setIsActive] = useState(!alreadyDone);
  const [currentStep, setCurrentStep] = useState(0);

  const step = isActive && currentStep < steps.length ? steps[currentStep] : null;

  const next = useCallback(() => {
    if (currentStep >= steps.length - 1) {
      setIsActive(false);
      storage.set(STORAGE_KEY, true);
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, steps.length]);

  const prev = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const dismiss = useCallback(() => {
    setIsActive(false);
    storage.set(STORAGE_KEY, true);
  }, []);

  const restart = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    storage.set(STORAGE_KEY, false);
  }, []);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      isActive,
      currentStep,
      totalSteps: steps.length,
      step,
      next,
      prev,
      dismiss,
      restart,
    }),
    [isActive, currentStep, steps.length, step, next, prev, dismiss, restart],
  );

  return (
    <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
  );
};

export const TourTooltip = (): JSX.Element | null => {
  const { step, currentStep, totalSteps, next, prev, dismiss, isActive } = useOnboarding();
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!step || !isActive) {
      setPos(null);
      return;
    }
    const el = document.querySelector(step.target);
    if (!el) {
      setPos(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    const placement = step.placement ?? 'bottom';
    let top = 0;
    let left = 0;
    switch (placement) {
      case 'top':
        top = rect.top + window.scrollY - 8;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top = rect.top + window.scrollY + rect.height / 2;
        left = rect.left - 8;
        break;
      case 'right':
        top = rect.top + window.scrollY + rect.height / 2;
        left = rect.right + 8;
        break;
      case 'bottom':
      default:
        top = rect.bottom + window.scrollY + 8;
        left = rect.left + rect.width / 2;
        break;
    }
    setPos({ top, left });
  }, [step, isActive]);

  if (!step || !isActive || !pos) return null;

  return (
    <div
      className="tour-tooltip"
      role="dialog"
      aria-label={step.title}
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="tour-header">
        <strong>{step.title}</strong>
        <button type="button" onClick={dismiss} aria-label="Close tour" className="tour-close">✕</button>
      </div>
      <p>{step.body}</p>
      <div className="tour-footer">
        <span className="tour-progress">{currentStep + 1} / {totalSteps}</span>
        <div className="tour-nav">
          {currentStep > 0 && (
            <button type="button" onClick={prev} className="oc-icon-btn">Back</button>
          )}
          <button type="button" onClick={next} className="oc-icon-btn primary">
            {currentStep === totalSteps - 1 ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};
