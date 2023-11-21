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
        --hlx-color-grid: rgba(26, 26, 26, 1);
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
        
        background-color: var(--hlx-color-grid);
        margin: 20px;

        font-family: sans-serif;
        font-size: 14px;
        color: white;
      }

      .hlx-container a:any-link {
        color: var(--hlx-color-link);
      }

      .hlx-container a:hover {
        text-decoration: underline;
        color: var(--hlx-color-hover);
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
        border-right: 1px solid black;
        padding: 5px;
      }

      .hlx-col {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .hlx-col.hlx-wrap pre span {
        white-space: normal;
      }

      .hlx-small {
        max-width: 120px;
      }

      .hlx-large {
        max-width: 400px;
      }

      .hlx-xlarge {
        max-width: 100%;
      }

      .hlx-col-header:first-child,
      .hlx-col:first-child {
        border-left: 1px solid black;
      }

      .hlx-before-100kb {
        background-color: var(--hlx-color-100kb);
      }

      .hlx-tbt .hlx-col-index,
      .hlx-tbt .hlx-col-time,
      .hlx-tbt .hlx-col-name,
      .hlx-tbt .hlx-col-duration {
        color: var(--hlx-color-tbt);
      }

      .hlx-tbt .hlx-col-type .hlx-badge {
        background-color: var(--hlx-color-tbt);
        color: white;
        padding: 4px 8px;
        text-align: center;
        border-radius: 5px;
        font-weight: bold;
      }

      .hlx-cls .hlx-col-index,
      .hlx-cls .hlx-col-time,
      .hlx-cls .hlx-col-name,
      .hlx-cls .hlx-col-type,
      .hlx-cls .hlx-col-duration {
        color: var(--hlx-color-cls);
      }

      .hlx-cls .hlx-col-type .hlx-badge {
        background-color: var(--hlx-color-cls);
        color: white;
        padding: 4px 8px;
        text-align: center;
        border-radius: 5px;
        font-weight: bold;
      }

      .hlx-lcp .hlx-col-index,
      .hlx-lcp .hlx-col-time,
      .hlx-lcp .hlx-col-name,
      .hlx-lcp .hlx-col-size,
      .hlx-lcp .hlx-col-totalSize,
      .hlx-lcp .hlx-col-duration {
        color: var(--hlx-color-lcp);
      }

      .hlx-lcp .hlx-col-type .hlx-badge {
        background-color: var(--hlx-color-lcp);
        color: white;
        padding: 4px 8px;
        text-align: center;
        border-radius: 5px;
        font-weight: bold;
      }

      .hlx-paint .hlx-col-index,
      .hlx-paint .hlx-col-time,
      .hlx-paint .hlx-col-name,
      .hlx-paint .hlx-col-type,
      .hlx-paint .hlx-col-duration {
        color: var(--hlx-color-paint);
      }

      .hlx-paint .hlx-col-type .hlx-badge {
        background-color: var(--hlx-color-paint);
        color: white;
        padding: 4px 8px;
        text-align: center;
        border-radius: 5px;
        font-weight: bold;
      }

      .hlx-marker .hlx-col-index,
      .hlx-marker .hlx-col-time,
      .hlx-marker .hlx-col-name,
      .hlx-marker .hlx-col-duration {
        color: var(--hlx-color-marker);
      }
      
      .hlx-marker .hlx-col-type .hlx-badge {
        background-color: var(--hlx-color-marker);
        color: white;
        padding: 4px 8px;
        text-align: center;
        border-radius: 5px;
        font-weight: bold;
      }

    `;
    document.head.appendChild(style);
  };

  const display = (report) => {
    const current = new URL(window.location.href);
    const host = current.hostname;

    const container = document.createElement('div');
    container.classList.add('hlx-container');
    container.id = 'hlx-report-grid';
    const grid = document.createElement('div');

    const head = document.createElement('div');
    head.classList.add('hlx-row');
    head.innerHTML = `
        <div class="hlx-col-header hlx-small">Index</div>
        <div class="hlx-col-header hlx-small">Start time</div>
        <div class="hlx-col-header hlx-small">Name</div>
        <div class="hlx-col-header hlx-large">URL</div>
        <div class="hlx-col-header hlx-small">Type</div>
        <div class="hlx-col-header hlx-small">Size</div>
        <div class="hlx-col-header hlx-small">Accumuled size</div>
        <div class="hlx-col-header hlx-small">Duration</div>
        <div class="hlx-col-header hlx-xlarge">Details</div>
      </div>
    `;
    grid.appendChild(head);

    const body = document.createElement('div');
    grid.appendChild(body);
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
        <div class="hlx-col hlx-small hlx-col-index">${index}</div>
        <div class="hlx-col hlx-small hlx-col-time">${formatTimeMS(row.time)}</div>
        <div class="hlx-col hlx-small hlx-col-name">${row.name || ''}</div>
        <div class="hlx-col hlx-large hlx-col-url">${row.url ? `<a href="${row.url}" target="_blank">${urlDislay}</a>` : ''}</div>
        <div class="hlx-col hlx-small hlx-col-type"><span class="hlx-badge">${row.type}</span></div>
        <div class="hlx-col hlx-small hlx-col-size">${row.size !== undefined ? formatSizeKiB(row.size) : ''}</div>
        <div class="hlx-col hlx-small hlx-col-totalSize">${row.totalSize !== undefined ? formatSizeKiB(row.totalSize) : ''}</div>
        <div class="hlx-col hlx-small hlx-col-duration">${row.duration !== undefined ? formatTimeMS(row.duration) : ''}</div>
        <div class="hlx-col hlx-xlarge hlx-wrap hlx-col-details"><a href="#" data-details="${encodeURIComponent(JSON.stringify(row.details, null, 2))}">View</a></div>
      `;
      body.appendChild(rowElement);
      index += 1;
    });

    const jsonLinks = document.querySelectorAll('[data-details]');
    jsonLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.innerHTML === 'Hide') {
          e.target.innerHTML = 'View';
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
      } = entry;

      data.push({
        time: startTime,
        url: name,
        type: initiatorType,
        duration,
        size: transferSize,
        details: { entry },
      });
    });
  };

  const LCPToData = (entry, index, length) => {
    const {
      url, startTime, size, // duration,
    } = entry;
    const name = length === 1 ? 'LCP' : `LCP Candidate ${index + 1}`;
    console.log('LCP element', entry.element, entry);
    return {
      time: startTime,
      name,
      url,
      type: 'LCP',
      // duration,
      size,
      details: {
        id: entry.id,
        tag: entry.element.tagName,
        renderTime: entry.renderTime,
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
        from: `from: ${from.top} ${from.right} ${from.bottom} ${from.left}`,
        to: `to:   ${to.top} ${to.right} ${to.bottom} ${to.left}`,
      };
    });
    return {
      time: startTime,
      name,
      type: 'CLS',
      details: {
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
    console.log('mark', entry);
    return {
      time: startTime,
      name,
      type: 'mark',
      details: {
        ...entry.detail,
      },
    };
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
      ret.details = details;// JSON.stringify(details);
      return ret;
    });
  };

  const cleanup = () => {
    console.clear();

    const s = document.getElementById('hlx-report-style');
    if (s) s.remove();

    const g = document.getElementById('hlx-report-grid');
    if (g) g.remove();
  };

  const main = async () => {
    cleanup();
    setupStyles();
    const data = await getPerformanceReport();
    console.table(data);
    display(data);
  };

  main();
})();
