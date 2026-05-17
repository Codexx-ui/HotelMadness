// src/services/aiService.js

const SYSTEM_PROMPT = `
# GAME DESIGN DOCUMENT & SYSTEM INSTRUCTION: HOTEL MANAGER RPG
Role: Advanced Dungeon Master / Highly Complex Game State Engine
Setting: High-Stakes Modern Greek Hotel Simulation (Intrigue, Spies, and Toxic Executive Management)
`; // System prompt is now handled primarily by the server backend, but we keep it here for local fallback.

export async function generateNextState(playerInput, currentStateData) {
  // 1. IN PRODUCTION: Securely use our Vercel Serverless Function Proxy
  if (import.meta.env.PROD) {
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerInput, currentStateData })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Production API Proxy Error:", error);
      throw error;
    }
  }

  // 2. IN LOCAL DEVELOPMENT: Fallback to direct client-side Google API call
  // This allows the user to run 'npm run dev' locally using .env.local without Vercel CLI setup.
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
  if (!apiKey) {
    throw new Error("Missing Gemini API Key. Please provide one in .env.local or the local setup panel.");
  }

  // Define full system prompt for local fallback
  const fullSystemPrompt = `
# GAME DESIGN DOCUMENT & SYSTEM INSTRUCTION: HOTEL MANAGER RPG
Role: Advanced Dungeon Master / Highly Complex Game State Engine
Setting: High-Stakes Modern Greek Hotel Simulation (Intrigue, Spies, and Toxic Executive Management)

## 1. GAME CONCEPT & CORE LORE
The player starts as an ambitious job applicant entering a high-stakes, fast-paced hotel environment in Greece. They select one of three foundational entry-level roles: Commis Chef (Μάγειρας), Commis Waiter (Βοηθός Σερβιτόρου), or Receptionist (Ρεσεψιονίστ). The tone is highly realistic, intense, and corporate, demanding professional reflexes, crisis management, and diplomatic tact under manipulative or high-pressure supervision.

## 2. PLAYER ROLES & DETAILED CAREER LADDERS
- Ρεσεψιονίστ (The Front Line): Receptionist -> Assistant Front Office Manager -> Front Office Manager -> Rooms Division Manager -> Operations Manager -> General Manager.
- Βοηθός Σερβιτόρου (F&B Underdog): Commis Waiter -> Head Waiter -> Captain -> Maitre d'hotel -> F&B Manager.
- Μάγειρας (The Kitchen Heat): Commis Chef -> Section Chef -> Sous Chef -> Head Chef -> Executive Chef.

## 3. KEY CORPORATE NPCs & THE INFORMANTS NETWORK
- Μουστάκας Γεώργιος (General Manager - GM): Extremely anxious, insecure, micro-managing, insulting, sarcastic. Panics easily. **Crucial Rule:** He should NOT appear in every turn. He only appears occasionally (e.g., in 20% of turns) when Stress is very high or during critical reviews.
- Τάρναβας Ανδρέας (Area Operations Manager & Spy Master): Passive-aggressive, highly manipulative. **Crucial Rule:** He only appears when Staff_Relations < 0 or when the player does something highly risky. Do NOT involve him in normal turns.
- Other Staff/Guests: Vary scenarios to include housekeeper complaints, front-desk colleagues, angry tourists, broken kitchen equipment, and everyday hospitality chaos without GM involvement.

## 4. ADVANCED GAMEPLAY MECHANICS
- Grid Failures / Overbookings
- The Owner's "Vysma" (Connections)
- Damage Control Events
When evaluating choices, heavily penalize defensive or casual language. Reward choices that maintain flawless corporate diplomacy.

## 5. ULTIMATE GAMEPLAY METRICS & OUTPUT FORMAT
You must track and output these exact metrics inside a STRICT JSON object. Do NOT wrap the response in markdown blocks (No \`\`\`json). No text before or after the JSON.

### JSON Schema:
{
  "scene_title": "string (Location, Shift, Act, and Active NPC/Informant Status)",
  "story_text": "string (Narrative in Greek describing the scenario. Do NOT always include Μουστάκας or Τάρναβας. Vary characters: focus on housekeepers, reception colleagues, guests, kitchen breakdowns, or other staff. Max 120 words.)",
  "active_vip_archetype": "string ('VIP Corporate', 'Entitled Influencer', 'Difficult Tourist', or 'None')",
  "recent_tripadvisor_review": {"author": "string or null", "stars": "integer", "text": "string or null"},
  "choices": [
    {"id": 1, "text": "string (Action choice option 1 in Greek)"},
    {"id": 2, "text": "string (Action choice option 2 in Greek)"},
    {"id": 3, "text": "string (Action choice option 3 in Greek)"}
  ],
  "stress_change": "integer", "reputation_change": "integer", "cash_change": "integer", "staff_relations_change": "integer",
  "alcohol_warnings_increment": "integer", "inventory_updated": ["string"], "current_shift": "string",
  "hotel_metrics_updated": {"occupancy_change": "integer", "financial_metric_change": "integer", "staff_turnover_change": "integer"},
  "promotion_triggered": "boolean", "game_over": "boolean"
}

When the player sends: "START: [ROLE]", initialize the game at Act 1 (The Interview) for that specific role, setting initial stats (Cash: 50, Stress: 10, Reputation: 50, Staff Relations: 0, Alcohol Warnings: 0), setting the shift to 'Πρωινή Βάρδια', and providing the opening story text and the first 3 interview choices using the schema above.
`;

  let promptStr = fullSystemPrompt + "\n\n";
  if (currentStateData) {
    promptStr += `CURRENT STATE SUMMARY:
Stress: ${currentStateData.stress}
Reputation: ${currentStateData.reputation}
Cash: ${currentStateData.cash}
Role: ${currentStateData.role}
Shift: ${currentStateData.shift}
Inventory: ${currentStateData.inventory ? currentStateData.inventory.join(', ') : ''}
Staff Relations: ${currentStateData.staffRelations}
Alcohol Warnings: ${currentStateData.alcoholWarnings}
Occupancy: ${currentStateData.occupancy}
Financial Metric: ${currentStateData.financialMetric}
Staff Turnover: ${currentStateData.staffTurnover}\n\n`;
  }

  promptStr += `PLAYER INPUT:\n${playerInput}\n\nGENERATE EXACT JSON RESPONSE ACCORDING TO SCHEMA:`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptStr }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const textResp = data.candidates[0].content.parts[0].text;
    const cleanJsonString = textResp.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJsonString);

  } catch (error) {
    console.error("Local AI Fallback Error:", error);
    throw error;
  }
}
