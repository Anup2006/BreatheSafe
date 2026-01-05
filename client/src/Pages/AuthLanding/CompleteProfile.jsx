import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, MapPin, Wind, TriangleAlert, 
  HeartPulse, ArrowRight, Check, AirVent, 
  User, Mail, Phone, ShieldCheck, ChevronLeft 
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function CompleteProfile() {
  // FIX: Destructure setUser so we can update the global state immediately
  const { user, setUser } = useAuth(); 
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    state: user?.state || "", 
    city: user?.city || "",
    alerts: {
      airQuality: true,
      pollutionSpikes: false,
      respiratoryRisk: false,
    },
    privacyAccepted: false,
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleToggleAlert = (key) => {
    setFormData(prev => ({
      ...prev,
      alerts: { ...prev.alerts, [key]: !prev.alerts[key] }
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      // Ensure clean URL construction
      const targetUrl = `${base.replace(/\/$/, "")}/api/users/update`;

      const payload = {
        name: formData.name,
        state: formData.state,
        city: formData.city,
        preferences: {
          airQuality: formData.alerts.airQuality,
          pollutionSpikes: formData.alerts.pollutionSpikes,
          respiratoryRisk: formData.alerts.respiratoryRisk,
        },
        isProfileComplete: true 
      };

      const response = await fetch(targetUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

     const data = await response.json();
if (response.ok && data.user) {
  setUser(data.user); // This updates Header.jsx and ProfilePage.jsx instantly
  toast.success("Profile Setup Complete!");
  navigate("/app/dashboard");
} else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Submit Error:", err);
      toast.error("Connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white overflow-hidden">
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-sky-200 to-blue-300 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <AirVent className="w-24 h-24 text-cyan-600 mx-auto mb-8" />
          <h1 className="text-slate-800 text-4xl font-bold mb-4">BreatheSafeAI</h1>
          <p className="text-slate-700 text-lg leading-relaxed">
            AI-powered respiratory safety and environmental health companion.
          </p>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 flex items-center justify-center p-4 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-[500px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-10 relative">
          {step > 1 && (
            <button onClick={prevStep} className="absolute left-6 top-10 text-slate-400 hover:text-slate-600 transition-colors">
              <ChevronLeft size={24} />
            </button>
          )}

          <header className="text-center mb-8">
            <h2 className="text-cyan-500 text-2xl font-bold mb-1">BreatheSafeAI</h2>
            <p className="text-slate-500 text-sm">Step {step} of 3</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="bg-cyan-500 h-full transition-all" />
            </div>
          </header>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-left">
                  <h3 className="text-slate-900 text-xl font-bold mb-1">Personal Info</h3>
                  <p className="text-slate-500 text-sm">Verify your contact details.</p>
                </div>
                <FormInput label="Full Name" icon={<User />} value={formData.name} onChange={v => handleChange("name", v)} />
                <FormInput label="Email" icon={<Mail />} value={formData.email} disabled />
                <FormInput label="Phone" icon={<Phone />} value={formData.phone} onChange={v => handleChange("phone", v)} />
                <StepButton onClick={nextStep} label="Continue to Location" />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-left">
                  <h3 className="text-slate-900 text-xl font-bold mb-1">Your Location</h3>
                  <p className="text-slate-500 text-sm">Used for local air quality sync.</p>
                </div>
                <FormInput label="State" icon={<Globe />} value={formData.state} onChange={v => handleChange("state", v)} />
                <FormInput label="City" icon={<MapPin />} value={formData.city} onChange={v => handleChange("city", v)} />
                <StepButton onClick={nextStep} label="Setup Alerts" />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-left">
                  <h3 className="text-slate-900 text-xl font-bold mb-1">Final Preferences</h3>
                  <p className="text-slate-500 text-sm">Choose your notifications.</p>
                </div>
                <div className="space-y-3">
                  <AlertCard icon={<Wind />} title="AQI Alerts" active={formData.alerts.airQuality} onToggle={() => handleToggleAlert("airQuality")} />
                  <AlertCard icon={<TriangleAlert />} title="Pollution Spikes" active={formData.alerts.pollutionSpikes} onToggle={() => handleToggleAlert("pollutionSpikes")} />
                  <AlertCard icon={<HeartPulse />} title="Health Risks" active={formData.alerts.respiratoryRisk} onToggle={() => handleToggleAlert("respiratoryRisk")} />
                </div>
                <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer border border-slate-100">
                  <input type="checkbox" className="mt-1 accent-cyan-500" checked={formData.privacyAccepted} onChange={e => handleChange("privacyAccepted", e.target.checked)} />
                  <span className="text-xs text-slate-500 text-left">I agree to the terms and privacy policy.</span>
                </label>
                <StepButton onClick={handleSubmit} label={loading ? "Saving..." : "Complete Setup"} disabled={!formData.privacyAccepted || loading} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, icon, value, onChange, disabled, checkmark }) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="text-xs font-bold text-slate-500 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
        <input value={value} disabled={disabled} onChange={e => onChange?.(e.target.value)} className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-cyan-400 transition-all text-sm font-medium text-slate-700" />
        {checkmark && <Check className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 w-4 h-4" />}
      </div>
    </div>
  );
}

function StepButton({ onClick, label, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-100 disabled:opacity-50">
      {label} <ArrowRight size={18} />
    </button>
  );
}

function AlertCard({ icon, title, active, onToggle }) {
  return (
    <div onClick={onToggle} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${active ? 'bg-cyan-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{icon}</div>
        <span className="text-sm font-bold text-slate-700">{title}</span>
      </div>
      <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-cyan-500' : 'bg-slate-300'}`}>
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'translate-x-6' : 'translate-x-1'}`} />
      </div>
    </div>
  );
}