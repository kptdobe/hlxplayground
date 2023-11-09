/* eslint-disable no-console */
(() => {
  const formatTime = (x) => (x !== 0 ? (Math.round(x * 100) / 100) : 0);
  const formatSize = (x) => (x !== 0 ? (Math.round((x / 1000) * 100) / 100) : 0);
  const formatTimeMS = (x) => `${formatTime(x)}ms`;
  const formatSizeKiB = (x) => `${formatSize(x)}KiB`;

  const jsonSyntaxHighlight = (json) => {
    let output = json;
    if (typeof json !== 'string') {
      output = JSON.stringify(json, undefined, 2);
    }
    output = output.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return output.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
      let cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return `<span class="${cls}">${match}</span>`;
    });
  };

  const cleanup = () => {
    console.clear();

    const g = document.getElementById('hlx-report-grid');
    if (g) g.remove();

    const s = document.getElementById('hlx-report-style');
    if (s) s.remove();
  };

  const setup = () => {
    const style = document.createElement('style');
    style.id = 'hlx-report-style';
    style.innerHTML = `
      .hlx-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 99999;
        overflow-y: scroll;
        
        background-color: lightgrey;
        margin: 20px;

        font-family: sans-serif;
        font-size: 15px;
        color: black;
      }

      .hlx-container a:any-link {
        color: #035fe6;
      }

      .hlx-container a:hover {
        text-decoration: underline;
        color: #136ff6;
      }

      .hlx-row {
        display: flex;
        flex-wrap: wrap;
        border-top: 1px solid black;
      }

      .hlx-row:last-child {
        border-bottom: 1px solid black;
      }
      
      .hlx-col-header,
      .hlx-col {
        flex: 1;
        border-right: 1px solid black;
        padding: 5px;
      }

      .hlx-col {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .hlx-small {
        max-width: 100px;
      }

      .hlx-large {
        max-width: 400px;
      }

      .hlx-xlarge {
        max-width: 800px;
      }

      .hlx-col-header:first-child,
      .hlx-col:first-child {
        border-left: 1px solid black;
      }

      .hlx-row.hlx-lcp-resource {
        background-color: lightgreen;
      }

      .hlx-row.hlx-lcp-event {
        background-color: lightcoral;
      }

      .hlx-before-100kb {
        background-color: grey;
      }

      .hlx-marker {
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);
  };

  const display = (report) => {
    const u = new URL(window.location.href);
    const host = u.hostname;

    const container = document.createElement('div');
    container.classList.add('hlx-container');
    container.id = 'hlx-report-grid';
    const grid = document.createElement('div');

    const head = document.createElement('div');
    head.classList.add('hlx-row');
    head.innerHTML = `
        <div class="hlx-col-header hlx-small">Index</div>
        <div class="hlx-col-header hlx-small">Start time (s)</div>
        <div class="hlx-col-header hlx-large">URL</div>
        <div class="hlx-col-header hlx-small">Type</div>
        <div class="hlx-col-header hlx-small">Transfer size</div>
        <div class="hlx-col-header hlx-small">Accumulated transfer size</div>
        <div class="hlx-col-header hlx-small">Duration</div>
        <div class="hlx-col-header hlx-large">Penalties</div>
        <div class="hlx-col-header hlx-xlarge">Performance resource entry</div>
      </div>
    `;
    grid.appendChild(head);

    const body = document.createElement('div');
    let index = 0;
    report.forEach((row) => {
      if (row['Row Type'] === 'marker') {
        body.innerHTML += `
          <div class="hlx-row hlx-marker ${row.Type === 'LCP event' ? 'hlx-lcp-event' : ''}">
            <div class="hlx-col hlx-small"></div>
            <div class="hlx-col hlx-small"></div>
            <div class="hlx-col hlx-large"></div>
            <div class="hlx-col hlx-small">${row.Type}</div>
            <div class="hlx-col hlx-small"></div>
            <div class="hlx-col hlx-small">${row['Accumulated transfer size'] ? row['Accumulated transfer size'] : ''}</div>
            <div class="hlx-col hlx-small"></div>
            <div class="hlx-col hlx-large"></div>
            <div class="hlx-col hlx-xlarge"></div>
          </row>
        `;
      } else {
        body.innerHTML += `
          <div class="hlx-row ${row['LCP Resource'] ? 'hlx-lcp-resource' : ''} ${row['Before 100kb'] ? 'hlx-before-100kb' : ''}">
            <div class="hlx-col hlx-small">${index}</div>
            <div class="hlx-col hlx-small">${row['Start time']}</div>
            <div class="hlx-col hlx-large"><a href="${row.url}" target="_blank">${row.Host === host ? row.Path : row.url}</a></div>
            <div class="hlx-col hlx-small">${row.Type}</div>
            <div class="hlx-col hlx-small">${row['Transfer size']}</div>
            <div class="hlx-col hlx-small">${row['Accumulated transfer size']}</div>
            <div class="hlx-col hlx-small">${row.Duration}</div>
            <div class="hlx-col hlx-large">${row.Penalties}</div>
            <div class="hlx-col hlx-xlarge"><a href="#" data-entry="${encodeURIComponent(JSON.stringify(row.entry, null, 2))}" data-extra="${encodeURIComponent(JSON.stringify(row.extra, null, 2))}">View</a></div>
          </row>
        `;
        index += 1;
      }
    });

    grid.appendChild(body);
    container.appendChild(grid);
    document.body.prepend(container);

    const jsonLinks = document.querySelectorAll('[data-entry]');
    jsonLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.innerHTML === 'Hide') {
          e.target.innerHTML = 'View';
          e.target.parentElement.querySelector('pre').remove();
        } else {
          const entry = JSON.parse(decodeURIComponent(e.target.getAttribute('data-entry')));
          const extra = JSON.parse(decodeURIComponent(e.target.getAttribute('data-extra')));
          const pre = document.createElement('pre');
          pre.innerHTML = jsonSyntaxHighlight({ ...entry, ...extra });
          e.target.parentElement.appendChild(pre);
          e.target.innerHTML = 'Hide';
        }
      });
    });
  };

  const report = async () => {
    const getLCP = async () => new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1]; // Use the latest LCP candidate
        console.log('Found LCP', lastEntry);
        resolve(lastEntry);
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    });

    const LCP = await getLCP();

    const resources = performance.getEntriesByType('resource');
    const entries = [];
    let transfered = 0;
    let done1KB = false;
    let doneLCP = false;
    resources.forEach((entry) => {
      // console.log(entry);
      const u = new URL(entry.name);

      const penalties = [];
      const tcpHandshake = entry.connectEnd - entry.connectStart;
      if (tcpHandshake > 0) {
        penalties.push(`TCP handshake (${formatTimeMS(tcpHandshake)})`);
      }

      const dnsLookup = entry.domainLookupEnd - entry.domainLookupStart;
      if (dnsLookup > 0) {
        penalties.push(`DNS lookup (${formatTimeMS(dnsLookup)})`);
      }

      if (entry.nextHopProtocol !== 'h2' && entry.nextHopProtocol !== 'h3') {
        penalties.push(`Next Hop Protocol value not h2 nor h3: '${entry.nextHopProtocol}'`);
      }

      if (entry.renderBlockingStatus !== 'non-blocking') {
        penalties.push(`Render blocking: ${entry.renderBlockingStatus}`);
      }

      transfered += entry.transferSize;

      entries.push({
        // 'Start time (ms)': formatTimeMS(entry.startTime),
        'Start time': `${formatTime(entry.startTime / 1000)}s`,
        url: entry.name,
        Host: u.hostname,
        Path: u.pathname,
        Type: entry.initiatorType,
        'Transfer size': formatSizeKiB(entry.transferSize),
        'Accumulated transfer size': formatSizeKiB(transfered),
        // 'Encoded body size': formatSizeKiB(entry.encodedBodySize),
        // 'Decoded body size': formatSizeKiB(entry.decodedBodySize),
        'Local caches hit': (entry.transferSize === 0),
        Duration: formatTimeMS(entry.duration),
        // 'Request time': formatTimeMS(entry.responseStart - entry.requestStart),
        // 'TCP handshake time': formatTimeMS(tcpHandshake),
        // 'DNS lookup time': formatTimeMS(entry.domainLookupEnd - entry.domainLookupStart),
        // 'Redirection time': formatTimeMS(entry.redirectEnd - entry.redirectStart),
        // 'TLS negotiation time': formatTimeMS(entry.requestStart - entry.secureConnectionStart),
        // 'Time to fetch (without redirects)': formatTimeMS(entry.responseEnd - entry.fetchStart),
        // 'Next Hop protocol': (entry.nextHopProtocol),
        // 'Render Blocking Status': entry.renderBlockingStatus,
        Penalties: penalties.join(', '),
        'Before LCP': !doneLCP,
        'Before 100kb': !done1KB,
        'LCP Resource': entry.name === LCP.url,
        'Row Type': 'resource',
        entry,
        extra: {
          'Request time': formatTimeMS(entry.responseStart - entry.requestStart),
          'DNS lookup time': formatTimeMS(entry.domainLookupEnd - entry.domainLookupStart),
          'Redirection time': formatTimeMS(entry.redirectEnd - entry.redirectStart),
          'TLS negotiation time': formatTimeMS(entry.requestStart - entry.secureConnectionStart),
          'Time to fetch (without redirects)': formatTimeMS(entry.responseEnd - entry.fetchStart),
        },
      });

      if (transfered >= 100000 && !done1KB) {
        // 100kb rules
        entries.push({
          Type: '100kb rule',
          'Row Type': 'marker',
        });
        done1KB = true;
      }

      if (entry.name === LCP.url) {
        entries.push({
          Type: 'LCP resource',
          'Row Type': 'marker',
        });
      }

      if (entry.startTime >= LCP.startTime && !doneLCP) {
        entries.push({
          Type: 'LCP event',
          'Row Type': 'marker',
        });
        doneLCP = true;
      }
    });
    entries.push({
      Type: 'Total transfered',
      'Accumulated transfer size': formatSizeKiB(transfered),
      'Row Type': 'marker',
    });

    // console.table(entries);
    return entries;
  };

  const main = async () => {
    cleanup();
    setup();
    const r = await report();
    display(r);
  };

  main();
})();
