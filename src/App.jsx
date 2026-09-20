import { LabProvider } from './context/LabContext';
import { LabCanvas } from './components/canvas/LabCanvas';
import { LabHUD } from './components/ui/LabHUD';
import './App.css';

function App() {
  return (
    <LabProvider>
      <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <LabCanvas />
        <LabHUD />
      </div>
    </LabProvider>
  );
}

export default App;

