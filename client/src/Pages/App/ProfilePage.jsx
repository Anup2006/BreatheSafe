import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { MapPin, Bell, ShieldCheck, Mail, Edit, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stateInput, setStateInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [preferences, setPreferences] = useState({});

  useEffect(() => {
    if (user) {
      setStateInput(user.state || "");
      setCityInput(user.city || "");
      setPreferences(user.preferences || {});
    }
  }, [user]);

  const togglePreference = async (key) => {
    const updatedPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(updatedPrefs);
    try {
      await updateUserProfile({ preferences: updatedPrefs });
    } catch (err) {
      console.error(err);
    }
  };

  const searchRef1 = useRef(null);
  const searchRef2 = useRef(null);

  const handleUpdate = async () => {
    if (!stateInput.trim() || !cityInput.trim()) return;
    setLoading(true);
    try {
      await updateUserProfile({ state: stateInput, city: cityInput });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeAlerts = Object.values(preferences).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 md:p-10">
      <div className="max-w-[1200px] mx-auto space-y-6">
        
        {/* TOP HEADER */}
        <div className="flex flex-col gap-4">
          <div className="text-left">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your health profile and preferences.</p>
          </div>
          <div className="flex items-center gap-2 self-start bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <ShieldCheck className="text-[#2EC4B6]" size={16} />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Verified Account</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT: IDENTITY CARD */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 text-center lg:sticky lg:top-24">
              <div className="w-24 h-24 bg-gradient-to-tr from-[#2EC4B6] to-[#20A89E] rounded-full mx-auto flex items-center justify-center text-white text-4xl font-black mb-4 shadow-lg shadow-cyan-100">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <h2 className="text-xl font-bold text-slate-800 break-words">{user?.name}</h2>
              <p className="text-slate-400 text-xs mt-1 break-all flex items-center justify-center gap-2">
                <Mail size={12} /> {user?.email}
              </p>
              
              <div className="mt-6 pt-6 border-t border-slate-50 flex gap-3">
                <div className="flex-1 bg-slate-50 p-3 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Active Alerts</p>
                  <p className="text-lg font-bold text-[#2EC4B6]">{activeAlerts}</p>
                </div>
                <div className="flex-1 bg-slate-50 p-3 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Environment</p>
                  <p className="text-lg font-bold text-[#2EC4B6]">{user?.environment || "Urban"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: DETAILS */}
          <div className="w-full lg:w-2/3 space-y-6">
            <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-cyan-50 rounded-xl text-[#2EC4B6]"><MapPin size={20} /></div>
                <h3 className="font-bold text-slate-800">Primary Location</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase">State</p>
                    {/* FIXED: Icon is now always visible */}
                    <button onClick={() => searchRef1.current?.focus()} className="p-1 hover:bg-white rounded-md transition-colors">
                        <Edit size={14} className="text-[#2EC4B6]" />
                    </button>
                  </div>
                  <p className="font-bold text-slate-700">{user?.state || "Not Set"}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase">City</p>
                    {/* FIXED: Icon is now always visible */}
                    <button onClick={() => searchRef2.current?.focus()} className="p-1 hover:bg-white rounded-md transition-colors">
                        <Edit size={14} className="text-[#2EC4B6]" />
                    </button>
                  </div>
                  <p className="font-bold text-slate-700">{user?.city || "Not Set"}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      ref={searchRef1}
                      type="text"
                      value={stateInput}
                      onChange={(e) => setStateInput(e.target.value)}
                      placeholder="Enter State..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm outline-none focus:border-[#2EC4B6] transition-all"
                    />
                  </div>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      ref={searchRef2}
                      type="text"
                      value={cityInput}
                      onChange={(e) => setCityInput(e.target.value)}
                      placeholder="Enter City..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm outline-none focus:border-[#2EC4B6] transition-all"
                    />
                  </div>
                </div>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#2EC4B6] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#26b2a5] transition-colors disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Save Location Changes"}
                </button>
              </div>
            </section>

            <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Bell size={20} /></div>
                <h3 className="font-bold text-slate-800">Alert Preferences</h3>
              </div>
              
              <div className="space-y-4">
                {user?.preferences && Object.entries(user.preferences).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent transition-all hover:bg-white hover:border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${value ? "bg-[#e6f7f6] text-[#2EC4B6]" : "bg-slate-100 text-slate-400"}`}>
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                    </div>
                    <button
                      onClick={() => togglePreference(key)}
                      className={`w-12 h-6 rounded-full flex items-center px-1 transition-all duration-300 ${value ? "bg-[#2EC4B6]" : "bg-slate-300"}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${value ? "translate-x-6" : ""}`} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 