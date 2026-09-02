import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import MainRoute from './Routes/MainRoute';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from './store/useThemeStore';
import { useProductStore } from './store/useProductStore';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Crash caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0b0e] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-2xl font-bold">
            ⚠️
          </div>
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-xs text-white/60 max-w-md bg-black/40 p-4 rounded-xl font-mono text-left overflow-auto max-h-40 border border-white/10">
            {this.state.error?.message || String(this.state.error)}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-6 py-2.5 rounded-full bg-[#c87d4a] hover:bg-[#d28a57] text-white font-bold text-xs shadow-lg transition-all"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const theme = useThemeStore((state) => state.theme);
  const { fetchProducts, fetchCategories } = useProductStore();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        {/* Toast Notification Container */}
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 3000,
            style: {
              background: '#121216',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              fontSize: '13px',
            },
          }} 
        />

        {/* Central Industry Router */}
        <MainRoute />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;