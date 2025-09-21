import React, { useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stage, Bounds } from "@react-three/drei";

// --- Components ---

// 3D Model Component - Now supports different shapes!
function ProductModel({ shape, color, scale, materialProps }) {
  const meshRef = useRef();
  useFrame((state, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.1;
  });

  const renderGeometry = () => {
    switch (shape) {
      case "sphere":
        return <sphereGeometry args={[1, 32, 32]} />;
      case "pyramid":
        return <coneGeometry args={[1, 1.5, 4]} />; // A cone with 4 sides is a pyramid
      case "cube":
      default:
        return <boxGeometry args={[1.5, 1.5, 1.5]} />;
    }
  };

  return (
    <mesh ref={meshRef} scale={scale}>
      {renderGeometry()}
      <meshStandardMaterial color={color} {...materialProps} />
    </mesh>
  );
}

// UI Components
const PanelHeader = () => (
  <header className="mb-8 flex-shrink-0">
    <h1 className="text-3xl font-bold text-sky-400 tracking-wider">
      Formi<span className="text-white">AI</span>
    </h1>
    <p className="text-slate-400 mt-1">AI-Powered Product Configurator</p>
  </header>
);

const AiSection = ({
  prompt,
  setPrompt,
  handleAiGenerate,
  isLoading,
  error,
}) => (
  <div className="space-y-4 p-4 bg-slate-700/50 rounded-lg border border-slate-700 flex-shrink-0">
    <label htmlFor="ai-prompt" className="text-sm font-medium text-slate-300">
      Describe your product
    </label>
    <textarea
      id="ai-prompt"
      rows="3"
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      placeholder="e.g., a shiny golden pyramid"
      className="w-full p-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white transition-all"
    />
    <button
      onClick={handleAiGenerate}
      disabled={isLoading}
      className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-bold transition-all duration-200 disabled:bg-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 3-1.9 1.9a5 5 0 0 0-7.07 7.07l.55.55a5 5 0 0 0 7.07 0l1.9-1.9m-5.02-5.02 7.07 7.07" />
        </svg>
      )}
      <span>Generate with AI</span>
    </button>
    {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
  </div>
);

const ManualControls = ({ config, handleChange, handleGenerate }) => (
  <div className="flex-grow space-y-6">
    <h2 className="text-lg font-semibold text-slate-400">Manual Adjustments</h2>
    <div className="space-y-2">
      <label htmlFor="shape" className="text-sm font-medium text-slate-300">
        Shape
      </label>
      <select
        id="shape"
        name="shape"
        value={config.shape}
        onChange={handleChange}
        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        <option value="cube">Cube</option>
        <option value="sphere">Sphere</option>
        <option value="pyramid">Pyramid</option>
      </select>
    </div>
    <div className="space-y-2">
      <label htmlFor="color" className="text-sm font-medium text-slate-300">
        Color
      </label>
      <div className="relative">
        <input
          type="color"
          id="color"
          name="color"
          value={config.color}
          onChange={handleChange}
          className="p-1 h-10 w-full block bg-slate-700 border border-slate-600 cursor-pointer rounded-lg appearance-none"
        />
        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
          {config.color}
        </span>
      </div>
    </div>
    <div className="space-y-2">
      <label htmlFor="scale" className="text-sm font-medium text-slate-300">
        Scale: {config.scale.toFixed(2)}x
      </label>
      <input
        type="range"
        id="scale"
        name="scale"
        min="0.5"
        max="2.0"
        step="0.05"
        value={config.scale}
        onChange={handleChange}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
      />
    </div>
    <div className="space-y-2">
      <label htmlFor="material" className="text-sm font-medium text-slate-300">
        Material
      </label>
      <select
        id="material"
        name="material"
        value={config.material}
        onChange={handleChange}
        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        <option value="plastic">Plastic</option>
        <option value="metal">Metal</option>
      </select>
    </div>
    <button
      onClick={handleGenerate}
      className="w-full mt-4 py-3 px-4 bg-sky-600 hover:bg-sky-700 rounded-lg text-white font-bold text-md transition-all duration-200 flex items-center justify-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 7h-9" />
        <path d="M14 17H5" />
        <circle cx="17" cy="17" r="3" />
        <circle cx="8" cy="7" r="3" />
      </svg>
      <span>Apply Manual Changes</span>
    </button>
  </div>
);

