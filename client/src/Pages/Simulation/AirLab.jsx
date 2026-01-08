import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Wind, Home, MapPin, Activity, 
  Search, CloudRain, Zap, Shield, 
  Fan, Flame, Thermometer, AlertTriangle, 
  Users, Maximize, RefreshCw, Settings, BarChart2
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
/* --------------------------------------------------------------------------
   1. PHYSICS ENGINE
   -------------------------------------------------------------------------- */
const calculatePhysics = (controls, cityData, userInteracted) => {
  // --- PRE-CALCULATION: ROOM GEOMETRY ---
  // We assume roomSize is area (e.g., m² or large ft²). 
  // Multiplied by 10 for ceiling height to get Volume.
  // Clamp minimum volume to 200 to avoid divide-by-zero errors.
  const roomVolume = Math.max(controls.roomSize * 10, 200); 

  let outdoorBase = 0;
  let trafficFactor = 1.0;
  let windFactor = 1.0;

  // --- A. OUTDOOR PHYSICS ---
  if (cityData && typeof cityData.pm25 === 'number') {
    // === LIVE MODE ===
    outdoorBase = cityData.pm25;

    // Traffic: 0% = 0.5x (Empty), 50% = 1.0x (Normal), 100% = 2.0x (Jam)
    trafficFactor = 0.5 + (controls.traffic / 4); 

    // Wind: Higher wind = Cleaner air. 
    // Decay factor: 0 wind = 1.0, 50 wind = ~0.3
    windFactor = Math.max(0.2, Math.exp(-controls.wind * 0.02));

  } else {
    // === SIMULATION MODE ===
    // Base: 10 + Traffic. 
    outdoorBase = 10 + (controls.traffic * 3.0);
    
    // Wind dilution
    windFactor = Math.max(0.2, 1 - (controls.wind * 0.03));
    trafficFactor = 1.0; 
  }

  // Rain Effect: Washout removes ~65% of particles
  const rainFactor = controls.raining ? 0.35 : 1.0;

  // Final Outdoor Concentration
  const effectiveOutdoor = outdoorBase * trafficFactor * windFactor * rainFactor;


  // --- B. VENTILATION & AIRFLOW (Crucial Fix) ---
  
  // 1. Passive Ventilation (Leaks/HVAC)
  // Logic: Bigger rooms have more surface area/vents, so they "breathe" more naturally.
  // We assume 0.5 Air Changes per Hour (ACH) for a sealed room.
  const passiveFlowRate = roomVolume * 0.5; 

  // 2. Active Ventilation (Windows)
  // Logic: A window provides a fixed volume of air (Flow), not a fixed ACH.
  // Slider 0-100 represents window opening area.
  // We add a 'Wind Bonus': Windows work much better when it's windy outside.
  const windBonus = 1 + (controls.wind / 20); // Wind makes windows 2x-3x more effective
  const windowFlowRate = (controls.window * 150) * windBonus; 
  
  // Total Airflow (Volume units per hour)
  // This dictates how fast pollution/CO2 is removed.
  const totalFlowRate = passiveFlowRate + windowFlowRate;

  // Calculate ACH (Air Changes Per Hour) for the PM2.5 formulas
  // Small Room + Open Window = High ACH. Big Room + Open Window = Low ACH.
  const totalACH = totalFlowRate / roomVolume;


  // --- C. INDOOR PM2.5 MASS BALANCE ---
  
  // 1. Sources (Total Mass Generated)
  const cookingSource = controls.cooking ? 50000 : 0;      
  const incenseSource = controls.incense ? 100000 : 0;      
  const mosquitoSource = controls.mosquito ? 100000 : 0;   
  const acsource = controls.ac ? 60000 : 0;      
  const totalSourceRate = cookingSource + incenseSource + mosquitoSource + acsource;

  
  // 2. Removal Factors
  const penetration = 0.85; // 85% of outdoor stuff gets in
  const deposition = 0.5;   // Dust settling (0.5 ACH equivalent)
  
  // Purifier: Rate = CADR / Volume.
  // Standard Purifier ~300 m3/h. 
  const purifierRate = controls.purifier ? (2700 / roomVolume) : 0;

  // 3. Concentration Calculation
  // Steady State = (Infiltration_Input + Internal_Input) / (Ventilation + Deposition + Filtration)
  // Input from outdoor = Penetration * ACH * OutdoorConc
  // Input from indoor = SourceRate / Volume
  const infiltrationConc = penetration * totalACH * effectiveOutdoor;
  const sourceConc = totalSourceRate / roomVolume;
  
  const removalRate = totalACH + deposition + purifierRate;
  
  const indoorLevel = (infiltrationConc + sourceConc) / Math.max(removalRate, 0.1);


  // --- D. CO2 PHYSICS (The Fix) ---
  const outdoorCO2 = 420;
  
  // 1. CO2 Generation
  // A person generates ~20-30 liters of CO2/hr. 
  // We multiply by a scalar to map it to our "Game Units" for PPM.
  const co2PerPerson = 25000; 
  const totalCO2Gen = controls.people * co2PerPerson;

  // 2. CO2 Concentration Logic
  // Formula: Outdoor + (Generation / Total_Airflow)
  // Why this works:
  // - Small Room (Low Passive Flow) + Closed Window = Low Total Flow -> High CO2.
  // - Big Room (High Passive Flow) + Closed Window = High Total Flow -> Moderate CO2.
  // - Any Room + Open Window = Huge Total Flow -> Low CO2.
  const steadyStateCO2 = outdoorCO2 + 2*(totalCO2Gen / (.85* totalFlowRate  ))
  // --- E. EXPOSURE ---
  // Mask reduces final exposure by 95%
  const personalExposure = controls.mask ? indoorLevel * 0.18 : indoorLevel;

  return {
    outdoor: Math.round(effectiveOutdoor),
    indoor: Math.round(indoorLevel),
    co2: Math.round(steadyStateCO2),
    exposure: Math.round(personalExposure),
    cigarettes: (personalExposure / 22).toFixed(1)
  };
};
/* --------------------------------------------------------------------------
   2. VISUAL ENGINE
   -------------------------------------------------------------------------- */
