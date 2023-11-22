(() => {
  /* display */
  const formatTime = (x) => (x !== 0 ? (Math.round(x * 100) / 100) : 0);
  const formatSize = (x) => (x !== 0 ? (Math.round(x / 1000)) : 0);
  const formatTimeMS = (x) => `${formatTime(x)}ms`;

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
        --hlx-color-100kb: rgba(150, 0, 0, 0.1);

        --hlx-color-link: white;
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

      .hlx-views {
        padding: 10px 2px;
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
    
      .hlx-center {
        text-align: center;
      }

      .hlx-xs {
        max-width: 35px;
      }
      
      .hlx-s {
        max-width: 90px;
      }

      .hlx-m {
        width: 10%;
      }

      .hlx-l {
        min-width: 20%;
      }

      .hlx-xl {
        min-width: 30%;
      }

      .hlx-before-100kb {
        background-color: var(--hlx-color-100kb);
      }

      .hlx-tbt {
        color: var(--hlx-color-tbt);
      }

      .hlx-badge {
        cursor: default;
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

      .hlx-mark {
        color: var(--hlx-color-marker);
      }
      
      .hlx-mark .hlx-badge {
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

  const applyFilter = (type, show, el) => {
    const rows = el.querySelectorAll(`.${type}`);
    rows.forEach((row) => {
      if (show) {
        row.classList.remove('hlx-hidden');
      } else {
        row.classList.add('hlx-hidden');
      }
    });
  };

  const generateGrid = (
    data,
    cols = ['index', 'start', 'end', 'url', 'type', 'size', 'totalSize', 'duration', 'preview', 'details'],
    defaultFilters = ['resource', 'lcp', 'tbt', 'cls', 'paint', 'mark'],
  ) => {
    const grid = document.createElement('div');
    grid.classList.add('hlx-grid');

    const head = document.createElement('div');
    head.classList.add('hlx-row');
    head.innerHTML = '';
    if (cols.includes('index')) head.innerHTML += '<div class="hlx-col-header hlx-xs hlx-right">#</div>';
    if (cols.includes('start')) head.innerHTML += '<div class="hlx-col-header hlx-s hlx-right">Start</div>';
    if (cols.includes('end')) head.innerHTML += '<div class="hlx-col-header hlx-s hlx-right">End</div>';
    if (cols.includes('url')) head.innerHTML += '<div class="hlx-col-header hlx-xl">URL</div>';
    if (cols.includes('type')) head.innerHTML += '<div class="hlx-col-header hlx-m hlx-center">Type</div>';
    if (cols.includes('size')) head.innerHTML += '<div class="hlx-col-header hlx-s hlx-right">Size (KiB)</div>';
    if (cols.includes('totalSize')) head.innerHTML += '<div class="hlx-col-header hlx-s hlx-right">Total (KiB)</div>';
    if (cols.includes('duration')) head.innerHTML += '<div class="hlx-col-header hlx-s hlx-right">Duration</div>';
    if (cols.includes('preview')) head.innerHTML += '<div class="hlx-col-header hlx-m hlx-center">Info</div>';
    if (cols.includes('details')) head.innerHTML += '<div class="hlx-col-header hlx-m">Details</div>';

    grid.appendChild(head);

    const current = new URL(window.location.href);
    const host = current.hostname;

    let index = 0;
    data.forEach((row) => {
      const {
        url, type, size, totalSize, duration, details, start, end, name, before100kb, entryType,
      } = row;
      let urlDislay = url;
      if (url) {
        const u = new URL(url);
        if (u.hostname === host) {
          urlDislay = u.pathname;
        }
      }
      const classes = [];
      if (type === 'LCP') {
        classes.push('hlx-lcp');
      } else if (type === 'CLS') {
        classes.push('hlx-cls');
      } else if (type === 'TBT') {
        classes.push('hlx-tbt');
      } else if (type === 'paint') {
        classes.push('hlx-paint');
      } else if (type === 'mark') {
        classes.push('hlx-mark');
      } else {
        classes.push('hlx-resource');
      }

      if (before100kb) {
        classes.push('hlx-before-100kb');
      }

      if (!defaultFilters.includes(entryType)) {
        classes.push('hlx-hidden');
      }

      const rowElement = document.createElement('div');
      rowElement.className = `hlx-row ${classes.join(' ')}`;
      rowElement.innerHTML = '';
      if (cols.includes('index')) rowElement.innerHTML += `<div class="hlx-col hlx-xs hlx-right hlx-col-index">${index}</div>`;
      if (cols.includes('start')) rowElement.innerHTML += `<div class="hlx-col hlx-s hlx-right hlx-col-start">${formatTime(start)}</div>`;
      if (cols.includes('end')) rowElement.innerHTML += `<div class="hlx-col hlx-s hlx-right hlx-col-end">${formatTime(end)}</div>`;
      if (cols.includes('url')) rowElement.innerHTML += `<div class="hlx-col hlx-xl hlx-col-url">${url ? `<a href="${url}" target="_blank">${urlDislay}</a>` : ''}</div>`;
      if (cols.includes('type')) rowElement.innerHTML += `<div class="hlx-col hlx-m hlx-center hlx-col-type"><span title="${name || ''}" class="hlx-badge">${type === 'mark' || type === 'paint' ? name : type}</span></div>`;
      if (cols.includes('size')) rowElement.innerHTML += `<div class="hlx-col hlx-s hlx-right hlx-col-size">${size !== undefined ? formatSize(size) : ''}</div>`;
      if (cols.includes('totalSize')) rowElement.innerHTML += `<div class="hlx-col hlx-s hlx-right hlx-col-totalSize">${totalSize !== undefined ? formatSize(totalSize) : ''}</div>`;
      if (cols.includes('duration')) rowElement.innerHTML += `<div class="hlx-col hlx-s hlx-right hlx-col-duration">${duration !== undefined ? formatTime(duration) : ''}</div>`;
      if (cols.includes('preview')) rowElement.innerHTML += `<div class="hlx-col hlx-m hlx-center hlx-col-preview">${details?.preview ? `${details.preview}` : ''}</div>`;
      if (cols.includes('details')) rowElement.innerHTML += `<div class="hlx-col hlx-m hlx-wrap hlx-col-details"><a href="#" data-details="${encodeURIComponent(JSON.stringify(details, null, 2))}">Details</a></div>`;

      grid.appendChild(rowElement);
      index += 1;
    });

    grid.querySelectorAll('[data-details]').forEach((link) => {
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

    return grid;
  };

  const generateFilters = (list = ['resource', 'lcp', 'tbt', 'cls', 'paint', 'mark'], defaults = ['resource', 'lcp', 'tbt', 'cls', 'paint', 'mark']) => {
    const filters = document.createElement('div');
    filters.classList.add('hlx-filters');
    filters.innerHTML = '';
    if (list.includes('resource')) {
      filters.innerHTML += `<div class="hlx-resource"><span class="hlx-badge"><input type="checkbox" ${defaults.includes('resource') ? 'checked' : ''}>Resource</span></div>`;
    }
    if (list.includes('lcp')) {
      filters.innerHTML += `<div class="hlx-lcp"><span class="hlx-badge"><input type="checkbox" ${defaults.includes('lcp') ? 'checked' : ''}>LCP</span></div>`;
    }
    if (list.includes('tbt')) {
      filters.innerHTML += `<div class="hlx-tbt"><span class="hlx-badge"><input type="checkbox" ${defaults.includes('tbt') ? 'checked' : ''}>TBT</span></div>`;
    }
    if (list.includes('cls')) {
      filters.innerHTML += `<div class="hlx-cls"><span class="hlx-badge"><input type="checkbox" ${defaults.includes('cls') ? 'checked' : ''}>CLS</span></div>`;
    }
    if (list.includes('paint')) {
      filters.innerHTML += `<div class="hlx-paint"><span class="hlx-badge"><input type="checkbox" ${defaults.includes('paint') ? 'checked' : ''}>paint</span></div>`;
    }
    if (list.includes('mark')) {
      filters.innerHTML += `<div class="hlx-mark"><span class="hlx-badge"><input type="checkbox" ${defaults.includes('mark') ? 'checked' : ''}>mark</span></div>`;
    }

    filters.querySelectorAll('.hlx-filters input').forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        const type = checkbox.parentElement.parentElement.classList[0];
        applyFilter(type, checkbox.checked, document.querySelector('.hlx-grid'));
      });
    });

    return filters;
  };

  const VIEWS = {
    LCP: {
      filters: ['resource', 'lcp', 'mark', 'paint'],
      defaultFilters: ['resource', 'lcp', 'paint'],
      cols: ['index', 'start', 'url', 'type', 'size', 'totalSize', 'preview'],
      data: (d) => {
        const sorted = VIEWS.all.data(d);
        const ret = [];
        for (let i = 0; i < sorted.length; i += 1) {
          const entry = sorted[i];
          ret.push(entry);
          if (entry.name === 'first-contentful-paint') {
            break;
          }
        }
        return ret;
      },
    },
    CLS: {
      filters: ['resource', 'cls', 'mark', 'paint'],
      defaultFilters: ['resource', 'cls'],
      cols: ['end', 'url', 'type', 'preview'],
      data: (data) => {
        console.log('CLS data', data);
        const ret = data.map((d) => {
          delete d.before100kb;
          return d;
        });
        ret.sort((a, b) => a.end - b.end);
        return ret;
      },
    },
    all: {
      filters: undefined,
      cols: undefined,
      defaultFilters: undefined,
      data: (data) => {
        let ret = data.map((d) => d);

        ret.sort((a, b) => a.start - b.start);

        let totalSize = 0;

        ret = ret.map((entry) => {
          const { size } = entry;
          if (size !== undefined) {
            totalSize += size;
            entry.totalSize = totalSize;
          }
          entry.before100kb = Math.round(totalSize) < 101000;
          return entry;
        });

        return ret;
      },
    },
  };

  const display = (data) => {
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

    container.querySelector('.hlx-report-close').addEventListener('click', () => {
      container.remove();
    });

    document.body.prepend(container);

    const views = document.createElement('div');
    views.classList.add('hlx-views');
    views.innerHTML = `
      <label><input type="radio" name="view" value="LCP">LCP Focus</label>
      <label><input type="radio" name="view" value="CLS" >CLS Focus</label>
      <label><input type="radio" name="view" value="all" checked>View All</label>
    `;

    container.appendChild(views);

    const filters = generateFilters(VIEWS.all.filters, VIEWS.all.defaultFilters);
    container.appendChild(filters);

    const grid = generateGrid(VIEWS.all.data(data), VIEWS.all.cols, VIEWS.all.defaultFilters);
    container.appendChild(grid);

    views.querySelectorAll('input').forEach((input) => {
      input.addEventListener('change', (ev) => {
        const view = VIEWS[ev.target.value];

        container.querySelector('.hlx-filters').remove();
        container.querySelector('.hlx-grid').remove();

        const f = generateFilters(view.filters, view.defaultFilters);
        container.appendChild(f);

        const g = generateGrid(view.data(data), view.cols, view.defaultFilters);
        container.appendChild(g);
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
        start: startTime,
        end: responseEnd,
        url: name,
        type: initiatorType,
        entryType: 'resource',
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
      url, startTime,
    } = entry;
    const name = length === 1 ? 'LCP' : `LCP Candidate ${index + 1} / ${length}`;
    console.log('LCP element', entry.element, entry);
    const tag = entry.element?.tagName;
    return {
      start: startTime,
      name,
      url,
      type: 'LCP',
      // duration,
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
      start: startTime,
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
      start: startTime,
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
      start: startTime,
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
    const ret = {
      start: startTime,
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

    return data.map((entry) => {
      const {
        start, end, name, url, type, duration, details, entryType, size,
      } = entry;
      const ret = {};

      if (start) ret.start = Math.round(start); else ret.start = 0;
      if (end) ret.end = Math.round(end); else ret.end = ret.start;
      if (name) ret.name = name;
      if (url) ret.url = url;
      if (type) ret.type = type;
      if (entryType) ret.entryType = entryType; else ret.entryType = type.toLowerCase();
      if (duration !== undefined) ret.duration = Math.round(duration);
      if (size !== undefined) ret.size = size;

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
