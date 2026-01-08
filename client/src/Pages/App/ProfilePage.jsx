import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { MapPin, Bell, Globe, ShieldCheck, Mail, Phone,Edit } from "lucide-react";

export default function ProfilePage() {
  const { user,updateUserProfile } = useAuth();
  const [inputValue, setInputValue] = useState("Pune, India");
  const [updateLocation, setUpdateLocation] = useState("Pune, India");
  const [loading, setLoading] = useState(false);
  const [stateInput, setStateInput] = useState("");
  const [cityInput, setCityInput] = useState("");

  useEffect(() => {
    if (user) {
      setStateInput(user.state || "");
      setCityInput(user.city || "");
    }
  }, [user]);

  const searchRef1 = useRef(null);
  const searchRef2 = useRef(null);

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      handleUpdate();
    }
  };

  // Handle search
  const handleUpdate = async () => {
    if (!stateInput.trim() || !cityInput.trim()) return;

    setLoading(true);

    try {
      await updateUserProfile({
        state: stateInput,
        city: cityInput,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const activeAlerts = user?.preferences 
    ? Object.values(user.preferences).filter(v => v === true).length 
    : 0;

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
            <ShieldCheck className="text-cyan-500" size={16} />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Verified Account</span>
          </div>
        </div>

        {/* MAIN CONTAINER: Stacks on mobile, Side-by-side on desktop */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT: IDENTITY CARD */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-[2rem] p-6 shadow-md border border-slate-100 text-center lg:sticky lg:top-24">
              <div className="w-24 h-24 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full mx-auto flex items-center justify-center text-white text-4xl font-black mb-4">
                {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="User" onError={() => setImgError(true)} className="rounded-full w-full h-full object-cover" />
                  ) : user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <h2 className="text-xl font-bold text-slate-800 break-words">{user?.name}</h2>
              <p className="text-slate-400 text-xs mt-1 break-all flex items-center justify-center gap-2">
                <Mail size={12} /> {user?.email}
              </p>
              
              <div className="mt-6 pt-6 border-t border-slate-50 flex gap-3">
                <div className="flex-1 bg-slate-50 p-3 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Alerts</p>
                  <p className="text-lg font-bold text-blue-600">{activeAlerts}</p>
                </div>
                <div className="flex-1 bg-slate-50 p-3 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Zone</p>
                  <p className="text-lg font-bold text-cyan-600">{user?.environment || "Urban"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: DETAILS (Stacks below on mobile) */}
          <div className="w-full lg:w-2/3 space-y-6">
            
            {/* LOCATION CARD */}
            <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-cyan-50 rounded-xl text-cyan-600"><MapPin size={20} /></div>
                <h3 className="font-bold text-slate-800">Primary Location</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="flex flex-row gap-3 text-[9px] font-black text-slate-400 uppercase mb-1">State <Edit onClick={() => searchRef1.current?.focus()}/></p>
                  <p className="font-bold text-slate-700">{user?.state || "Not Set"} </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="flex flex-row gap-3 text-[9px] font-black text-slate-400 uppercase mb-1">City <Edit onClick={() => searchRef2.current?.focus()}/></p>
                  <p className="font-bold text-slate-700">{user?.city || "Not Set"} </p>
                </div>
              </div>
              <div style={{
                display: "flex",
                gap: "0.75rem",
                marginTop: "1rem",
                flexWrap: "wrap"
              }}>
                <div style={{ position: "relative", flex: "1", minWidth: "250px" }}>
                  <MapPin 
                    size={16} 
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#6B7280"
                    }}
                  />
                  <input
                    ref={searchRef1}
                    type="text"
                    value={stateInput}
                    onChange={(e) => setStateInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Change location..."
                    style={{
                      width: "100%",
                      padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                      borderRadius: "8px",
                      border: "2px solid #E5E7EB",
                      fontSize: "1rem",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                  {loading && (
                    <div style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)"
                    }}>
                      <div style={{
                        border: "2px solid #f3f3f3",
                        borderTop: "2px solid #2EC4B6",
                        borderRadius: "50%",
                        width: "16px",
                        height: "16px",
                        animation: "spin 1s linear infinite"
                      }}></div>
                    </div>
                  )}
                </div>
                <div style={{ position: "relative", flex: "1", minWidth: "250px" }}>
                  <MapPin 
                    size={16} 
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#6B7280"
                    }}
                  />
                  <input
                  ref={searchRef2}
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Change location..."
                    style={{
                      width: "100%",
                      padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                      borderRadius: "8px",
                      border: "2px solid #E5E7EB",
                      fontSize: "1rem",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                  {loading && (
                    <div style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)"
                    }}>
                      <div style={{
                        border: "2px solid #f3f3f3",
                        borderTop: "2px solid #2EC4B6",
                        borderRadius: "50%",
                        width: "16px",
                        height: "16px",
                        animation: "spin 1s linear infinite"
                      }}></div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    background: loading ? "#9CA3AF" : "linear-gradient(135deg, #2EC4B6 0%, #20A89E 100%)",
                    color: "white",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "1rem",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  Update
                </button>
              </div>
            </section>

            {/* PREFERENCES CARD */}
            <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Bell size={20} /></div>
                <h3 className="font-bold text-slate-800">Preferences</h3>
              </div>
              
              <div className="space-y-3">
                {user?.preferences ? Object.entries(user.preferences).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent">
                    <span className="text-xs font-bold text-slate-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${value ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                      {value ? "Active" : "Off"}
                    </div>
                  </div>
                )) : (
                   <p className="text-slate-400 text-xs">No settings found.</p>
                )}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}