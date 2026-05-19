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
- Τάρναβας Ανδρέας (Area Operations Manager & Spy Master): Passive-aggressive, highly manipulative. **Crucial Rule:** He should be relatively rare (e.g., appearing in 10-15% of turns).
- Maitress Κατερίνα Τζιούτζιου (Head of F&B): Friendly but demanding.
- Executive Chef Αντώνης Σάββας: Highly inappropriate and toxic. When he appears in colleague gossip scenes, it is usually because he is either trash-talking people behind their backs or making wildly inappropriate sexual comments about colleagues.
- Other Staff/Guests: Do NOT make every scene about guest problems. At least 40% of scenes must be simple interpersonal issues with colleagues (gossip, favors, breaks, arguments) without guest or GM involvement. **Crucial:** Adapt these interactions to the player's Role environment, but ALSO sometimes include cross-departmental drama (e.g., Reception gossiping with Housekeeping, or Kitchen fighting with Maintenance).

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
  "requires_text_input": "string or null (If a scenario requires the player to type an answer instead of selecting buttons, set this to the prompt text, e.g., 'Γράψε το τραγούδι που θα της πεις:')",
  "choices": [
    {"id": 1, "text": "string (Action choice option 1 in Greek. If requires_text_input is provided, leave this empty or provide a default skip option)"},
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
Date: ${currentStateData.currentDate}
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

    // SEASONAL LOGIC INJECTION
    if (currentStateData.currentDate) {
      if (currentStateData.season === 2) {
        promptStr += `CRITICAL SEASON 2 RULES & LORE (You MUST follow these rules):
- Do NOT mention or feature the NPCs "Βαλάντης" (Valantis) or "Φασλί" (Fasli) at all. They do not work here in Season 2.
- Introduce a new NPC: "Καρδάρης" (Kardaris). He is the F&B Manager, has an extremely bad character, is a spy for Tarnavas, wants to undermine Moustakas, and wants to take Moustakas' position using various shady schemes (λαμογιές).
- The allowed NPCs in Season 2 are: Maitress Κατερίνα Τζιούτζιου, Executive Chef Αντώνης Σάββας, Μουστάκας, Τάρναβας, and Καρδάρης.
- If the player's role is "Βοηθός Σερβιτόρου" (Waiter), you can feature the Captain NPC "Αλεξάνδρα Παντερμάλη" who asks for help with getting a discount or printing allergen labels/cards for the buffet.
- You can also feature the bar manager "Νίκος Περαντωνάκης" who has gotten completely drunk and is found passed out or drinking inside a warehouse (αποθήκη).\n\n`;
      }
      const current = new Date(currentStateData.currentDate);
      const endOfSeason = new Date('2026-11-01');
      if (current >= endOfSeason) {
         promptStr += `CRITICAL CALENDAR INSTRUCTION: The date is ${currentStateData.currentDate}. The summer season is officially OVER. The hotel is closing for the winter. You MUST output a final wrap-up story summarizing the player's performance over the season and explicitly set "game_over": true to end the game successfully.\n\n`;
      } else {
         const month = current.getMonth() + 1; // 1-12
         if (month === 2) {
           promptStr += `SEASONAL CONTEXT: It's February. The player is in the job interview phase for their selected role. The theme of this turn MUST be the corporate job interview process, interview questions from HR or GM George Moustakas, and evaluating if the candidate fits the role. The location is the GM's office.\n\n`;
         } else if (month === 4 || month === 5) {
           promptStr += `SEASONAL CONTEXT: It's early in the season (Spring/May). Focus on opening preparations, new staff training, and low occupancy issues.\n\n`;
         } else if (month === 7 || month === 8) {
           promptStr += `SEASONAL CONTEXT: It's PEAK SUMMER SEASON (July/August). Occupancy is 100%. Chaos, heatwaves, overbookings, and extreme stress are the norm. Increase the intensity of events!\n\n`;
         } else if (month === 9 || month === 10) {
           promptStr += `SEASONAL CONTEXT: It's the end of the season (Autumn). Staff are exhausted, equipment is breaking down from wear and tear, and everyone just wants to go home.\n\n`;
         }
      }
    }

    if (currentStateData.thesfapaClicked && currentStateData.turnsSinceThesfapa === 2) {
      promptStr += `CRITICAL EVENT INSTRUCTION FOR THIS EXACT TURN:\nΤάρναβας MUST appear extremely angry in this scene. He tells the player that he saw them from the security cameras playing the 'Thesfapa' game and "του έσπασες τα μούτρα" (smashing his face in). He demands an explanation and severely threatens the player. Offer choices to defend yourself, apologize, or blame someone else.\n\n`;
    }
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
