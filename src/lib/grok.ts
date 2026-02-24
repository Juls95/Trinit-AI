export interface GrokResponse {
  reply: string;
  classification?: {
    type: "INCOME" | "EXPENSE" | "RECURRING" | "BUDGET" | null;
    amount: number | null;
  };
}

export async function callGrokAPI(
  message: string,
  conversationHistory: { role: string; content: string }[] = []
): Promise<GrokResponse> {
  const systemPrompt = `You are Trinit, a friendly personal finance AI agent for Trinit.
You help users track expenses, manage budgets, set financial goals, and provide market insights.
You speak in a warm, concise, and encouraging tone.

When users mention financial transactions, ALWAYS extract:
1. Classification: INCOME, EXPENSE, RECURRING, or BUDGET
2. Amount: the numeric amount mentioned

Respond in JSON format when a transaction is detected:
{"reply": "your friendly response", "classification": {"type": "EXPENSE", "amount": 45.50}}

For general conversation, respond:
{"reply": "your friendly response", "classification": null}

Handle MXN (Mexican Pesos) and USD. Default to MXN if currency is ambiguous.
Never reveal you are an AI. Act as a knowledgeable finance consultant.`;

  const response = await fetch(process.env.GROK_API_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROK_API_KEY!}`,
    },
    body: JSON.stringify({
      model: "grok-3-latest",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    throw new Error(`Grok API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    return JSON.parse(content) as GrokResponse;
  } catch {
    return { reply: content, classification: undefined };
  }
}
