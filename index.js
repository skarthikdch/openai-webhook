const express = require('express');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  const userMessage = req.body.queryResult.queryText.toLowerCase();

  // Keywords to detect conversation end
  const endKeywords = ['bye', 'thank you', 'thanks', 'see you', 'that\'s all', 'done', 'exit', 'close'];

  // If user wants to end the chat, skip GPT and send farewell
  if (endKeywords.some(word => userMessage.includes(word))) {
    return res.json({
      fulfillmentText: "Thank you for chatting with VacationPlanner Bot! 😊 If you have any questions later, feel free to reach out at +91 8056042914 via WhatsApp. Have a great trip ahead! ✈️🌍"
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are VacationPlanner Bot — a smart, friendly, and proactive AI travel assistant. Your job is to help users plan any kind of vacation quickly and effectively, even if their messages are vague, casual, or contain only numbers.

You understand all kinds of vacation-related phrases and numbers such as:
"2 days", "10-day trip", "1 week", "weekend trip", "honeymoon", "family tour", "budget getaway", "road trip", "Goa trip", "cheap Europe trip", "Thailand vacation", "Paris for 5 days", "group trip", "luxury travel", "3 people 2 nights", etc.

When users type short or unclear messages, assume they are asking about planning a trip, and guide them helpfully.

Your job is to:
- Understand all travel-related input even if it's just numbers like “10 days” or phrases like “trip to Bali”.
- Provide helpful suggestions: destinations, activities, hotels, weather tips, budgets, travel hacks, food, or must-see spots.
- For durations: Suggest full itineraries for that number of days.
- For places: Suggest best months to visit, top things to do, costs, and any travel alerts.
- For cost/budget queries: Provide estimates for budget and premium trips.
- Always suggest the next helpful step or ask a smart follow-up question (e.g., "Would you prefer beach or mountains?" or "What’s your travel month?")
- NEVER say “Sorry, I don’t understand.” Instead, make your best guess and help.

Your tone should be clear, friendly, confident, and helpful — like an experienced travel planner.

Speak like a helpful human, not a robot.`
        },
        { role: "user", content: userMessage }
      ]
    });

    const reply = completion.choices[0].message.content;

    res.json({ fulfillmentText: reply });
  } catch (error) {
    console.error(error);
    res.json({ fulfillmentText: "Sorry, something went wrong." });
  }
});

app.get("/", (req, res) => {
  res.send("Webhook server is running.");
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
