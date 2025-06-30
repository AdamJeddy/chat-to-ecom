document.getElementById("runQuery").addEventListener("click", async () => {
  const query = document.getElementById("queryInput").value;
  console.log("[Popup] User query:", query);

  const parsedFilters = await parseQueryWithGPT(query);
  console.log("[Popup] GPT parsed:", parsedFilters);

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: runFilterQuery,
      args: [parsedFilters]
    });
  });
});


// Step 1: Send query to GPT
async function parseQueryWithGPT(query) {
  // IMPORTANT: The API key is now loaded from config.js (do not commit your key)
  const openaiApiKey = OPENAI_API_KEY;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: `Extract shoe filter criteria from shopping queries. Return as JSON like { category, color, maxPrice, size, sort, brand }.
IMPORTANT: The color must be one of the following (map any user color to the closest from this list): [\"animal_printed\",\"beige\",\"black\",\"blue\",\"brown\",\"burgundy\",\"cream\",\"gold\",\"green\",\"grey\",\"khaki\",\"multicolored\",\"navy\",\"neutral\",\"orange\",\"pink\",\"printed\",\"purple\",\"red\",\"silver\",\"taupe\",\"white\"]\nIf the user specifies a designer or brand (e.g., \"adidas\", \"Nike\", \"Gucci\"), include it as the 'brand' field in the JSON. The value of 'brand' must be in lowercase and spaces must be replaced with underscores (e.g., 'Alexander McQueen' -> 'alexander_mcqueen').` },
        { role: "user", content: query }
      ],
      temperature: 0.3
    })
  });

  const json = await res.json();
  const content = json.choices[0].message.content;

  try {
    return JSON.parse(content); // assumes GPT returns proper JSON
  } catch (e) {
    console.error("Failed to parse GPT response", content);
    return {};
  }
}

// Step 2: Send parsed filters to content script
function runFilterQuery(filters) {
  window.postMessage({ type: "RUN_FILTER_QUERY", filters }, "*");
}
