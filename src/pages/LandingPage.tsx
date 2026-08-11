import { useEffect, useRef, useState } from 'react';
import { Cpu, Code2, Play, Bug, Brain, History, ArrowRight, Zap } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

export function LandingPage() {
  const setView = useUIStore((s) => s.setView);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white overflow-x-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <NextelLogo size={32} />
          <span className="text-lg font-semibold tracking-tight">NEXEL AI</span>
        </div>
        <div className="flex items-center gap-8 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#templates" className="hover:text-white transition-colors">Templates</a>
          <button
            onClick={() => setView('dashboard')}
            className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all"
          >
            Open Studio
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-8 pt-20 pb-16">
        <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Browser-based electronics design platform
          </div>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-6">
            Design. Code.
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">Simulate.</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mb-10 leading-relaxed">
            Build electronics projects in your browser. Connect real components, write code,
            simulate your ideas, and understand how everything works.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('dashboard')}
              className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:scale-105 transition-transform flex items-center gap-2"
            >
              Start Building <ArrowRight size={18} />
            </button>
            <button
              onClick={() => setView('dashboard')}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-semibold hover:bg-white/10 transition-all"
            >
              Explore Projects
            </button>
          </div>
        </div>

        {/* Animated circuit */}
        <div className={`mt-16 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <AnimatedCircuit />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-8 py-24 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">Everything in one workspace</h2>
        <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
          From idea to working circuit — design, code, simulate, and debug without leaving your browser.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard icon={Cpu} title="Build circuits" desc="Drag real components onto an infinite canvas. Wire them together with intelligent routing. Arduino, LEDs, sensors, motors, and more." />
          <FeatureCard icon={Code2} title="Write code" desc="Professional Monaco code editor with Arduino C++ syntax highlighting. Write setup() and loop() — your code drives the simulation." />
          <FeatureCard icon={Play} title="Simulate" desc="Run your circuit and watch LEDs illuminate, motors rotate, displays update. The simulator executes your real Arduino code." />
          <FeatureCard icon={Bug} title="Debug" desc="Intelligent debugging detects floating inputs, missing grounds, short circuits, and code errors — with clear explanations." />
          <FeatureCard icon={Brain} title="Learn with AI" desc="Ask NEXEL AI to add components, generate code, explain circuits, or find wiring problems. Every change is previewable and undoable." />
          <FeatureCard icon={History} title="Save every version" desc="Automatic version history lets you restore any point in your project's evolution. Never lose your work." />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 px-8 py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">From idea to simulation in minutes</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Step num="01" title="Drag components" desc="Pick from the library and place them on the canvas." />
            <Step num="02" title="Wire it up" desc="Click pins to connect components with wires." />
            <Step num="03" title="Write code" desc="Write Arduino code in the built-in editor." />
            <Step num="04" title="Run & simulate" desc="Press run and watch your circuit come alive." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-8 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <Zap size={40} className="mx-auto mb-6 text-blue-400" />
          <h2 className="text-4xl font-bold mb-4">Start building today</h2>
          <p className="text-gray-400 mb-8">No installation required. Open the studio and start designing circuits right away.</p>
          <button
            onClick={() => setView('dashboard')}
            className="px-8 py-4 bg-white text-black rounded-xl font-semibold hover:scale-105 transition-transform text-lg"
          >
            Launch NEXEL AI Studio
          </button>
        </div>
      </section>

      <footer className="relative z-10 px-8 py-8 border-t border-white/5 text-center text-sm text-gray-500">
        NEXEL AI — Electronics design, simulation, and learning platform
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/10 transition-all group">
      <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
        <Icon size={24} className="text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div>
      <div className="text-5xl font-bold text-white/10 mb-3">{num}</div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{desc}</p>
    </div>
  );
}

export function NextelLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="2" y="2" width="28" height="28" rx="7" fill="url(#nextel-grad)" />
      <path d="M10 22V10h2.5l7 8.5V10H22v12h-2.5l-7-8.5V22H10z" fill="white" />
      <circle cx="16" cy="16" r="13" stroke="url(#nextel-grad)" strokeWidth="0.5" opacity="0.3" />
      <defs>
        <linearGradient id="nextel-grad" x1="0" y1="0" x2="32" y2="32">
          <stop stopColor="#0a84ff" />
          <stop offset="1" stopColor="#30d158" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function AnimatedCircuit() {
  const [ledOn, setLedOn] = useState(false);
  const [currentPin, setCurrentPin] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLedOn((prev) => !prev);
      setCurrentPin((p) => (p + 1) % 14);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl bg-white/[0.02] border border-white/5 rounded-2xl p-8 overflow-hidden">
      <svg ref={svgRef} viewBox="0 0 800 300" className="w-full h-auto">
        {/* Grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="800" height="300" fill="url(#grid)" />

        {/* Arduino */}
        <g transform="translate(50, 80)">
          <rect width="200" height="140" rx="8" fill="#2d7a4a" stroke="#1a5c33" strokeWidth="1.5" />
          <rect x="8" y="8" width="184" height="124" rx="4" fill="#236b3d" />
          <rect x="160" y="40" width="50" height="30" rx="3" fill="#c0c0c0" />
          <rect x="80" y="50" width="50" height="50" rx="2" fill="#1a1a1a" />
          <text x="105" y="80" textAnchor="middle" fill="#666" style={{ fontSize: '8px' }}>ATmega328P</text>
          <text x="100" y="25" textAnchor="middle" fill="#fff" style={{ fontSize: '8px', fontWeight: 'bold' }}>ARDUINO UNO</text>
          {/* Digital pins */}
          {Array.from({ length: 14 }, (_, i) => (
            <circle key={i} cx={20 + i * 13} cy={0} r={3} fill={currentPin === i ? '#ffd60a' : '#48484a'} className="transition-all" />
          ))}
          {/* Pin 13 LED */}
          <circle cx={170} cy={120} r={4} fill={ledOn ? '#ffd60a' : '#3a3a3c'} className="transition-all" />
          {ledOn && <circle cx={170} cy={120} r={8} fill="#ffd60a" opacity={0.2} />}
        </g>

        {/* Wire from pin 13 */}
        <path
          d={`M ${50 + 20 + 12 * 13} 80 L ${50 + 20 + 12 * 13} 40 L 400 40 L 400 120`}
          fill="none"
          stroke={ledOn ? '#ffd60a' : '#48484a'}
          strokeWidth="2"
          className="transition-all"
        />

        {/* Resistor */}
        <g transform="translate(400, 100)">
          <rect width="80" height="20" rx="3" fill="#d4a574" stroke="#a07c4a" />
          <rect x="10" width="4" height="20" fill="#8b4513" />
          <rect x="20" width="4" height="20" fill="#1a1a1a" />
          <rect x="30" width="4" height="20" fill="#ff4500" />
          <rect x="40" width="4" height="20" fill="#ffd700" />
        </g>

        {/* Wire to LED */}
        <path d="M 480 110 L 560 110" fill="none" stroke={ledOn ? '#ffd60a' : '#48484a'} strokeWidth="2" className="transition-all" />

        {/* LED */}
        <g transform="translate(560, 80)">
          <circle cx="30" cy="30" r="20" fill={ledOn ? '#ff3b30' : '#2a2a2e'} stroke="#ff3b30" strokeWidth="2" opacity={ledOn ? 1 : 0.4} className="transition-all" />
          {ledOn && <circle cx="30" cy="30" r="28" fill="#ff3b30" opacity={0.15} />}
          <polygon points="20,22 26,30 20,38" fill="#86868b" />
        </g>

        {/* Wire to GND */}
        <path d="M 620 110 L 700 110" fill="none" stroke="#48484a" strokeWidth="2" />

        {/* GND */}
        <g transform="translate(690, 95)">
          <line x1="10" y1="0" x2="10" y2="15" stroke="#86868b" strokeWidth="2" />
          <line x1="0" y1="15" x2="20" y2="15" stroke="#86868b" strokeWidth="3" />
          <line x1="3" y1="20" x2="17" y2="20" stroke="#86868b" strokeWidth="2" />
          <line x1="6" y1="25" x2="14" y2="25" stroke="#86868b" strokeWidth="1.5" />
        </g>

        {/* Labels */}
        <text x="440" y="95" textAnchor="middle" fill="#86868b" style={{ fontSize: '10px' }}>220Ω</text>
        <text x="590" y="135" textAnchor="middle" fill="#86868b" style={{ fontSize: '10px' }}>LED</text>

        {/* Current flow animation */}
        {ledOn && (
          <circle r="3" fill="#ffd60a" opacity="0.8">
            <animateMotion dur="1s" repeatCount="indefinite" path="M 226 80 L 226 40 L 400 40 L 400 110 L 480 110 L 560 110" />
          </circle>
        )}
      </svg>
    </div>
  );
}
