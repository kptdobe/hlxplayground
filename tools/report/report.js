(() => {
  /* display */
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

  const setupStyles = () => {
    const style = document.createElement('style');
    style.id = 'hlx-report-style';
    style.innerHTML = `
      :root {
        --hlx-color-dialog: rgba(26, 26, 26, 1);
        --hlx-color-100kb: rgba(255, 255, 255, 0.1);

        --hlx-color-link: #035fe6;
        --hlx-color-hover: #136ff6;

        --hlx-color-tbt: #eb7655;
        --hlx-color-lcp: #279766;
        --hlx-color-paint: #b73;
        --hlx-color-cls: rgba(231, 196, 104, 0.7);
        --hlx-color-marker: #4fc0d2;
      }

      .hlx-container {
        position: fixed;
        inset: 0;
        z-index: 99999;
        overflow-y: scroll;
        
        background-color: var(--hlx-color-dialog);
        margin: 20px;

        font-family: sans-serif;
        font-size: 14px;
        color: white;
        border-radius: 6px;
        line-height: 1.8;
      }

      .hlx-container .hlx-header {
        padding: 10px;
        background-color: var(--hlx-color-dialog);
      }

      .hlx-container .hlx-header h1 {
        font-size: 20px;
        line-height: 1;
        margin-bottom: 10px;
        font-weight: bold;
        }
    
      .hlx-container .hlx-header .hlx-report-close {
        position: absolute;
        top: 10px;
        right: 10px;
        color: white;
        background-color: transparent;
        padding: 4px;
      }

      .hlx-container a:any-link {
        color: var(--hlx-color-link);
      }

      .hlx-container a:hover {
        text-decoration: underline;
        color: var(--hlx-color-hover);
      }

      .hlx-filters {
        display: flex;
        gap: 14px;
        margin-left: 6px;
      }

      .hlx-filters input {
        border: 0;
        padding: 0;
        margin: 0 8px 0 2px;
        accent-color: white;
      }

      .hlx-row.hlx-hidden {
        display: none;
      }

      .hlx-grid {
        margin: 10px;
      }

      .hlx-row {
        display: flex;
        flex-wrap: wrap;
        border-top: 1px solid black;
      }

      .hlx-container > div > .hlx-row:first-of-type {
        font-weight: bold;
        font-size: 15px;
      }

      .hlx-row:last-child {
        border-bottom: 1px solid black;
      }
      
      .hlx-col-header,
      .hlx-col {
        flex: 1;
        padding: 2px 5px;
      }

      .hlx-col {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .hlx-col.hlx-wrap pre {
        scroll: auto;
        margin: 0;
      }

      .hlx-col.hlx-wrap pre span {
        white-space: normal;
      }

      .hlx-right {
        text-align: right;
      }

      .hlx-xs {
        max-width: 30px;
      }

      .hlx-l {
        min-width: 20%;
      }

      .hlx-xl {
        min-width: 25%;
      }

      .hlx-before-100kb {
        background-color: var(--hlx-color-100kb);
      }

      .hlx-tbt {
        color: var(--hlx-color-tbt);
      }

      .hlx-tbt .hlx-badge {
        background-color: var(--hlx-color-tbt);
        color: white;
        padding: 4px 8px;
        text-align: center;
        border-radius: 5px;
        font-weight: bold;
      }

      .hlx-cls {
        color: var(--hlx-color-cls);
      }

      .hlx-cls .hlx-badge {
        background-color: var(--hlx-color-cls);
        color: white;
        padding: 4px 8px;
        text-align: center;
        border-radius: 5px;
        font-weight: bold;
      }

      .hlx-lcp {
        color: var(--hlx-color-lcp);
      }

      .hlx-lcp .hlx-badge {
        background-color: var(--hlx-color-lcp);
        color: white;
        padding: 4px 8px;
        text-align: center;
        border-radius: 5px;
        font-weight: bold;
      }

      .hlx-paint {
        color: var(--hlx-color-paint);
      }

      .hlx-paint .hlx-badge {
        background-color: var(--hlx-color-paint);
        color: white;
        padding: 4px 8px;
        text-align: center;
        border-radius: 5px;
        font-weight: bold;
      }

      .hlx-marker {
        color: var(--hlx-color-marker);
      }
      
      .hlx-marker .hlx-badge {
        background-color: var(--hlx-color-marker);
        color: white;
        padding: 4px 8px;
        text-align: center;
        border-radius: 5px;
        font-weight: bold;
      }

      .hlx-col-details pre {
        color: white;
      }

      .hlx-penalty {
        cursor: default;
      }

    `;
    document.head.appendChild(style);
  };

  const display = (report) => {
    const current = new URL(window.location.href);
    const host = current.hostname;

    const container = document.createElement('div');
    container.classList.add('hlx-container');
    container.id = 'hlx-report-dialog';

    const header = document.createElement('div');
    header.classList.add('hlx-header');
    header.innerHTML = `
      <h1>Performance report</h1>
      <button class="hlx-report-close">X</button>
    `;
    container.appendChild(header);

    const filters = document.createElement('div');
    filters.classList.add('hlx-filters');
    filters.innerHTML = `
      <div class="hlx-resource"><span class="hlx-badge"><input type="checkbox" checked>Resource</span></div>
      <div class="hlx-lcp"><span class="hlx-badge"><input type="checkbox" checked>LCP</span></div>
      <div class="hlx-tbt"><span class="hlx-badge"><input type="checkbox" checked>TBT</span></div>
      <div class="hlx-cls"><span class="hlx-badge"><input type="checkbox" checked>CLS</span></div>
      <div class="hlx-paint"><span class="hlx-badge"><input type="checkbox" checked>paint</span></div>
      <div class="hlx-marker"><span class="hlx-badge"><input type="checkbox" checked>Mark</span></div>
    `;
    container.appendChild(filters);

    const grid = document.createElement('div');
    grid.classList.add('hlx-grid');

    const head = document.createElement('div');
    head.classList.add('hlx-row');
    head.innerHTML = `
      <div class="hlx-col-header hlx-xs"></div>
      <div class="hlx-col-header hlx-right hlx-s">Start time</div>
      <div class="hlx-col-header hlx-l">URL</div>
      <div class="hlx-col-header hlx-s">Type</div>
      <div class="hlx-col-header hlx-s">Size</div>
      <div class="hlx-col-header hlx-s">Total size</div>
      <div class="hlx-col-header hlx-s">Duration</div>
      <div class="hlx-col-header hlx-s">Info</div>
      <div class="hlx-col-header hlx-xl">Details</div>
    `;
    grid.appendChild(head);

    container.appendChild(grid);
    document.body.prepend(container);
    let index = 0;
    let before100kb = true;
    report.forEach((row) => {
      let urlDislay = row.url;
      if (row.url) {
        const u = new URL(row.url);
        if (u.hostname === host) {
          urlDislay = u.pathname;
        }
      }
      const classes = [];
      if (row.type === 'LCP') {
        classes.push('hlx-lcp');
      } else if (row.type === 'CLS') {
        classes.push('hlx-cls');
      } else if (row.type === 'TBT') {
        classes.push('hlx-tbt');
      } else if (row.type === 'paint') {
        classes.push('hlx-paint');
      } else if (row.type === 'mark') {
        classes.push('hlx-marker');
      } else {
        classes.push('hlx-resource');
      }

      if (before100kb && row.totalSize !== undefined && row.totalSize > 100000) {
        before100kb = false;
      }

      if (before100kb) {
        classes.push('hlx-before-100kb');
      }

      const rowElement = document.createElement('div');
      rowElement.className = `hlx-row ${classes.join(' ')}`;
      rowElement.innerHTML += `
        <div class="hlx-col hlx-xs hlx-right hlx-col-index">${index}</div>
        <div class="hlx-col hlx-s hlx-right hlx-col-time">${formatTime(row.time)}</div>
        <div class="hlx-col hlx-l hlx-col-url">${row.url ? `<a href="${row.url}" target="_blank">${urlDislay}</a>` : ''}</div>
        <div class="hlx-col hlx-s hlx-col-type"><span title="${row.name || ''}" class="hlx-badge">${row.type}</span></div>
        <div class="hlx-col hlx-s hlx-col-size">${row.size !== undefined ? formatSizeKiB(row.size) : ''}</div>
        <div class="hlx-col hlx-s hlx-col-totalSize">${row.totalSize !== undefined ? formatSizeKiB(row.totalSize) : ''}</div>
        <div class="hlx-col hlx-s hlx-col-duration">${row.duration !== undefined ? formatTime(row.duration) : ''}</div>
        <div class="hlx-col hlx-s hlx-col-preview">${row.details?.preview ? `${row.details.preview}` : ''}</div>
        <div class="hlx-col hlx-xl hlx-wrap hlx-col-details"><a href="#" data-details="${encodeURIComponent(JSON.stringify(row.details, null, 2))}">Details</a></div>
      `;
      grid.appendChild(rowElement);
      index += 1;
    });

    container.querySelectorAll('[data-details]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.innerHTML === 'Hide') {
          e.target.innerHTML = 'Details';
          e.target.parentElement.querySelector('pre').remove();
        } else {
          const details = JSON.parse(decodeURIComponent(e.target.getAttribute('data-details')));
          const pre = document.createElement('pre');
          pre.innerHTML = jsonSyntaxHighlight({ ...details });
          e.target.parentElement.appendChild(pre);
          e.target.innerHTML = 'Hide';
        }
      });
    });

    container.querySelector('.hlx-report-close').addEventListener('click', () => {
      container.remove();
    });

    container.querySelectorAll('.hlx-filters input').forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        const type = checkbox.parentElement.parentElement.classList[0];
        const rows = grid.querySelectorAll(`.${type}`);
        rows.forEach((row) => {
          if (checkbox.checked) {
            row.classList.remove('hlx-hidden');
          } else {
            row.classList.add('hlx-hidden');
          }
        });
      });
    });
  };

  /* report construction */
  const getEntries = async (type) => new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      resolve([]);
    }, 2000);

    const pols = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (timeout) window.clearTimeout(timeout);
      pols.disconnect();
      resolve(entries);
    });
    pols.observe({ type, buffered: true });
  });

  const reportResources = async (data) => {
    const entries = await getEntries('resource');
    entries.forEach((entry) => {
      const {
        name,
        initiatorType,
        startTime,
        duration,
        transferSize,
        connectStart,
        connectEnd,
        domainLookupStart,
        domainLookupEnd,
        renderBlockingStatus,
        responseEnd,
      } = entry;

      let preview = null;

      const tcpHandshake = connectEnd - connectStart;
      const dnsLookup = domainLookupEnd - domainLookupStart;
      if (tcpHandshake > 0 || dnsLookup > 0 || renderBlockingStatus !== 'non-blocking') {
        const title = [];
        if (tcpHandshake > 0) title.push(`TCP handshake: ${formatTimeMS(tcpHandshake)}`);
        if (dnsLookup > 0) title.push(`DNS lookup: ${formatTimeMS(dnsLookup)}`);
        if (renderBlockingStatus !== 'non-blocking') title.push(`Render blocking: ${renderBlockingStatus}`);
        preview = `<span class="hlx-penalty" title="${title.join('\n')}">⚠️</span>`;
      }

      data.push({
        time: startTime,
        start: startTime,
        end: responseEnd,
        url: name,
        type: initiatorType,
        duration,
        size: transferSize,
        details: {
          preview: preview || null,
          entry,
        },
      });
    });
  };

  const LCPToData = (entry, index, length) => {
    const {
      url, startTime, size, // duration,
    } = entry;
    const name = length === 1 ? 'LCP' : `LCP Candidate ${index + 1} / ${length}`;
    console.log('LCP element', entry.element, entry);
    const tag = entry.element?.tagName;
    return {
      time: startTime,
      name,
      url,
      type: 'LCP',
      // duration,
      size,
      details: {
        preview: tag ? `&lt;${tag.toLowerCase()}&gt;` : null,
        id: entry.id,
        tag,
        renderTime: entry.renderTime,
        outerHTML: entry.element?.outerHTML,
      },
    };
  };

  const CLSToData = (entry, index, length) => {
    const {
      startTime, value,
    } = entry;
    const name = length === 1 ? 'CLS' : `CLS ${index + 1} / ${length}`;
    const sources = entry.sources.map((source) => {
      const to = source.currentRect;
      const from = source.previousRect;
      console.log('CLS on element', source.node, entry);
      return {
        tagName: source.node?.tagName || 'unknown',
        className: source.node?.className || 'unknown',
        outerHTML: source.node?.outerHTML,
        from: `from: ${from.top} ${from.right} ${from.bottom} ${from.left}`,
        to: `to:   ${to.top} ${to.right} ${to.bottom} ${to.left}`,
      };
    });
    return {
      time: startTime,
      name,
      type: 'CLS',
      details: {
        preview: value ? value.toFixed(3) : null,
        value,
        sources,
      },
    };
  };

  const TBTToData = (entry, index, length) => {
    const {
      startTime, duration,
    } = entry;
    const name = length === 1 ? 'TBT' : `TBT ${index + 1} / ${length}`;
    return {
      time: startTime,
      name,
      type: 'TBT',
      duration,
      details: { entry },
    };
  };

  const paintToData = (entry) => {
    const {
      name, startTime,
    } = entry;
    return {
      time: startTime,
      name,
      type: 'paint',
      details: { entry },
    };
  };

  const markToData = (entry) => {
    const {
      name, startTime,
    } = entry;
    console.log('Mark', entry);
    const ret = {
      time: startTime,
      name,
      type: 'mark',
    };

    if (entry.detail) {
      ret.details = {
        ...entry.detail,
      };
    }
    return ret;
  };

  const reportMarker = async (data, type, entryToData) => {
    const entries = await getEntries(type);
    if (entries.length === 1) {
      data.push(entryToData(entries[0], 1, 1));
    } else {
      entries.forEach((entry, index) => {
        data.push(entryToData(entry, index, entries.length));
      });
    }
  };

  const getPerformanceReport = async () => {
    const data = [];

    await Promise.all([
      reportResources(data),
      reportMarker(data, 'largest-contentful-paint', LCPToData),
      reportMarker(data, 'layout-shift', CLSToData),
      reportMarker(data, 'longtask', TBTToData),
      reportMarker(data, 'paint', paintToData),
      reportMarker(data, 'mark', markToData),
    ]);

    data.sort((a, b) => a.time - b.time);
    let totalSize = 0;

    return data.map((entry) => {
      const {
        time, name, url, type, duration, size, details,
      } = entry;
      const ret = {};

      if (time) ret.time = Math.round(time); else ret.time = 0;
      if (name) ret.name = name;
      if (url) ret.url = url;
      if (type) ret.type = type;
      if (duration !== undefined) ret.duration = Math.round(duration);

      if (size !== undefined) {
        totalSize += size;
        ret.size = size;
        ret.totalSize = totalSize;
      }
      ret.details = details;
      return ret;
    });
  };

  const cleanup = () => {
    console.clear();

    const s = document.getElementById('hlx-report-style');
    if (s) s.remove();

    const g = document.getElementById('hlx-report-dialog');
    if (g) g.remove();
  };

  const main = async () => {
    cleanup();
    setupStyles();
    const data = await getPerformanceReport();
    // console.table(data);
    display(data);
  };

  main();
})();