// Main App Component
export default function App() {
  const [config, setConfig] = useState({
    shape: "cube",
    color: "#4a90e2",
    scale: 1,
    material: "plastic",
  });
  const [displayConfig, setDisplayConfig] = useState(config);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: name === "scale" ? parseFloat(value) : value,
    }));
  };

  const handleGenerate = () => setDisplayConfig(config);

  const handleAiGenerate = async () => {
    if (!prompt) return setError("Please enter a description.");
    setIsLoading(true);
    setError(null);

    // ==================================================================
    // PASTE YOUR API KEY HERE
    // کلید API خود را اینجا قرار دهید
    // ==================================================================
    const apiKey = "AIzaSyDCnMQ6dGkSF53kuSbnBH9uxIH9enWVCIE"; // <--- IMPORTANT!

    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
      setError("API Key is missing. Please add it to App.jsx");
      setIsLoading(false);
      return;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    const systemPrompt = `You are an expert product design assistant. Analyze the user's request and return ONLY a valid JSON object with three keys: "shape" (as "cube", "sphere", or "pyramid"), "color" (as a hex code string like "#ff0000"), and "material" (as either "plastic" or "metal"). Do not include markdown, comments, or any other text.`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { responseMimeType: "application/json" },
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response
          .json()
          .catch(() => ({
            error: { message: "An unknown API error occurred." },
          }));
        throw new Error(
          errorBody?.error?.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        const aiConfig = JSON.parse(text);
        const newConfig = {
          ...config,
          shape: aiConfig.shape || config.shape,
          color: aiConfig.color || config.color,
          material: aiConfig.material || config.material,
        };
        setConfig(newConfig);
        setDisplayConfig(newConfig);
      } else {
        throw new Error("AI returned an empty or invalid response.");
      }
    } catch (err) {
      console.error("Full error object:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getMaterialProps = (material) =>
    material === "metal"
      ? { metalness: 0.9, roughness: 0.2 }
      : { metalness: 0.1, roughness: 0.7 };

  return (
    <main className="h-screen w-full bg-slate-900 text-white flex flex-col lg:flex-row font-sans overflow-hidden">
      {/* UI Panel: Added overflow-y-auto and flex structure for scrolling */}
      <div className="w-full lg:w-[400px] lg:flex-shrink-0 bg-slate-800/80 backdrop-blur-sm shadow-2xl flex flex-col h-full">
        <div className="p-6 md:p-8 flex flex-col overflow-y-auto">
          <PanelHeader />
          <AiSection
            prompt={prompt}
            setPrompt={setPrompt}
            handleAiGenerate={handleAiGenerate}
            isLoading={isLoading}
            error={error}
          />
          <div className="border-t border-slate-700 my-6 flex-shrink-0"></div>
          <ManualControls
            config={config}
            handleChange={handleChange}
            handleGenerate={handleGenerate}
          />
        </div>
      </div>

      {/* 3D Canvas: Added min-h-0 to ensure it fills remaining space correctly */}
      <div className="flex-grow w-full h-full min-h-0">
        <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
          <Suspense fallback={null}>
            <Stage environment="city" intensity={0.5} shadows={false}>
              <Bounds fit clip observe margin={1.2}>
                <ProductModel
                  shape={displayConfig.shape}
                  color={displayConfig.color}
                  scale={displayConfig.scale}
                  materialProps={getMaterialProps(displayConfig.material)}
                />
              </Bounds>
            </Stage>
          </Suspense>
          <OrbitControls
            makeDefault
            autoRotate
            autoRotateSpeed={0.75}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>
    </main>
  );
}
