// const API_ENDPOINT = 'https://ghita-oai-eastus2.openai.azure.com/openai/deployments/gpt-35-turbo/chat/completions?api-version=2023-07-01-preview';
const API_ENDPOINT = ' https://spire-dev.corp.ethos14-stage-va7.ethos.adobe.net/api/proxy';

const init = () => {
  const generate = document.querySelector('#generate');
  generate.addEventListener('click', async () => {
    generate.disabled = true;
    generate.setAttribute('aria-busy', true);
    const prompt = document.querySelector('#prompt').value;

    const results = document.querySelector('#results');
    results.innerHTML = '';

    const res = await fetch(API_ENDPOINT, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        query: prompt,
        temperature: 0.7,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 800,
        stop: null,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      console.log(json);
      if (json.result && json.result.text) {
        const table = document.createElement('table');
        results.append(table);
        const thead = document.createElement('thead');
        table.append(thead);

        const trh = document.createElement('tr');
        thead.append(trh);

        const tbody = document.createElement('tbody');
        table.append(tbody);

        const headers = [];

        JSON.parse(json.result.text).forEach((message) => {
          if (headers.length === 0) {
            // generate headers
            Object.keys(message).forEach((key) => {
              headers.push(key);

              const th = document.createElement('th');
              th.innerHTML = key;
              trh.append(th);
            });
          }
          const trb = document.createElement('tr');
          tbody.append(trb);

          headers.forEach((header) => {
            const td = document.createElement('td');
            td.innerHTML = message[header];
            trb.append(td);
          });
        });
      } else {
        results.innerHTML = 'No results';
      }
    } else {
      results.innerHTML = `Error: ${res.status} - ${res.statusText}`;
    }
    generate.removeAttribute('aria-busy');
    generate.disabled = false;
  });
};

init();
