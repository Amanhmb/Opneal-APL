require('dotenv').config();
console.log("API Key:", process.env.OPENAI_API_KEY); // للتحقق من تحميل المفتاح

const express = require("express");
const bodyParser = require("body-parser");
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const app = express();
const port = 3000;

// باقي الكود...

// Array to store previous messages
const history = [];

// Middleware to parse JSON in the request body
app.use(bodyParser.json());

// Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Handle incoming messages
app.post("/message", async (req, res) => {
  const message = req.body.message;

  // If there is a previous message, include it in the prompt
  const user_input =
    history.length > 0
      ? `سجل المحادثة:\n${history.join("\n")}\nأنت: ${message}\n`
      : `أنت: ${message}\n`;

  const messages = [];
  for (const [input_text, completion_text] of history) {
    messages.push({ role: "user", content: input_text });
    messages.push({ role: "assistant", content: completion_text });
  }

  messages.push({ role: "user", content: user_input });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    const completion_text = completion.data.choices[0].message.content;
    console.log(completion_text);

    history.push([user_input, completion_text]);
    res.json({ message: completion_text });
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
      res.status(500).json({ error: "Something went wrong" });
    } else {
      console.log(error.message);
      res.status(500).json({ error: "Something went wrong" });
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
})