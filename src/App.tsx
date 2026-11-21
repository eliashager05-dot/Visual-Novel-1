import { AnimatePresence } from 'framer-motion';
import { AudioDirector } from './components/Audio/AudioDirector';
import { ErrorBoundary } from './components/Game/ErrorBoundary';
import { GameScreen } from './components/Game/GameScreen';
import { AgeGate } from './components/MainMenu/AgeGate';
import { MainMenu } from './components/MainMenu/MainMenu';
import { Toasts } from './components/Overlays/Toasts';
import { GameViewport } from './components/Stage/GameViewport';
import { useGameStore } from './store/gameStore';
import { useSettings } from './store/settingsStore';
import { useUi } from './store/uiStore';

export default function App() {
  const inGame = useGameStore((s) => s.game !== null);
  const ageConfirmed = useSettings((s) => s.ageConfirmed);
  return (
    <GameViewport>
      <AnimatePresence mode="wait">
        {!ageConfirmed ? <AgeGate key="age" /> : inGame ? (
          <ErrorBoundary
            key="game"
            onReset={() => {
              useUi.getState().reset();
              useGameStore.getState().quitToTitle();
            }}
          >
            <GameScreen />
          </ErrorBoundary>
        ) : <MainMenu key="menu" />}
      </AnimatePresence>
      <Toasts />
      <AudioDirector />
    </GameViewport>
  );
}
