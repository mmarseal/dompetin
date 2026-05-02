import { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';

const SplashScreen = () => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFading(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center">
      <div 
        className={`relative w-full max-w-md min-h-screen bg-[#189C63] shadow-xl overflow-hidden flex flex-col items-center justify-center text-center px-6 z-50
                    transition-opacity duration-1000 ease-out ${isFading ? 'opacity-0' : 'opacity-100'}`}
      >
        
        {/* Subtle background decorative shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-16 -mb-16 pointer-events-none" />
        
        {/* App Icon */}
        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-6 shadow-lg backdrop-blur-sm relative z-10">
          <Wallet className="w-12 h-12 text-white" strokeWidth={2.5} />
        </div>
        
        {/* App Branding */}
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 relative z-10">
          Dompetin
        </h1>
        <p className="text-emerald-100 font-medium text-sm relative z-10">
          Track Your Money. Control your life.
        </p>

      </div>
    </div>
  );
};

export default SplashScreen;