const ParticleCanvas = ({ aqi, controls }) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const requestRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const visualDensity = aqi * (200 / Math.max(100, controls.roomSize));
    const count = Math.min(visualDensity * 2.0, 800);
    
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5) * (0.5 + aqi/150),
      vy: (Math.random() - 0.5) * (0.5 + aqi/150),
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
      color: aqi > 150 ? '239, 68, 68' : (aqi > 50 ? '245, 158, 11' : '46, 196, 182')
    }));

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (controls.window > 0) {
        ctx.fillStyle = `rgba(135, 206, 250, ${controls.window * 0.3})`;
        ctx.fillRect(rect.width - 60, 40, 60, rect.height - 80);
      }

      if (controls.ac) {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(20, 20, 100, 30);
        ctx.fillStyle = '#2EC4B6';
        ctx.fillRect(25, 45, 90, 2); 
      }

      if (controls.purifier) {
        ctx.fillStyle = '#374151';
        ctx.fillRect(rect.width/2 - 20, rect.height - 50, 40, 50);
        ctx.strokeStyle = 'rgba(46, 196, 182, 0.3)';
        ctx.beginPath();
        ctx.arc(rect.width/2, rect.height - 50, 100, Math.PI, 0);
        ctx.stroke();
      }

      particles.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (controls.ac) {
           p.vx += (Math.random() - 0.5) * 0.1;
           p.vy += (Math.random() - 0.5) * 0.1;
        }

        if (controls.purifier) {
          const dx = rect.width/2 - p.x;
          const dy = (rect.height - 25) - p.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 100) {
             p.x += dx * 0.08;
             p.y += dy * 0.08;
             if (dist < 10) p.alpha = 0;
          }
        }

        if (p.x < 0) p.x = rect.width;
        if (p.x > rect.width) p.x = 0;
        if (p.y < 0) p.y = rect.height;
        if (p.y > rect.height) p.y = 0;

        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fill();
      });

      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [aqi, controls]); 

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', borderRadius: '12px' }} />;
};
/* --------------------------------------------------------------------------
   3. MAIN DASHBOARD COMPONENT
   -------------------------------------------------------------------------- */
