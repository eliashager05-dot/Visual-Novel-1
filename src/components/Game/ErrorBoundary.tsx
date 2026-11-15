import { Component, type ReactNode } from 'react';

/** Keeps a rendering bug from blanking the whole game; offers a way back. */
export class ErrorBoundary extends Component<{ children: ReactNode; onReset: () => void }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[ui] render error', error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black text-center">
        <div className="font-serif text-[56px] text-[#f1ece2]">Something went wrong</div>
        <p className="max-w-[900px] text-[20px] text-white/50">{this.state.error.message}</p>
        <button
          className="rounded-full border border-white/20 px-10 py-3 text-[18px] uppercase tracking-[0.3em] text-white/80 hover:text-white"
          onClick={() => {
            this.setState({ error: null });
            this.props.onReset();
          }}
        >
          Return to title
        </button>
      </div>
    );
  }
}
