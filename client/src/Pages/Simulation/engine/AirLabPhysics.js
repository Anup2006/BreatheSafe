// src/engine/AirLabPhysics.js

/**
 * Step 1: Calculate "Effective" Outdoor AQI
 * - Traffic multiplies pollution.
 * - Wind reduces it (dispersion).
 */
export const calcOutdoorEffective = (baseAQI, traffic, wind) => {
  // Traffic is a multiplier (e.g., 1.5x normal pollution)
  let localPollution = baseAQI * traffic;
  
  // Wind mitigation: 10 km/h wind reduces pollution by ~20%
  // We cap mitigation at 50% (0.5) so it never hits zero.
  const dispersion = Math.min(wind * 0.02, 0.5); 
  
  return Math.round(localPollution * (1 - dispersion));
};

/**
 * Step 2: Calculate Indoor AQI using Mass Balance Equation
 * - Infiltration: How much outdoor air leaks in.
 * - Source: Cooking/Smoking inside.
 * - Removal: Purifiers/Ventilation.
 */
export const calcIndoorAQI = (outdoorConc, state) => {
  // A. Determine ACH (Air Changes per Hour)
  // Base leakage is always present (cracks under doors)
  const baseLeakage = 0.5; 
  const windowACH = state.windowOpen ? 4.0 : 0.0; // Open windows = lots of air
  const purifierACH = state.purifierOn ? 3.5 : 0.0; // HEPA filter power
  
  // Total air movement per hour
  const totalACH = baseLeakage + windowACH + purifierACH;

  // B. Infiltration Factor (How much outdoor dirt gets in?)
  // Formula: (Penetration * ACH_leak) / (ACH_total + Deposition)
  const penetration = 0.8; // PM2.5 gets through 80% of cracks
  const deposition = 0.2;  // Natural dust settling
  
  // Note: Purifier is strictly removal, so it goes in denominator but not numerator for infiltration
  const removalRate = totalACH + deposition + (state.purifierOn ? 3.0 : 0); 
  
  // How much of the outdoor air actually pollutes the room?
  const infiltrationRatio = (penetration * (baseLeakage + windowACH)) / removalRate;

  // C. Indoor Source Generation (Cooking)
  // Cooking adds raw PM2.5 (e.g., +400 units) divided by how fast we clean it
  const cookingEmission = state.cookingOn ? 400 : 0; 
  const sourceContrib = cookingEmission / removalRate;

  // D. Final Tally
  return Math.round((outdoorConc * infiltrationRatio) + sourceContrib);
};
