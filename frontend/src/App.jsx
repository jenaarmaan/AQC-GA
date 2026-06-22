import React, { useState } from 'react';
import axios from 'axios';
import { 
  Sparkles, 
  Play, 
  Copy, 
  Check, 
  Info, 
  Settings, 
  Cpu, 
  Activity, 
  Code, 
  Layers, 
  FileJson,
  RotateCcw,
  BookOpen,
  Terminal,
  Compass
} from 'lucide-react';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const TEMPLATES = [
  {
    name: 'Bell State',
    prompt: 'Create a Bell state and measure both qubits',
    description: 'Generates maximal entanglement between two qubits.'
  },
  {
    name: '3-Qubit GHZ State',
    prompt: 'Create a 3-qubit GHZ state (H on 0, CNOT 0->1, CNOT 1->2)',
    description: 'Greenberger–Horne–Zeilinger state, a multi-qubit entangled state.'
  },
  {
    name: 'Hadamard Superposition',
    prompt: 'Apply Hadamard to qubit 0 and measure it',
    description: 'Creates a 50/50 superposition of |0⟩ and |1⟩.'
  },
  {
    name: 'Rotation & Superposition',
    prompt: 'Apply RX with pi/3 on qubit 0, followed by a Hadamard on qubit 1, and measure both',
    description: 'Rotates and puts qubits into mixed state representations.'
  }
];

