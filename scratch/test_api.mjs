
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.local' });

async function testKey(name, key) {
  console.log(`Testing ${name}...`);
  if (!key) {
    console.error(`${name} is missing!`);
    return;
  }
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 10,
      }),
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log(`${name} is WORKING! Response: ${data.choices?.[0]?.message?.content}`);
    } else {
      console.error(`${name} FAILED! Status: ${response.status}. Error: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error(`${name} ERROR: ${error.message}`);
  }
}

async function run() {
  await testKey('GEMINI_API_KEY_TUTOR', process.env.GEMINI_API_KEY_TUTOR);
  await testKey('GEMINI_API_KEY_STUDIO', process.env.GEMINI_API_KEY_STUDIO);
}

run();
