import React from 'react';
import '@/App.css';
import { ParticleCanvas } from '@/components/ParticleCanvas';

function App() {
  return (
    <div className="App min-h-screen relative grain" style={{ background: 'hsl(var(--background))' }}>
      {/* Background Gradient Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 20% 30%, hsl(var(--primary) / 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, hsl(var(--secondary) / 0.08) 0%, transparent 50%)'
        }}
      />
      
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              Particle Playground
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-mono">
              Interactive Physics Simulation
            </p>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="px-4 py-2 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
              <span className="text-xs text-muted-foreground font-mono">FPS: </span>
              <span className="text-sm font-semibold" style={{ color: 'hsl(var(--accent))' }}>60</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Particle Canvas */}
      <ParticleCanvas />
      
      {/* Footer Info */}
      <div className="absolute bottom-6 left-6 z-10 text-xs text-muted-foreground font-mono bg-card/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-border/30">
        Built with HTML5 Canvas & React
      </div>
    </div>
  );
}

export default App;