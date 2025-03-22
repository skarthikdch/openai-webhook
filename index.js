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
  const userMessage = req.body.queryResult.queryText;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
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
