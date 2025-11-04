import { GoogleGenerativeAI } from "@google/generative-ai";
import HealthReport from "../models/HealthReport.js";
import HealthAssessment from "../models/HealthAssessment.js";
import { getUserIdFromRequest, validateUserId } from '../utils/authHelpers.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

     export const generateHealthReport = async (req, res) => {
try {
    // Check if Gemini API key is configured
        const userId = validateUserId(req, res);
    if (!userId) return; // Response already sent by validateUserId
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'AI service is not properly configured. Please contact support.'
      });
    }

    const { location, aqiData } = req.body;

    if (!location || !aqiData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required data: location and aqiData are required'
      });
    }
    
    // Get latest health assessment with all user data
    const healthAssessment = await HealthAssessment.findOne({ userId: req.userId })
      .sort({ timestamp: -1 })
      .lean();

    if (!healthAssessment) {
      return res.status(400).json({
        success: false,
        message: 'Please complete a health assessment first'
      });
    }

    if (!healthAssessment.name || !healthAssessment.age || !healthAssessment.symptoms) {
      return res.status(400).json({
        success: false,
        message: 'Your health assessment is incomplete. Please update it with all required information.'
      });
    }

    // Check if health assessment is recent (within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (new Date(healthAssessment.timestamp) < thirtyDaysAgo) {
      return res.status(400).json({
        success: false,
        message: 'Your health assessment is more than 30 days old. Please fill out a new health assessment form for accurate recommendations.'
      });
    }

    // Enhanced prompt for Gemini with detailed age-specific analysis and specific medicine recommendations
    const prompt = `You are a friendly health advisor helping people understand how air quality affects their health. Use simple, clear language that anyone can understand. Focus on how current air quality might affect their specific health issues.

    Current Air Quality:
    - AQI Value: ${aqiData.value}
    - Air Quality Level: ${aqiData.status}
    - Time: ${new Date().toLocaleTimeString()}
    - Date: ${new Date().toLocaleDateString()}
    
    User's Health Info:
    - Name: ${healthAssessment.name}
    - Age: ${healthAssessment.age} years
    - Health Issues: ${healthAssessment.symptoms.join(', ')}
    ${healthAssessment.other ? `- Other Health Info: ${healthAssessment.other}` : ''}
    
    Provide comprehensive health recommendations that include:

    1. Age-Specific Recommendations:
    - For children (0-12): Focus on indoor activities, school precautions, and growth-related concerns
    - For teens (13-19): Focus on sports activities, school activities, and development
    - For adults (20-59): Focus on work-related activities, exercise, and daily routines
    - For seniors (60+): Focus on mobility, existing conditions, and preventive care

    2. Health-Specific Recommendations for each issue:
    - How current air quality affects this issue
    - What they should do to stay safe
    - When they should be extra careful
    - Specific precautions based on AQI level

    3. General Recommendations:
    - Indoor air quality management
    - Daily activity modifications
    - Preventive measures
    - Emergency preparedness

    4. Medication Guidance:
    - Current medication adjustments if needed
    - Over-the-counter options for symptoms
    - When to consult a doctor
    - Emergency medication protocols

    Return a JSON object with this EXACT structure. Do not include any text before or after the JSON object:
    {
      "userProfile": {
        "age": ${healthAssessment.age},
        "ageGroup": "${healthAssessment.age < 18 ? 'Child' : healthAssessment.age < 60 ? 'Adult' : 'Senior'}",
        "riskLevel": "${aqiData.value > 150 ? 'High' : aqiData.value > 100 ? 'Medium' : 'Low'}"
      },
      "ageSpecificRecommendations": {
        "dailyActivities": "Age-appropriate activity recommendations",
        "precautions": "Age-specific precautions",
        "specialConsiderations": "Special considerations for this age group"
      },
      "healthSpecificRecommendations": [
        {
          "issue": "Health issue name",
          "effect": "How air quality affects this issue",
          "safetyMeasures": "What they should do",
          "extraCare": "When to be extra careful",
          "medicationAdvice": "Specific medication guidance for this issue"
        }
      ],
      "generalRecommendations": {
        "indoorAirQuality": "Tips for maintaining good indoor air quality",
        "activityModifications": "How to modify daily activities",
        "preventiveMeasures": "General preventive measures",
        "emergencyProtocols": "What to do in case of severe symptoms"
      },
      "medicationGuidance": {
        "currentMedications": "Advice for current medications",
        "overTheCounter": "Recommended OTC medications",
        "whenToSeekHelp": "When to consult a doctor",
        "emergencyMedications": "Emergency medication protocols"
      },
      "outdoorActivitySafety": {
        "isSafe": ${aqiData.value < 100},
        "recommendation": "Clear advice about outdoor activities",
        "timeRestrictions": "Best and worst times for outdoor activities",
        "activityModifications": "How to modify outdoor activities"
      },
      "maskRecommendations": {
        "isRecommended": ${aqiData.value > 100},
        "type": "Recommended mask type",
        "usage": "How to use the mask",
        "maintenance": "Mask care and replacement guidelines"
      }
    }

    Important: 
    1. Return ONLY the JSON object, no additional text or explanation
    2. Base all recommendations on the current AQI value (${aqiData.value})
    3. Consider the user's age (${healthAssessment.age}) for all recommendations
    4. Include specific medication advice for each reported symptom
    5. Provide clear, actionable steps for each recommendation
    6. Ensure all JSON properties are properly formatted with no trailing commas
    7. Keep all text values concise and clear`;

    try {
      // Generate report using Gemini (Free tier)
     const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
      });

      const result = await model.generateContent({
        contents: [{ 
          role: 'user', 
          parts: [{ text: prompt }] 
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192, 
        },
      });
      
      const response = await result.response;
      const responseText = response.text();
      console.log('Raw AI response text:', responseText);
      let reportData;
      try {
        // Clean the response text to ensure it's valid JSON
        let cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
        
        // Additional cleaning to handle potential formatting issues
        const jsonStart = cleanedText.indexOf('{');
        const jsonEnd = cleanedText.lastIndexOf('}');
        
        if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
          console.error('Invalid JSON response from AI:', responseText);
          throw new Error('Invalid JSON response from AI');
        }
        
        cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
        
        // Remove any trailing commas before closing braces
        cleanedText = cleanedText.replace(/,(\s*[}\]])/g, '$1');
        
        try {
          reportData = JSON.parse(cleanedText);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Cleaned text:', cleanedText);
          throw new Error('Failed to parse AI response as JSON');
        }

        // Validate required fields
        if (!reportData.healthSpecificRecommendations || !Array.isArray(reportData.healthSpecificRecommendations)) {
          throw new Error('Missing or invalid health-specific recommendations in AI response');
        }

        // Convert recommendations to strings if they're objects
        reportData.healthSpecificRecommendations = reportData.healthSpecificRecommendations.map(rec => {
          if (typeof rec === 'object') {
            return `${rec.issue}: ${rec.effect} ${rec.safetyMeasures} ${rec.extraCare} ${rec.medicationAdvice || ''}`;
          }
          return rec;
        });

        // Convert age-specific recommendations to strings
        if (reportData.ageSpecificRecommendations) {
          const ageRecs = reportData.ageSpecificRecommendations;
          reportData.ageSpecificRecommendations = [
            `Daily Activities: ${ageRecs.dailyActivities}`,
            `Precautions: ${ageRecs.precautions}`,
            `Special Considerations: ${ageRecs.specialConsiderations}`
          ];
        } else {
          const age = healthAssessment.age;
          reportData.ageSpecificRecommendations = [
            `Daily Activities: ${age < 18 
              ? "Limit outdoor activities and focus on indoor games and learning activities."
              : age < 60
              ? "Modify work and exercise routines based on air quality."
              : "Stay indoors during poor air quality and maintain gentle indoor exercises."}`,
            `Precautions: ${age < 18
              ? "Ensure proper ventilation in classrooms and homes."
              : age < 60
              ? "Use air purifiers at work and home."
              : "Keep emergency medications handy and maintain regular health check-ups."}`,
            `Special Considerations: ${age < 18
              ? "Monitor for any respiratory symptoms and maintain vaccination schedule."
              : age < 60
              ? "Balance work commitments with health precautions."
              : "Regular monitoring of existing conditions and medication adjustments if needed."}`
          ];
        }

        // Convert general recommendations to strings
        if (reportData.generalRecommendations) {
          const genRecs = reportData.generalRecommendations;
          reportData.generalRecommendations = [
            `Indoor Air Quality: ${genRecs.indoorAirQuality}`,
            `Activity Modifications: ${genRecs.activityModifications}`,
            `Preventive Measures: ${genRecs.preventiveMeasures}`,
            `Emergency Protocols: ${genRecs.emergencyProtocols}`
          ];
        } else {
          reportData.generalRecommendations = [
            "Indoor Air Quality: Use air purifiers, maintain proper ventilation, and keep windows closed during poor air quality.",
            "Activity Modifications: Reduce strenuous activities and take frequent breaks.",
            "Preventive Measures: Stay hydrated, maintain good nutrition, and get adequate rest.",
            "Emergency Protocols: Keep emergency contacts handy and seek medical help if symptoms worsen."
          ];
        }

        // Convert medication guidance to strings
        if (reportData.medicationGuidance) {
          const medGuidance = reportData.medicationGuidance;
          reportData.medicationGuidance = [
            `Current Medications: ${medGuidance.currentMedications}`,
            `Over-the-Counter: ${medGuidance.overTheCounter}`,
            `When to Seek Help: ${medGuidance.whenToSeekHelp}`,
            `Emergency Medications: ${medGuidance.emergencyMedications}`
          ];
        } else {
          reportData.medicationGuidance = [
            "Current Medications: Continue prescribed medications and consult doctor if symptoms worsen.",
            "Over-the-Counter: Consider OTC medications for symptom relief after consulting a doctor.",
            "When to Seek Help: Seek medical attention for severe symptoms or if existing conditions worsen.",
            "Emergency Medications: Keep rescue medications accessible and know how to use them."
          ];
        }

        // Create default data if any required fields are missing
        if (!reportData.outdoorActivitySafety) {
          const aqi = aqiData.value;
          reportData.outdoorActivitySafety = {
            isSafe: aqi < 100,
            recommendation: aqi > 150 
              ? `The air quality is poor right now (AQI ${aqi}). It's best to stay inside.`
              : aqi > 100
              ? `The air quality is not great (AQI ${aqi}). Try to stay inside as much as possible.`
              : `The air quality is okay (AQI ${aqi}). You can go outside, but take it easy.`,
            timeRestrictions: "Early morning hours typically have better air quality.",
            activityModifications: "Reduce intensity and duration of outdoor activities."
          };
        }
        
        if (!reportData.maskRecommendations) {
          const aqi = aqiData.value;
          reportData.maskRecommendations = {
            isRecommended: aqi > 100,
            type: aqi > 150 ? 'N95 mask' : 'Regular mask',
            usage: aqi > 100 
              ? `Wear a mask when you go outside. Change it if it gets wet or dirty.`
              : `You don't need a mask right now, but keep one handy just in case.`,
            maintenance: "Replace masks daily or when they become damp or soiled."
          };
        }
      } catch (parseError) {
        console.error('Error processing AI response:', parseError);
        throw new Error('Failed to process AI response: ' + parseError.message);
   
      }

      // Prepare health report data
      const healthReportData = {
        userId: req.userId,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          name: location.name
        },
        aqiData: {
          value: aqiData.value,
          status: aqiData.status,
          pollutants: aqiData.pollutants,
          timestamp: new Date()
        },
        healthData: {
          name: healthAssessment.name,
          age: healthAssessment.age,
          symptoms: healthAssessment.symptoms,
          other: healthAssessment.other || '',
          assessmentDate: healthAssessment.timestamp
        },
        report: {
          userProfile: reportData.userProfile,
          ageSpecificRecommendations: reportData.ageSpecificRecommendations,
          healthSpecificRecommendations: reportData.healthSpecificRecommendations,
          generalRecommendations: reportData.generalRecommendations,
          medicationGuidance: reportData.medicationGuidance,
          outdoorActivitySafety: reportData.outdoorActivitySafety,
          maskRecommendations: reportData.maskRecommendations,
          timestamp: new Date()
        }
      };

      // Create and save the health report
      const healthReport = new HealthReport(healthReportData);
      await healthReport.save();

      // Send response with user details
      const responseData = {
        success: true,
        message: 'Health report generated successfully',
        report: {
          _id: healthReport._id,
          timestamp: healthReport.timestamp,
          personalInfo: {
            name: healthAssessment.name,
            age: healthAssessment.age,
            ageGroup: reportData.userProfile.ageGroup,
            riskLevel: reportData.userProfile.riskLevel
          },
          location: healthReport.location,
          airQuality: {
            ...healthReport.aqiData,
            timestamp: new Date()
          },
          healthStatus: {
            reportedIssues: healthAssessment.symptoms,
            additionalInfo: healthAssessment.other || '',
            lastAssessmentDate: healthAssessment.timestamp
          },
          recommendations: {
            healthSpecific: reportData.healthSpecificRecommendations,
            ageSpecific: {
              dailyActivities: reportData.ageSpecificRecommendations[0],
              precautions: reportData.ageSpecificRecommendations[1],
              specialConsiderations: reportData.ageSpecificRecommendations[2]
            },
            general: {
              indoorAirQuality: reportData.generalRecommendations[0],
              activityModifications: reportData.generalRecommendations[1],
              preventiveMeasures: reportData.generalRecommendations[2],
              emergencyProtocols: reportData.generalRecommendations[3]
            },
            medication: {
              currentMedications: reportData.medicationGuidance[0],
              overTheCounter: reportData.medicationGuidance[1],
              whenToSeekHelp: reportData.medicationGuidance[2],
              emergencyMedications: reportData.medicationGuidance[3]
            }
          },
          outdoorActivitySafety: {
            isSafe: reportData.outdoorActivitySafety.isSafe,
            recommendation: reportData.outdoorActivitySafety.recommendation,
            timeRestrictions: reportData.outdoorActivitySafety.timeRestrictions,
            activityModifications: reportData.outdoorActivitySafety.activityModifications
          },
          maskRecommendations: {
            isRecommended: reportData.maskRecommendations.isRecommended,
            type: reportData.maskRecommendations.type,
            usage: reportData.maskRecommendations.usage,
            maintenance: reportData.maskRecommendations.maintenance
          }
        }
      };

      res.status(200).json(responseData);
    } catch (geminiError) {
      console.error('Gemini API Error:', geminiError);
      
      // Check for specific API key related errors
      if (geminiError.message.includes('API key') || geminiError.message.includes('authentication')) {
        return res.status(500).json({
          success: false,
          message: 'Invalid API key. Please check your configuration.',
          error: 'API_KEY_ERROR'
        });
      }
      
      // Check for rate limiting or quota errors
      if (geminiError.message.includes('quota') || geminiError.message.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          message: 'AI service is currently busy. Please try again in a few minutes.',
          error: 'RATE_LIMIT_ERROR'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error generating health report with AI',
        error: geminiError.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating health report',
      error: error.message
    });
  }

};
     export const getMyReports = async (req, res) => {
  try {
        const userId = validateUserId(req, res);
    if (!userId) return;
    const reports = await HealthReport.find({ userId: req.userId })
      .sort({ 'report.timestamp': -1 });
    res.json({
      success: true,
      reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }

};
     export const getReportById = async (req, res) => {
  try {
        const userId = validateUserId(req, res);
    if (!userId) return;

       const report = await HealthReport.findOne({
      _id: req.params.id,
      userId
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Create a copy of the report to modify
    const reportData = report.toObject();
    
    // Ensure outdoorActivitySafety is present with detailed recommendations
    if (!reportData.outdoorActivitySafety) {
      const aqi = reportData.aqiData.value;
      let outdoorRecommendation = '';
      
      if (aqi < 50) {
        outdoorRecommendation = `With the current excellent air quality (AQI ${aqi}), enjoy outdoor activities freely 🌳. Morning walks 🌅 and afternoon exercises 🏃‍♀️ are perfectly safe for your respiratory health. Even extended outdoor activities like hiking 🥾 or cycling 🚴‍♀️ pose minimal risk. Keep windows open to allow fresh air circulation throughout your home 🏠.`;
      } else if (aqi < 100) {
        outdoorRecommendation = `With moderate air quality (AQI ${aqi}), most outdoor activities remain safe 🌲. Consider early morning exercises 🌄 when air quality is typically better. Limit strenuous activities like running 🏃‍♀️ to less than 60 minutes. If you experience any respiratory discomfort 😮‍💨, take breaks and move indoors.`;
      } else if (aqi < 150) {
        outdoorRecommendation = `With the current air quality (AQI ${aqi}), reduce prolonged outdoor exertion ⚠️. Morning hours 🌅 typically have better air quality for essential outdoor activities. Limit outdoor exercise to 30 minutes or less 🕐. Keep windows closed during peak pollution hours 🏙️ and use air purifiers indoors if available 🔄.`;
      } else {
        outdoorRecommendation = `With poor air quality (AQI ${aqi}), minimize all outdoor activities 🚫. Stay indoors with windows closed as much as possible 🏠. If you must go outside, limit your time to essential activities only ⏱️. Early morning hours 🌅 may have slightly better air quality if outdoor activity is unavoidable. Consider using air purifiers indoors 🔄.`;
      }
      
      reportData.outdoorActivitySafety = {
        isSafe: aqi < 100,
        recommendation: outdoorRecommendation
      };
    }
    
    // Ensure maskRecommendations is present with detailed recommendations
    if (!reportData.maskRecommendations) {
      const aqi = reportData.aqiData.value;
      let maskType = '';
      let maskUsage = '';
      let isRecommended = false;
      
      if (aqi < 50) {
        isRecommended = false;
        maskType = 'Not necessary';
        maskUsage = `With excellent air quality (AQI ${aqi}), masks are generally not necessary for most people 😊. If you have severe respiratory conditions, you might keep a cloth mask handy as a precaution 🧣. Focus instead on maintaining good indoor air quality with proper ventilation 🪟. Enjoy outdoor activities mask-free while maintaining good respiratory hygiene practices 🌬️.`;
      } else if (aqi < 100) {
        isRecommended = reportData.healthData && reportData.healthData.symptoms && reportData.healthData.symptoms.length > 0;
        maskType = 'Surgical or high-quality cloth mask';
        maskUsage = `With moderate air quality (AQI ${aqi}), consider wearing a mask if you have respiratory conditions 😷. Surgical or high-quality cloth masks are sufficient for brief outdoor activities 🚶‍♀️. Ensure your mask fits properly around your face without gaps 👌. Replace disposable masks daily or when they become damp or visibly soiled 📅.`;
      } else if (aqi < 150) {
        isRecommended = true;
        maskType = 'N95 or KN95 mask for sensitive individuals';
        maskUsage = `With the current air quality (AQI ${aqi}), wearing a mask outdoors is recommended, especially for sensitive individuals 😷. N95 or KN95 masks provide better filtration for pollution particles 🧫. Ensure a proper seal around your face for maximum protection 👍. Limit mask use to 4-6 hours per mask and avoid reusing disposable masks multiple times 🔄.`;
      } else {
        isRecommended = true;
        maskType = 'N95 or KN95 mask';
        maskUsage = `With poor air quality (AQI ${aqi}), N95 or KN95 masks are strongly recommended whenever outdoors 😷. These masks filter small particles effectively when properly fitted 🔍. Change your mask daily or when it becomes difficult to breathe through 📆. Even with a mask, minimize time outdoors and keep indoor air clean with air purifiers 🏠.`;
      }
      
      reportData.maskRecommendations = {
        isRecommended: isRecommended,
        type: maskType,
        usage: maskUsage
      };
    }
    
    // Add medication recommendations if not provided
    if (!reportData.medicationRecommendations) {
      const symptoms = reportData.healthData.symptoms || [];
      let specificAdvice = '';
      
      // Create specific advice based on reported symptoms
      if (symptoms.includes('Cough')) {
        specificAdvice += `For your cough, consider the following medications:
        - For dry cough: Dextromethorphan (Robitussin DM, Delsym)
        - For productive cough: Guaifenesin (Mucinex, Robitussin)
        - For cough with congestion: Pseudoephedrine + Guaifenesin (Mucinex D)
        - Natural remedies: Honey and lemon tea, Throat Coat tea
        Note: If cough persists beyond 7 days, consult a healthcare professional.`;
      }
      
      if (symptoms.includes('Shortness of breath')) {
        specificAdvice += `For shortness of breath:
        - Prescription inhalers: Albuterol (ProAir, Ventolin) for rescue
        - Long-acting bronchodilators: Salmeterol (Serevent), Formoterol (Foradil)
        - Inhaled corticosteroids: Fluticasone (Flovent), Budesonide (Pulmicort)
        - Combination inhalers: Fluticasone/Salmeterol (Advair), Budesonide/Formoterol (Symbicort)
        Note: Always keep rescue inhalers accessible and seek immediate medical attention for severe symptoms.`;
      }
      
      if (symptoms.includes('Wheezing')) {
        specificAdvice += `For wheezing:
        - Quick-relief inhalers: Albuterol (ProAir, Ventolin)
        - Long-term control: Montelukast (Singulair)
        - Inhaled corticosteroids: Fluticasone (Flovent), Budesonide (Pulmicort)
        - Combination medications: Fluticasone/Salmeterol (Advair)
        Note: Monitor peak flow readings if you have a meter and stay in air-conditioned environments during poor air quality.`;
      }
      
      if (symptoms.includes('Sore throat')) {
        specificAdvice += `For sore throat:
        - Pain relief: Acetaminophen (Tylenol), Ibuprofen (Advil)
        - Throat lozenges: Cepacol, Chloraseptic
        - Numbing sprays: Chloraseptic spray, Vicks VapoSpray
        - Natural remedies: Warm salt water gargles, Throat Coat tea
        Note: Avoid irritants like smoking and stay hydrated.`;
      }
      
      if (symptoms.includes('Nasal congestion')) {
        specificAdvice += `For nasal congestion:
        - Decongestants: Pseudoephedrine (Sudafed), Phenylephrine (Sudafed PE)
        - Nasal sprays: Oxymetazoline (Afrin), Fluticasone (Flonase)
        - Antihistamines: Loratadine (Claritin), Cetirizine (Zyrtec)
        - Saline rinses: NeilMed Sinus Rinse, Simply Saline
        Note: Limit decongestant use to 3 days to avoid rebound congestion.`;
      }
      
      if (symptoms.includes('Eye irritation')) {
        specificAdvice += `For eye irritation:
        - Artificial tears: Systane, Refresh, TheraTears
        - Antihistamine eye drops: Ketotifen (Zaditor), Naphazoline/Pheniramine (Visine-A)
        - Preservative-free options: Refresh Plus, TheraTears PF
        Note: Avoid rubbing eyes and consider wearing wraparound sunglasses outdoors.`;
      }
      
      if (symptoms.includes('Headache')) {
        specificAdvice += `For headaches:
        - Pain relievers: Acetaminophen (Tylenol), Ibuprofen (Advil), Aspirin
        - Combination medications: Acetaminophen/Aspirin/Caffeine (Excedrin)
        - Migraine specific: Sumatriptan (Imitrex), Rizatriptan (Maxalt)
        Note: Stay hydrated and rest in a dark, quiet room. Seek medical attention for severe or persistent headaches.`;
      }
      
      // If no specific symptoms or empty symptoms array
      if (specificAdvice === '') {
        specificAdvice = `Based on your health profile, focus on preventive measures:
        - General antihistamines: Loratadine (Claritin), Cetirizine (Zyrtec)
        - Vitamin supplements: Vitamin C, Vitamin D3
        - Antioxidant supplements: Quercetin, N-acetylcysteine
        Note: Always consult with a healthcare professional before starting any new medication.`;
      }
      
      // const disclaimer = "These medication recommendations are for informational purposes only and do not constitute medical advice. Always consult with a qualified healthcare professional before starting, stopping, or changing any medication regimen.";
      
      reportData.medicationRecommendations = {
        specific: specificAdvice,
        
      };
    }

    res.json({
      success: true,
      report: reportData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message
    });
  }

};
     export const getReportCount = async (req, res) => {

  try {
        const userId = validateUserId(req, res);
    if (!userId) return;
    const count = await HealthReport.countDocuments({ userId: req.userId });
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error fetching health reports count:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching health reports count',
      error: error.message
    });
  }
};
