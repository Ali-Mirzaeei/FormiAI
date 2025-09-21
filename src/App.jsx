import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Bounds } from '@react-three/drei';

// --- Components ---

// Window control icons for the header
const HeaderIcons = () => (
    <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
    </div>
);


// 3D Model Component
function ProductModel({ shape, color, scale, materialProps }) {
  const meshRef = useRef();
  useFrame((state, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.2;
  });

  const renderGeometry = () => {
    switch (shape) {
      case 'sphere': return <sphereGeometry args={[1.2, 32, 32]} />;
      case 'pyramid': return <coneGeometry args={[1.2, 1.8, 4]} />;
      case 'cube': default: return <boxGeometry args={[1.8, 1.8, 1.8]} />;
    }
  };
  return (<mesh ref={meshRef} scale={scale}>{renderGeometry()}<meshStandardMaterial color={color} {...materialProps} /></mesh>);
}


// Main App Component with the new UI
export default function App() {
  const [displayConfig, setDisplayConfig] = useState({ shape: 'pyramid', color: '#ffd700', scale: 1, material: 'metal' });
  const [prompt, setPrompt] = useState('A golden metallic pyramid');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAiGenerate = async () => {
    if (!prompt) return setError("Please enter a description.");
    setIsLoading(true);
    setError(null);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      setError("API Key is missing. Please create a .env.local file and add your key.");
      setIsLoading(false);
      return;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    const systemPrompt = `You are an expert 3D design assistant. Return ONLY a valid JSON object with "shape" ("cube", "sphere", "pyramid"), "color" (a hex code string), and "material" ("plastic" or "metal").`;
    const payload = { contents: [{ parts: [{ text: prompt }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig: { responseMimeType: "application/json" } };
    
    try {
      const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: { message: "An unknown API error occurred." } }));
        throw new Error(errorBody?.error?.message || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const aiConfig = JSON.parse(text);
        setDisplayConfig(prev => ({ ...prev, ...aiConfig }));
      } else { throw new Error("AI returned an empty or invalid response."); }
    } catch (err) { setError(err.message); } finally { setIsLoading(false); }
  };

  const getMaterialProps = (material) => (material === 'metal' ? { metalness: 0.9, roughness: 0.25 } : { metalness: 0.1, roughness: 0.7 });

  const mainStyle = {
    backgroundImage: `url(/backgrand.jpeg)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div style={mainStyle} className="min-h-screen w-full text-white flex items-center justify-center font-sans p-4 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full bg-black/60 z-0"></div>
      
      <main className="w-full max-w-2xl aspect-[16/10] bg-slate-900/70 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 flex flex-col z-10">
        
        <header className="px-5 py-3 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
            <HeaderIcons/>
            <h1 className="text-slate-200 text-base font-semibold tracking-wider font-mono">
              FormiAI <span className="font-light text-slate-400">- AI Configurator</span>
            </h1>
            <div className="w-12"></div>
        </header>

        <div className="flex-grow w-full h-full min-h-0 relative">
          <Canvas camera={{ position: [0, 2.5, 10], fov: 45 }}>
            <Suspense fallback={null}>
              <Stage environment="city" intensity={0.6} shadows={false}>
                 <Bounds fit clip observe margin={1.2}>
                    <ProductModel {...displayConfig} materialProps={getMaterialProps(displayConfig.material)} />
                 </Bounds>
              </Stage>
            </Suspense>
            <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} minDistance={5} maxDistance={20} />
          </Canvas>
        </div>

        <footer className="px-4 py-4 border-t border-slate-800 flex-shrink-0">
          <div className="flex gap-3">
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
              placeholder="Describe your product..."
              className="flex-grow bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
            />
            <button
              onClick={handleAiGenerate}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-lg text-white font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
          {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
        </footer>
      </main>
    </div>
  );
}