export default function AirQualityLab() {
  const [inputValue, setInputValue] = useState('Pune, India');
  const [cityData, setCityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  
  const [userInteracted, setUserInteracted] = useState(false);
  
  const [controls, setControls] = useState({
    traffic: 50,     
    wind: 5,        
    raining: false,
    roomSize: 200,
    window: 0.2,
    people: 2,       
    cooking: false,
    incense: false,
    mosquito: false,
    ac: false,
    purifier: false,
    mask: false
  });

  const updateControl = (key, value) => {
    setControls(prev => ({ ...prev, [key]: value }));
    setUserInteracted(true);
  };

  const sim = useMemo(() => calculatePhysics(controls, cityData, userInteracted), [controls, cityData, userInteracted]);

  useEffect(() => {
    setHistory(prev => {
      const next = [...prev, { pm: sim.indoor, co2: sim.co2 }];
      if (next.length > 40) next.shift();
      return next;
    });
  }, [sim.indoor, sim.co2]);

  const getStatus = (aqi) => {
    if (aqi <= 50) return { label: 'GOOD', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', hex: '#10B981' };
    if (aqi <= 100) return { label: 'MODERATE', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', hex: '#F59E0B' };
    if (aqi <= 200) return { label: 'UNHEALTHY', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', hex: '#EA580C' };
    return { label: 'HAZARDOUS', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', hex: '#DC2626' };
  };

  const getCO2Status = (co2) => {
    if(controls.window < 0.1) return { label: 'STAGNANT', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
    if (co2 < 800) return { label: 'FRESH', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (co2 < 1200) return { label: 'STALE', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    return { label: 'STUFFY', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const status = getStatus(sim.indoor);
  const co2Status = getCO2Status(sim.co2);

  const handleSearch = async () => {
    if (!inputValue.trim()) return;
    setLoading(true);
    
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(inputValue)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();
      
      if (!geoData.results || geoData.results.length === 0) throw new Error("City not found");
      
      const { latitude, longitude, name, country } = geoData.results[0];
      const displayName = country ? `${name}, ${country}` : name;

      const [airRes, weatherRes] = await Promise.all([
        fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm2_5,us_aqi`),
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=wind_speed_10m`)
      ]);

      if (!airRes.ok || !weatherRes.ok) throw new Error("Failed to fetch environment data");

      const airData = await airRes.json();
      const weatherData = await weatherRes.json();

      setCityData({
        pm25: airData.current.pm2_5,
        aqi: airData.current.us_aqi || Math.round(airData.current.pm2_5 * 3),
        city: displayName
      });

      const windSpeed = weatherData.current.wind_speed_10m;
      setControls(prev => ({ 
        ...prev, 
        wind: windSpeed,
        traffic: 50, 
        raining: false,
        window: 0.2 
      }));
      
      setUserInteracted(false);
      setInputValue(displayName);
      toast.success(`Data loaded for ${displayName}`, { icon: "🌍" });

    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load city data");
      setCityData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb', fontFamily: "'Segoe UI', Roboto, sans-serif", color: '#111827', overflow: 'hidden' }}>
      
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {/* HEADER BAR */}
      <div style={{ padding: '1rem 2rem', backgroundColor: 'white', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity style={{ color: '#2EC4B6', width: '28px', height: '28px' }} /> 
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827', margin: 0 }}>AirLab</h1>
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6B7280', display: 'none', md: 'block' }}>Real-time Physics Simulation</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: '380px 1fr', height: 'calc(100vh - 70px)', overflow: 'hidden' }}>
        
        <style>{`
          @media (min-width: 1024px) {
            div[style*="display: grid"] { grid-template-columns: 380px 1fr !important; }
          }
        `}</style>

        {/* --- LEFT SIDE: CONTROLS (SCROLLABLE) --- */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', backgroundColor: 'white', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* SEARCH */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <MapPin style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', width: '16px' }} />
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Search city..."
                style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.2rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
              />
            </div>
            <button onClick={handleSearch} disabled={loading} style={{ padding: '0.6rem', borderRadius: '8px', background: '#2EC4B6', color: 'white', border: 'none', cursor: 'pointer' }}>
              {loading ? <RefreshCw className="animate-spin" size={18}/> : <Search size={18}/>}
            </button>
          </div>

          {/* ROOM CONFIG */}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#9CA3AF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase' }}>
              <Settings size={14} /> Environment Controls
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <ControlSlider 
                icon={<Maximize size={14}/>} label="Room Size" 
                value={`${controls.roomSize} sq ft`} 
                min={100} max={1000} step={50} 
                curr={controls.roomSize} onChange={v => updateControl('roomSize', v)}
                color="#2EC4B6"
              />

              <ControlSlider 
                icon={<Users size={14}/>} label="Occupancy" 
                value={`${controls.people} People`} 
                min={0} max={10} step={1} 
                curr={controls.people} onChange={v => updateControl('people', v)}
                color="#2EC4B6"
              />

              <ControlSlider 
                icon={<Home size={14}/>} label="Window Open" 
                value={`${(controls.window * 100).toFixed(0)}%`} 
                min={0} max={1} step={0.1} 
                curr={controls.window} onChange={v => updateControl('window', v)}
                color={controls.window > 0 ? '#10B981' : '#6B7280'}
              />

              <ControlSlider 
                icon={<Wind size={14}/>} label="Wind Speed" 
                value={`${controls.wind} km/h`} 
                min={0} max={40} step={1} 
                curr={controls.wind} onChange={v => updateControl('wind', v)}
                color="#6B7280"
                badge={cityData ? "LIVE" : null}
              />

              <ControlSlider 
                icon={<Activity size={14}/>} label="Traffic Density" 
                value={`${controls.traffic}%`} 
                min={0} max={100} step={5} 
                curr={controls.traffic} onChange={v => updateControl('traffic', v)}
                color="#F59E0B"
                sublabel={cityData ? "Modifies Live Data" : null}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
                 <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CloudRain size={16} /> Raining?
                 </span>
                 <button 
                   onClick={() => updateControl('raining', !controls.raining)}
                   style={{ 
                     width: '40px', height: '24px', borderRadius: '12px', 
                     backgroundColor: controls.raining ? '#06B6D4' : '#E5E7EB',
                     position: 'relative', border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                   }}
                 >
                   <div style={{ 
                     width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'white',
                     position: 'absolute', top: '3px', left: controls.raining ? '19px' : '3px', transition: 'all 0.2s'
                   }}/>
                 </button>
              </div>

            </div>
          </div>

          {/* TOGGLES */}
        <div>
            <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Sources & Filters</h3>
            <div className="grid grid-cols-3 gap-3">
              <ToggleButton active={controls.cooking} onClick={() => updateControl('cooking', !controls.cooking)} icon={<Flame className="w-5 h-5"/>} label="Cooking" color="text-red-500" bg="bg-red-50" border="border-red-500"/>
              <ToggleButton active={controls.incense} onClick={() => updateControl('incense', !controls.incense)} icon={<span>🕯️</span>} label="Incense" color="text-purple-500" bg="bg-purple-50" border="border-purple-500"/>
              <ToggleButton active={controls.mosquito} onClick={() => updateControl('mosquito', !controls.mosquito)} icon={<span>🌀</span>} label="Coil" color="text-amber-500" bg="bg-amber-50" border="border-amber-500"/>
              <ToggleButton active={controls.ac} onClick={() => updateControl('ac', !controls.ac)} icon={<Zap className="w-5 h-5"/>} label="AC" color="text-cyan-500" bg="bg-cyan-50" border="border-cyan-500"/>
              <ToggleButton active={controls.purifier} onClick={() => updateControl('purifier', !controls.purifier)} icon={<Fan className="w-5 h-5"/>} label="Purifier" color="text-emerald-500" bg="bg-emerald-50" border="border-emerald-500"/>
              <ToggleButton active={controls.mask} onClick={() => updateControl('mask', !controls.mask)} icon={<Shield className="w-5 h-5"/>} label="N95" color="text-teal-500" bg="bg-teal-50" border="border-teal-500"/>
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: VISUALIZATION (SCROLLABLE ON MOBILE, FIXED ON DESKTOP) --- */}
        <div style={{ padding: '1.5rem', backgroundColor: '#F3F4F6', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* TOP STATS ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            
            {/* INDOOR AQI */}
            <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#9CA3AF', marginBottom: '0.25rem' }}>INDOOR AQI</div>
               <div style={{ fontSize: '2.5rem', fontWeight: '800', color: status.hex }}>{sim.indoor}</div>
               <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', backgroundColor: `${status.hex}20`, color: status.hex }}>{status.label}</span>
            </div>

            {/* CO2 */}
            <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderBottom: `4px solid ${co2Status.color.replace('text-', '').replace('-600', '')}` }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                 <Users size={16} className="text-gray-400"/> 
                 <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6B7280' }}>CO2 LEVELS</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                 <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>{sim.co2}</span>
                 <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>ppm</span>
               </div>
               <div style={{ fontSize: '0.75rem', fontWeight: '600', marginTop: '4px', className: co2Status.color }}>{co2Status.label}</div>
            </div>

            {/* OUTDOOR */}
            <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                 <Wind size={16} className="text-gray-400"/> 
                 <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6B7280' }}>OUTDOOR PM2.5</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                 <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>{sim.outdoor}</span>
                 <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>µg/m³</span>
               </div>
               {cityData && <div style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: '700', marginTop: '4px' }}>● LIVE DATA</div>}
            </div>

            {/* EXPOSURE */}
            <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                 <Shield size={16} className="text-gray-400"/> 
                 <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6B7280' }}>EXPOSURE</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                 <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>{sim.exposure}</span>
                 <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>µg/m³</span>
               </div>
               <div style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: '4px' }}>≈ {sim.cigarettes} Cigs</div>
            </div>

          </div>

          {/* MAIN VISUALIZATION AREA */}
          <div className="flex-1 min-h-[400px] bg-slate-800 rounded-2xl relative overflow-hidden shadow-lg ring-1 ring-black/5">
             <div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap">
                <Badge text={cityData ? "LIVE + SIM" : "SIMULATION"} color={cityData ? "text-emerald-400" : "text-amber-400"} bg={cityData ? "bg-emerald-400/20" : "bg-amber-400/20"} />
                {controls.window > 0 && <Badge text="VENTILATION ON" color="text-sky-300" bg="bg-sky-400/20" />}
             </div>
             
             <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col gap-2 items-start">
                {sim.co2 > 1200 && <AlertBox icon={<AlertTriangle className="w-4 h-4"/>} text="CO2 High! Open a window." color="bg-amber-500/90" />}
                {sim.indoor > 150 && <AlertBox icon={<AlertTriangle className="w-4 h-4"/>} text="Pollution High! Use Purifier." color="bg-red-500/90" />}
             </div>

             <ParticleCanvas aqi={sim.indoor} controls={controls} />
          </div>

          {/* GRAPH AREA */}
          <div className="h-48 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-2">
                <div className="text-xs font-bold text-gray-600 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4"/> LIVE TREND
                </div>
                <div className="flex gap-4 text-[10px] font-bold">
                  <span className="text-teal-500 flex items-center gap-1">● PM2.5</span>
                  <span className="text-emerald-500 flex items-center gap-1">● CO2</span>
                </div>
             </div>
             <div className="w-full h-[10vh]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                      itemStyle={{ padding: 0 }}
                    />
                    <Line type="monotone" dataKey="pm" stroke="#14b8a6" strokeWidth={3} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="4 4" isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; borderRadius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
      `}</style>
    </div>
  );
}

/* --- REUSABLE UI COMPONENTS --- */
 


const ControlSlider = ({ icon, label, value, min, max, step, curr, onChange, color, accent, badge, sublabel }) => (
  <div>
    <div className="flex justify-between mb-1.5 items-center">
      <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
        {icon} {label}
        {badge && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">{badge}</span>}
      </span>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
    <input 
      type="range" min={min} max={max} step={step} value={curr} onChange={e => onChange(+e.target.value)}
      className={`w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer ${accent}`}
    />
    {sublabel && <div className="text-[10px] text-gray-400 mt-1 font-medium">{sublabel}</div>}
  </div>
);

const ToggleButton = ({ active, onClick, icon, label, color, bg, border }) => (
  <button 
    onClick={onClick} 
    className={`
      p-3 rounded-xl border flex flex-col items-center gap-1 transition-all duration-200
      ${active ? `${bg} ${border} ${color}` : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}
    `}
  >
    <div className={!active ? 'opacity-50 grayscale' : ''}>{icon}</div>
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

const Badge = ({ text, color, bg }) => (
  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold backdrop-blur-sm ${bg} ${color}`}>
    {text}
  </span>
);

const AlertBox = ({ icon, text, color }) => (
  <div className={`px-3 py-2 rounded-lg flex items-center gap-2 text-white text-xs font-bold shadow-md backdrop-blur-sm ${color}`}>
    {icon} {text}
  </div>

);
