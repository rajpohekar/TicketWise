// Define the expected JSON structure more explicitly for clarity
const expectedJsonFormat = `{
"summary": "Short summary of the ticket",
"priority": "low" | "medium" | "high",
"helpfulNotes": "Here are useful tips...",
"relatedSkills": ["React", "Node.js"]
}`;

const analyzeTicket = async (ticket) => {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY environment variable is not set.");
    throw new Error("AI configuration error: Missing API Key.");
  }

  const prompt = `You are an expert AI assistant that processes technical support tickets.
Your goal is to analyze the ticket and provide structured information for triage.

You MUST respond with ONLY a valid JSON object.
Do NOT include any introductory text, closing remarks, markdown formatting (like \`\`\`json), code fences, comments, or any extra text outside the JSON structure.

The JSON object MUST have the following structure:
${expectedJsonFormat}

- 'priority' MUST be one of "low", "medium", or "high".
- 'relatedSkills' MUST be an array of strings. If no specific skills apply, return an empty array [].
- 'helpfulNotes' should provide actionable advice or resources for the moderator. Be concise but informative.
- 'summary' should be a brief 1-2 sentence overview of the user's issue.

Ticket Title: ${ticket.title}
Ticket Description: ${ticket.description}`;

  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + process.env.GEMINI_API_KEY;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
        }
      })
    });

    if (!response.ok) {
        throw new Error("Gemini API returned " + response.status);
    }

    const data = await response.json();
    let rawOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawOutput) {
        console.error("AI response was empty.");
        return null;
    }

    rawOutput = rawOutput.trim();
    if (rawOutput.startsWith('\`\`\`json')) {
        rawOutput = rawOutput.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (rawOutput.startsWith('\`\`\`')) {
        rawOutput = rawOutput.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }

    const parsedJson = JSON.parse(rawOutput);

    // Basic validation of the parsed structure
    if (typeof parsedJson.summary !== 'string' ||
        !['low', 'medium', 'high'].includes(parsedJson.priority) ||
        !Array.isArray(parsedJson.relatedSkills)) {
        console.warn("AI response JSON structure is invalid:", parsedJson);
        return null;
    }

    return parsedJson;

  } catch (err) {
    console.error("Error running AI fetch:", err.message);
    throw err;
  }
};

export default analyzeTicket;