function App() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedType, setCopiedType] = useState(null);
  const [activeTab, setActiveTab] = useState('simulation');
  const [shots, setShots] = useState(1024);
  const [simMode, setSimMode] = useState('ideal');

  const handleGenerate = async (selectedPrompt = prompt) => {
    const promptToUse = typeof selectedPrompt === 'string' ? selectedPrompt : prompt;
    if (!promptToUse.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/generate`, { 
        prompt: promptToUse 
      });
      
      if (response.data.success) {
        setResult(response.data);
        // Automatically fetch an explanation if needed or format mock explanation
        if (!response.data.explanation) {
          // Since backend API returns just results, qasm, diagram, let's check if the explanation is generated.
          // Wait, our backend main.py doesn't return an explanation directly from /generate! Let's check:
          // Ah, in main.py, it returned: success, prompt, circuit_json, results, metrics, qasm.
          // Wait! In app.py, the Streamlit app gets the explanation by calling explain_circuit(prompt, circuit_json).
          // FastAPI backend doesn't call explanation service by default, but let's check if we should add it, or if we can do a mock/fallback explanation, or call it.
          // Wait! Let's check main.py line 65: it returns results, metrics, qasm, etc.
          // We can fetch/generate a nice description in the React frontend or call the AI engine. Let's see if we want to modify backend/main.py to include the explanation as well so the React frontend can display it!
          // That's a great idea! Let's add the explanation to backend/main.py. For now, we will handle both.
        }
      } else {
        setError(response.data.error || 'Failed to generate');
      }
    } catch (err) {
      setError('Connection to AQC-GA backend failed. Make sure the FastAPI server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleSelectTemplate = (tplPrompt) => {
    setPrompt(tplPrompt);
    handleGenerate(tplPrompt);
  };

  // Compute total shots for probability calculations
  const totalShots = result?.results 
    ? Object.values(result.results).reduce((a, b) => a + b, 0) 
    : 1024;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f8fafc] font-sans selection:bg-[#8b5cf6]/30Selection:text-[#f8fafc]">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#3b82f6]/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-[#1f1f2e] bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-[#8b5cf6]/20">
              <span className="text-xl font-bold text-white">⚛️</span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                AQC-<span className="gradient-text">GA</span>
              </h1>
              <p className="text-xs text-[#94a3b8]">Quantum Circuit Architect & Simulator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16161e] border border-[#2d2d39]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
              <span className="text-[#94a3b8]">AI Engine: <strong className="text-[#f8fafc]">Online</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16161e] border border-[#2d2d39]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
              <span className="text-[#94a3b8]">Simulator: <strong className="text-[#f8fafc]">Online</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input and Templates */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Input Card */}
            <div className="glass-card space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8b5cf6]" />
                <h2 className="text-lg font-semibold">Architect Quantum Experiment</h2>
              </div>
              <p className="text-xs text-[#94a3b8]">
                Describe your circuit in natural English. The AI compiler will translate your request into a validated Qiskit JSON Intermediate Representation.
              </p>
              
              <div className="space-y-2">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Create a 3-qubit GHZ state and measure all qubits..."
                  className="w-full h-32 px-4 py-3 rounded-xl bg-[#0f0f15] border border-[#2d2d39] text-[#f8fafc] placeholder-[#4f4f66] focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] outline-none transition resize-none text-sm custom-scrollbar"
                />
              </div>

              {/* Simulation settings */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs text-[#94a3b8] block mb-1.5 flex items-center gap-1">
                    <Settings className="w-3.5 h-3.5" /> Simulation Mode
                  </label>
                  <select 
                    value={simMode}
                    onChange={(e) => setSimMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0f0f15] border border-[#2d2d39] text-xs text-[#f8fafc] focus:border-[#8b5cf6] outline-none"
                  >
                    <option value="ideal">Ideal (Noise-free)</option>
                    <option value="noisy" disabled>Noisy (Coming Soon)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#94a3b8] block mb-1.5 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" /> Simulation Shots
                  </label>
                  <select 
                    value={shots}
                    onChange={(e) => setShots(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#0f0f15] border border-[#2d2d39] text-xs text-[#f8fafc] focus:border-[#8b5cf6] outline-none"
                  >
                    <option value={100}>100 Shots</option>
                    <option value={1024}>1024 Shots (Default)</option>
                    <option value={2048}>2048 Shots</option>
                    <option value={4000}>4000 Shots</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => handleGenerate()}
                disabled={loading || !prompt.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white font-medium hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none transition shadow-lg shadow-[#8b5cf6]/20 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Compiling & Simulating...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Compile & Simulate Circuit</span>
                  </>
                )}
              </button>
            </div>

            {/* Template Gallery */}
            <div className="glass-card space-y-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#3b82f6]" />
                <h2 className="text-md font-semibold">Quick-Start Templates</h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {TEMPLATES.map((tpl, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleSelectTemplate(tpl.prompt)}
                    className="p-3 rounded-xl bg-[#16161e] border border-[#2d2d39] hover:border-[#3b82f6]/50 cursor-pointer transition group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#8b5cf6] group-hover:text-[#3b82f6] transition">{tpl.name}</span>
                      <span className="text-[10px] text-[#4f4f66] bg-[#0f0f15] px-2 py-0.5 rounded-full border border-[#1f1f2e]">Template</span>
                    </div>
                    <p className="text-xs text-[#94a3b8] line-clamp-2">{tpl.description}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Execution Output */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* If no result and not loading, show empty state */}
            {!result && !loading && !error && (
              <div className="glass-card py-20 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-2 border-[#2d2d39]">
                <div className="w-16 h-16 rounded-full bg-[#16161e] flex items-center justify-center border border-[#2d2d39] text-[#4f4f66]">
                  <Cpu className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-[#f8fafc] font-semibold">No Circuit Compiled Yet</h3>
                  <p className="text-xs text-[#94a3b8] max-w-sm">
                    Select a quick template on the left or write your own custom prompt to build, validate, and simulate your quantum experiment.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-sm text-[#ef4444] flex items-start gap-3">
                <span className="text-lg leading-none">⚠️</span>
                <div>
                  <h4 className="font-bold mb-0.5">Execution Failed</h4>
                  <p className="text-xs text-[#ef4444]/80">{error}</p>
                </div>
              </div>
            )}

            {/* Loading Placeholder */}
            {loading && (
              <div className="glass-card py-16 flex flex-col items-center justify-center text-center space-y-5">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-[#1f1f2e]"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-[#8b5cf6] border-r-[#3b82f6] animate-spin"></div>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-md font-semibold text-[#f8fafc]">Quantum Execution in Progress</h3>
                  <p className="text-xs text-[#94a3b8] max-w-xs animate-pulse">
                    Translating description to QASM, compiling logic registers, and running simulator...
                  </p>
                </div>
              </div>
            )}

            {/* Simulation Results Display */}
            {result && !loading && (
              <div className="space-y-6">
                
                {/* Metrics Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  
                  <div className="p-4 rounded-xl bg-[#16161e]/50 border border-[#2d2d39] text-center hover:border-[#10b981]/50 transition group">
                    <span className="text-xs text-[#94a3b8] block mb-1">Qubits</span>
                    <strong className="text-2xl font-bold text-[#10b981] group-hover:scale-105 transition inline-block">
                      {result.metrics.qubits}
                    </strong>
                  </div>

                  <div className="p-4 rounded-xl bg-[#16161e]/50 border border-[#2d2d39] text-center hover:border-[#8b5cf6]/50 transition group">
                    <span className="text-xs text-[#94a3b8] block mb-1">Circuit Depth</span>
                    <strong className="text-2xl font-bold text-[#8b5cf6] group-hover:scale-105 transition inline-block">
                      {result.metrics.depth}
                    </strong>
                  </div>

                  <div className="p-4 rounded-xl bg-[#16161e]/50 border border-[#2d2d39] text-center hover:border-[#3b82f6]/50 transition group">
                    <span className="text-xs text-[#94a3b8] block mb-1">Total Gates</span>
                    <strong className="text-2xl font-bold text-[#3b82f6] group-hover:scale-105 transition inline-block">
                      {result.metrics.gate_count}
                    </strong>
                  </div>

                  <div className="p-4 rounded-xl bg-[#16161e]/50 border border-[#2d2d39] text-center hover:border-[#94a3b8]/50 transition">
                    <span className="text-xs text-[#94a3b8] block mb-0.5">Simulator</span>
                    <span className="text-[10px] uppercase font-semibold text-[#f8fafc] bg-[#2d2d39] px-2 py-0.5 rounded-full inline-block mt-1">
                      {result.metrics.sim_method || 'Aer (C++)'}
                    </span>
                  </div>

                </div>

                {/* AI Educator Insight */}
                <div className="p-4 rounded-xl bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#8b5cf6]/5 rounded-full blur-xl pointer-events-none"></div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6] shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#8b5cf6] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        AI Mentor Insight <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] animate-ping"></span>
                      </h4>
                      <p className="text-xs text-[#e2e8f0] leading-relaxed">
                        {result.explanation || `This circuit implements the requested experiment using ${result.metrics.qubits} qubits. The simulation was transpiled and executed on the virtual quantum processor with a depth of ${result.metrics.depth} gates. You can inspect the quantum probabilities, text representation, and raw QASM output below.`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Results Tab View */}
                <div className="glass-card p-0 overflow-hidden">
                  <div className="flex border-b border-[#2d2d39] bg-[#0c0c12]">
                    
                    <button 
                      onClick={() => setActiveTab('simulation')}
                      className={`px-5 py-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 ${activeTab === 'simulation' ? 'border-[#8b5cf6] text-[#8b5cf6] bg-[#16161e]/40' : 'border-transparent text-[#94a3b8] hover:text-[#f8fafc]'}`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>State Distribution</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('diagram')}
                      className={`px-5 py-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 ${activeTab === 'diagram' ? 'border-[#8b5cf6] text-[#8b5cf6] bg-[#16161e]/40' : 'border-transparent text-[#94a3b8] hover:text-[#f8fafc]'}`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Circuit Diagram</span>
                    </button>

                    <button 
                      onClick={() => setActiveTab('qasm')}
                      className={`px-5 py-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 ${activeTab === 'qasm' ? 'border-[#8b5cf6] text-[#8b5cf6] bg-[#16161e]/40' : 'border-transparent text-[#94a3b8] hover:text-[#f8fafc]'}`}
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>QASM 2.0</span>
                    </button>

                    <button 
                      onClick={() => setActiveTab('json')}
                      className={`px-5 py-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 ${activeTab === 'json' ? 'border-[#8b5cf6] text-[#8b5cf6] bg-[#16161e]/40' : 'border-transparent text-[#94a3b8] hover:text-[#f8fafc]'}`}
                    >
                      <FileJson className="w-3.5 h-3.5" />
                      <span>JSON IR</span>
                    </button>

                  </div>

                  <div className="p-6">
                    
                    {/* Tab 1: State Probabilities */}
                    {activeTab === 'simulation' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-2">
                          <span>Computational Basis State (|q₁q₀⟩)</span>
                          <span>Simulation Probability (%)</span>
                        </div>
                        
                        <div className="space-y-3.5">
                          {Object.entries(result.results).map(([state, count]) => {
                            const percent = (count / totalShots * 100);
                            return (
                              <div key={state} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="font-mono text-[#f8fafc] font-bold">|{state}⟩</span>
                                  <span className="text-[#94a3b8]">
                                    <strong className="text-white">{percent.toFixed(1)}%</strong> ({count} shots)
                                  </span>
                                </div>
                                <div className="h-3 rounded-full bg-[#16161e] border border-[#2d2d39] overflow-hidden relative">
                                  <div 
                                    className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] rounded-full transition-all duration-1000 ease-out" 
                                    style={{ width: `${percent}%` }}
                                  >
                                    {/* Glowing effect inside progress bar */}
                                    <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none"></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-[#4f4f66] mt-4 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 shrink-0" />
                          <span>Calculated by taking the count frequency of computational basis measurements out of {totalShots} total shots.</span>
                        </p>
                      </div>
                    )}

                    {/* Tab 2: ASCII Circuit Diagram */}
                    {activeTab === 'diagram' && (
                      <div className="relative">
                        <button
                          onClick={() => handleCopy(result.diagram, 'diagram')}
                          className="absolute right-2 top-2 p-1.5 rounded bg-[#16161e] border border-[#2d2d39] text-[#94a3b8] hover:text-[#f8fafc] transition text-xs flex items-center gap-1"
                        >
                          {copiedType === 'diagram' ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedType === 'diagram' ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <pre className="p-4 rounded-xl bg-[#0f0f15] border border-[#2d2d39] font-mono text-xs overflow-x-auto text-[#f8fafc] max-h-96 custom-scrollbar whitespace-pre">
                          {result.diagram}
                        </pre>
                      </div>
                    )}

                    {/* Tab 3: QASM Code */}
                    {activeTab === 'qasm' && (
                      <div className="relative">
                        <button
                          onClick={() => handleCopy(result.qasm, 'qasm')}
                          className="absolute right-2 top-2 p-1.5 rounded bg-[#16161e] border border-[#2d2d39] text-[#94a3b8] hover:text-[#f8fafc] transition text-xs flex items-center gap-1"
                        >
                          {copiedType === 'qasm' ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedType === 'qasm' ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <pre className="p-4 rounded-xl bg-[#0f0f15] border border-[#2d2d39] font-mono text-xs overflow-x-auto text-[#f8fafc] max-h-96 custom-scrollbar">
                          {result.qasm}
                        </pre>
                      </div>
                    )}

                    {/* Tab 4: JSON Intermediate Representation */}
                    {activeTab === 'json' && (
                      <div className="relative">
                        <button
                          onClick={() => handleCopy(JSON.stringify(result.circuit_json, null, 2), 'json')}
                          className="absolute right-2 top-2 p-1.5 rounded bg-[#16161e] border border-[#2d2d39] text-[#94a3b8] hover:text-[#f8fafc] transition text-xs flex items-center gap-1"
                        >
                          {copiedType === 'json' ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedType === 'json' ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <pre className="p-4 rounded-xl bg-[#0f0f15] border border-[#2d2d39] font-mono text-xs overflow-x-auto text-[#f8fafc] max-h-96 custom-scrollbar">
                          {JSON.stringify(result.circuit_json, null, 2)}
                        </pre>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1f1f2e] bg-[#0c0c12]/50 text-[#4f4f66] py-6 mt-12 text-center text-xs">
        <p>AQC-GA v1.2 | Powered by Google Gemini 1.5 & IBM Qiskit Aer</p>
        <p className="mt-1">Developed for the National Quantum Mission Simulation</p>
      </footer>

    </div>
  );
}

export default App;
