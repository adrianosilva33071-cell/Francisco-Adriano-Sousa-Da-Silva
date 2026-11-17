import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {installSafeFetchProxy} from './utils/catalogData';

if (typeof window !== 'undefined') {
  installSafeFetchProxy(window as unknown as Record<string, unknown>);
}

createRoot(document.getElementById('root')!).render(<App />);

