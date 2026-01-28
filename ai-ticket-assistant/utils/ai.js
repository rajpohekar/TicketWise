import { createAgent, gemini } from "@inngest/agent-kit";

// Define the expected JSON structure more explicitly for clarity
const expectedJsonFormat = `{
"summary": "Short summary of the ticket",
"priority": "low | medium | high",
"helpfulNotes": "Here are useful tips...",
"relatedSkills": ["React", "Node.js"]
}`;

const analyzeTicket = async (ticket) => {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY environment variable is not set.");
    throw new Error("AI configuration error: Missing API Key.");
  }

  const supportAgent = createAgent({
    model: gemini({
      // Use a known stable or recommended model. Flash might be too fast/less accurate sometimes.
      // Consider gemini-1.5-pro or another suitable model if flash gives inconsistent results.
      model: "gemini-1.5-flash", // Reverted to flash as per original, but keep pro in mind
      apiKey: process.env.GEMINI_API_KEY,
      // Optional: Add safety settings if needed
      // safetySettings: [...]
      // Optional: Add generation config like temperature
      // generationConfig: { temperature: 0.7 }
    }),
    name: "AI Ticket Triage Assistant",
    system: `You are an expert AI assistant that processes technical support tickets.
Your goal is to analyze the ticket and provide structured information for triage.

You MUST respond with ONLY a valid JSON object.
Do NOT include any introductory text, closing remarks, markdown formatting (like \`\`\`json), code fences, comments, or any extra text outside the JSON structure.

The JSON object MUST have the following structure:
${expectedJsonFormat}

- 'priority' MUST be one of "low", "medium", or "high".
- 'relatedSkills' MUST be an array of strings. If no specific skills apply, return an empty array [].
- 'helpfulNotes' should provide actionable advice or resources for the moderator. Be concise but informative.
- 'summary' should be a brief 1-2 sentence overview of the user's issue.`,
  });

  try {
    const response = await supportAgent.run(`Analyze the following support ticket:

- Title: ${ticket.title}
- Description: ${ticket.description}

Return ONLY the JSON object as specified in the system prompt.`);

    // Access the raw text output from the model
    // Note: The structure might depend on the agent-kit version. Adjust if needed.
    const rawOutput = response?.output?.[0]?.context || response?.output || response;

    if (typeof rawOutput !== 'string' || rawOutput.trim() === '') {
        console.error("AI response was empty or not a string.");
        return null;
    }

    // Attempt to parse the raw output directly as JSON
    try {
      const parsedJson = JSON.parse(rawOutput.trim());

      // Basic validation of the parsed structure
      if (typeof parsedJson.summary !== 'string' ||
          !['low', 'medium', 'high'].includes(parsedJson.priority) ||
          typeof parsedJson.helpfulNotes !== 'string' ||
          !Array.isArray(parsedJson.relatedSkills)) {
          console.warn("AI response JSON structure is invalid:", parsedJson);
          return null; // Or return a default structure
      }

      return parsedJson;

    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError.message);
      console.error("Raw AI Response:", rawOutput);

      // Fallback: Try to extract JSON from markdown if direct parse fails (less reliable)
      const match = rawOutput.match(/```json\s*([\s\S]*?)\s*```/i);
      if (match && match[1]) {
        try {
          console.warn("Parsing AI response using fallback markdown extraction.");
          const fallbackJson = JSON.parse(match[1].trim());
          // Re-validate the fallback structure
          if (typeof fallbackJson.summary === 'string' &&
              ['low', 'medium', 'high'].includes(fallbackJson.priority) &&
              typeof fallbackJson.helpfulNotes === 'string' &&
              Array.isArray(fallbackJson.relatedSkills)) {
             return fallbackJson;
          } else {
              console.warn("Fallback JSON structure is also invalid:", fallbackJson);
          }
        } catch (fallbackParseError) {
          console.error("Failed to parse fallback JSON:", fallbackParseError.message);
        }
      }
      return null; // Return null if all parsing fails
    }
  } catch (agentError) {
    console.error("Error running AI agent:", agentError.message);
    throw agentError; // Re-throw to allow Inngest retries if applicable
  }
};

export default analyzeTicket;