// api/game.js
// Vercel Serverless Function (Node.js)

const SYSTEM_PROMPT = `
# GAME DESIGN DOCUMENT & SYSTEM INSTRUCTION: HOTEL MANAGER RPG
Role: Advanced Dungeon Master / Highly Complex Game State Engine
Setting: High-Stakes Modern Greek Hotel Simulation (Intrigue, Spies, and Toxic Executive Management)

## 1. GAME CONCEPT & CORE LORE
The player starts as an ambitious job applicant entering a high-stakes, fast-paced hotel environment in Greece. They select one of three foundational entry-level roles: Commis Chef (Γ Μάγειρας), Commis Waiter (Βοηθός Σερβιτόρου), or Receptionist (Ρεσεψιονίστ). The tone is highly realistic, intense, and corporate, demanding professional reflexes, crisis management, and diplomatic tact under manipulative or high-pressure supervision.

## 2. PLAYER ROLES & DETAILED CAREER LADDERS
- Ρεσεψιονίστ (The Front Line): Ρεσεψιονίστ -> Assistant Fom -> Front Office Manager -> Operations Manager -> General Manager.
- Βοηθός Σερβιτόρου (F&B Underdog): Βοηθός Σερβιτόρου -> Σερβιτόρος Α -> Captain -> Maitre -> F&B Manager.
- Γ Μάγειρας (The Kitchen Heat): Γ Μάγειρας -> Β Μάγειρας -> Α Μάγειρας -> Sous Chef -> Executive Chef.

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
You must track and output these exact metrics inside a STRICT JSON object. Do NOT wrap the response in markdown blocks (No ```json). No text before or after the JSON.

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
  "promotion_triggered": "boolean", "game_over": "boolean",
  "viber_message": {"sender": "string or null", "text": "string or null"}
}

When the player sends: "START: [ROLE]", initialize the game at Act 1 (The Interview) for that specific role, setting initial stats (Cash: 50, Stress: 10, Reputation: 50, Staff Relations: 0, Alcohol Warnings: 0), setting the shift to 'Πρωινή Βάρδια', and providing the opening story text and the first 3 interview choices using the schema above.
`;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing GEMINI_API_KEY.' });
  }

  const { playerInput, currentStateData, onlyViber } = req.body;

  if (!onlyViber && !playerInput) {
    return res.status(400).json({ error: 'Missing playerInput in request body.' });
  }

  // Construct the prompt string with current state
  let promptStr = '';
  if (onlyViber) {
    promptStr = `
# GAME CONTEXT: HOTEL MANAGER RPG
We need to generate a funny, in-character Viber message from a coworker reacting to the player's current game state.
Role: ${currentStateData?.role || 'Receptionist'}
Current Turn: ${currentStateData?.turnCount || 0}
Current Stress: ${currentStateData?.stress || 10}
Current Reputation: ${currentStateData?.reputation || 50}
Current Date: ${currentStateData?.currentDate || ''}

INSTRUCTION: Generate a short, sarcastic, shocked or funny Viber chat message from a coworker appropriate to this role/situation in casual Greek. The colleague should react to their current stress level or general situation. Do NOT use Nikos Tsafradkis (Οπερατιονς Manager) or George Moustakas.
OUTPUT FORMAT: Output a STRICT JSON object matching this schema (do NOT include other fields, do NOT wrap in markdown block):
{
  "viber_message": {
    "sender": "string (Colleague name and role, e.g. 'Μαρία (Housekeeping)')",
    "text": "string (The message in casual Greek)"
  }
}
`;
  } else {
    promptStr = SYSTEM_PROMPT + "\n\n";
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
Staff Turnover: ${currentStateData.staffTurnover}
Turn: ${currentStateData.turnCount || 0}\n\n`;

      // Every 3rd turn, or turn 1: request a funny coworker Viber message
      const turn = currentStateData.turnCount || 0;
      if (turn === 1) {
        promptStr += `VIBER MESSAGE INSTRUCTION: Since this is the player's FIRST turn at the hotel, you MUST generate a welcome Viber message from a coworker appropriate to the player's role (NOT Nikos Tsafradkis) in casual Greek. The colleague should welcome them to the Faplantica team and warn them about GM Moustakas' high stress levels today. Set "sender" to the coworker's name and role, and "text" to the message.\n\n`;
      } else if (turn > 0 && turn % 3 === 0) {
        promptStr += `VIBER MESSAGE INSTRUCTION: On this turn you MUST generate a funny, in-character "viber_message" in the JSON from a colleague (NOT Nikos Tsafradkis). Pick a coworker appropriate to the player's role and current situation. The message must be a short, funny, sarcastic or shocked reaction to the player's recent decisions or current stress level. Write it in casual Greek. Set "sender" to the colleague's name and "text" to the message.\n\n`;
      } else {
        promptStr += `VIBER MESSAGE INSTRUCTION: Do NOT generate a viber_message this turn. Set "viber_message": {"sender": null, "text": null}.\n\n`;
      }

      // SEASONAL LOGIC INJECTION
      if (currentStateData.currentDate) {
        if (currentStateData.season === 2) {
          promptStr += `CRITICAL SEASON 2 RULES & LORE (You MUST follow these rules):
- Do NOT mention or feature the NPCs "Βαλάντης" (Valantis) or "Φασλί" (Fasli) at all. They do not work here in Season 2.
- Introduce a new NPC: "Καρδάρης" (Kardaris). He is the F&B Manager, has an extremely bad character, is a spy for Tarnavas, wants to undermine Moustakas, and wants to take Moustakas' position using various shady schemes (λαμογιές).
- The allowed NPCs in Season 2 are: Maitress Κατερίνα Τζιούτζιου, Executive Chef Αντώνης Σάββας, Μουστάκας, Τάρναβας, and Καρδάρης.
- If the player's role is "Βοηθός Σερβιτόρου" (Waiter), you can feature the Captain NPC "Αλεξάνδρα Παντερμάλη" who asks for help with getting a discount or printing allergen labels/cards for the buffet.
- You can also feature the bar manager "Νίκος Περαντωνάκης" who has gotten completely drunk and is found passed out or drinking inside a warehouse (αποθήκη).\n\n`;
        } else if (currentStateData.season === 4) {
          promptStr += `CRITICAL SEASON 4 RULES & LORE:
- In Season 4, Kardaris' toxic schemes, embezzlement, and attempts to frame GM Moustakas for illegal trafficking are fully exposed!
- If the player's role is Waiter ("Maitre"), you MUST feature stories and interactions where the player uncovers Kardaris' plans, gathers evidence (like digital footprints or records), and collaborates with GM Moustakas to set a trap for Kardaris or report him to Tarnavas to get him fired.\n\n`;
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
  }

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
      const errText = await response.text();
      throw new Error(`Google Gemini API responded with status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const textResp = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON (clean markdown blocks if present)
    const cleanJsonString = textResp.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJsonString);

    // Return the response to the client
    return res.status(200).json(parsedData);

  } catch (error) {
    console.error("Vercel Serverless Function Error:", error);
    return res.status(500).json({ error: 'Failed to generate game state: ' + error.message });
  }
}
