/* eslint-disable prefer-object-spread, no-console */
(() => {
  /* display */
  const formatTime = (x) => (x !== 0 ? Math.round(x) : 0);
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

  const getStyles = () => {
    const style = document.createElement('style');
    style.id = 'hlx-report-style';
    style.innerHTML = `
      :host {
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
        z-index: 9999999999;
        overflow-y: scroll;
        
        background-color: var(--hlx-color-dialog);
        margin: 1px;

        font-family: sans-serif;
        font-size: 14px;
        color: white;
      }

      .hlx-header {
        padding: 10px;
        background-color: var(--hlx-color-dialog);
      }

      .hlx-header h1 {
        font-size: 20px;
        line-height: 1;
        margin-bottom: 10px;
        font-weight: bold;
      }
    
      .hlx-header .hlx-report-close {
        position: absolute;
        top: 10px;
        right: 10px;
        color: white;
        background-color: transparent;
        padding: 4px;
      }

      a:any-link {
        color: var(--hlx-color-link);
      }

      a:hover {
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
        table-layout: fixed;
      }

      .hlx-row {
        border-top: 1px solid black;
        line-height: 1.8;
      }

      div > .hlx-row:first-of-type {
        font-weight: bold;
        font-size: 15px;
      }

      .hlx-row:last-child {
        border-bottom: 1px solid black;
      }

      .hlx-col-header {
        flex: 1;
        padding: 2px 0;
      }

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
        width: 15px;
      }
      
      .hlx-s {
        width: 30px;
      }

      .hlx-m {
        width: 10%;
      }

      .hlx-l {
        width: 20%;
      }

      .hlx-xl {
        max-width: 500px;
      }

      .hlx-before-100kb {
        background-color: var(--hlx-color-100kb);
      }

      .hlx-tbt {
        color: var(--hlx-color-tbt);
      }

      .hlx-badge,
      .hlx-penalty,
      .hlx-col-preview {
        cursor: default;
      }

      .hlx-ok {
        margin-right: 10px;
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

      .hlx-row.hlx-cls-end {
        border-bottom: 4px solid var(--hlx-color-cls);
      }

      .hlx-row.hlx-cls-start {
        border-top: 4px solid var(--hlx-color-cls);
      }
      
      .hlx-row.hlx-cls-start,
      .hlx-row.hlx-cls-end,
      .hlx-row.hlx-cls-suspect {
        border-left: 4px solid var(--hlx-color-cls);
        border-right: 4px solid var(--hlx-color-cls);
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

      .hlx-col-url a {
        display: inline;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .hlx-col-preview {
        max-width: 500px;
      }
    `;
    return style;
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
    defaultFilters = ['navigation', 'resource', 'lcp', 'tbt', 'cls', 'paint', 'mark'],
    sortedBy = 'start',
  ) => {
    const grid = document.createElement('table');
    grid.classList.add('hlx-grid');

    const head = document.createElement('tr');
    head.classList.add('hlx-row');
    head.innerHTML = '';
    if (cols.includes('index')) head.innerHTML += '<th class="hlx-col-header hlx-xs hlx-right">#</th>';
    if (cols.includes('start')) head.innerHTML += `<th class="hlx-col-header hlx-s hlx-right">Start${sortedBy === 'start' ? '&darr;' : ''}</th>`;
    if (cols.includes('end')) head.innerHTML += `<th class="hlx-col-header hlx-s hlx-right">End${sortedBy === 'end' ? '&darr;' : ''}</th>`;
    if (cols.includes('url')) head.innerHTML += '<th class="hlx-col-header hlx-xl">URL</th>';
    if (cols.includes('type')) head.innerHTML += '<th class="hlx-col-header hlx-m hlx-center">Type</th>';
    if (cols.includes('size')) head.innerHTML += '<th class="hlx-col-header hlx-s hlx-right">Size KB</th>';
    if (cols.includes('totalSize')) head.innerHTML += '<th class="hlx-col-header hlx-s hlx-right">Total KB</th>';
    if (cols.includes('duration')) head.innerHTML += '<th class="hlx-col-header hlx-s hlx-right">Duration</th>';
    if (cols.includes('preview')) head.innerHTML += '<th class="hlx-col-header hlx-m hlx-center">Info</th>';
    if (cols.includes('details')) head.innerHTML += '<th class="hlx-col-header hlx-m">Details</th>';

    grid.appendChild(head);

    const current = new URL(window.location.href);
    const host = current.hostname;

    let index = 0;
    data.forEach((row) => {
      const {
        // eslint-disable-next-line max-len
        url, type, size, totalSize, duration, details, start, end, name, before100kb, entryType, css,
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
      } else if (type === 'navigation') {
        classes.push('hlx-navigation');
      } else {
        classes.push('hlx-resource');
      }

      if (before100kb) {
        classes.push('hlx-before-100kb');
      }

      if (!defaultFilters.includes(entryType)) {
        classes.push('hlx-hidden');
      }

      if (css) {
        classes.push(css);
      }

      const filteredPreview = details?.preview ? details?.preview.replace(/</gm, '&lt;').replace(/>/gm, '&gt;').replace(/"/gm, '&quot;') : null;
      const preview = filteredPreview || details?.previewHTML || '';
      const previewTitle = filteredPreview || '';

      const rowElement = document.createElement('tr');
      rowElement.className = `hlx-row ${classes.join(' ')}`;
      rowElement.innerHTML = '';
      if (cols.includes('index')) rowElement.innerHTML += `<td class="hlx-col hlx-xs hlx-right hlx-col-index">${index}</td>`;
      if (cols.includes('start')) rowElement.innerHTML += `<td class="hlx-col hlx-s hlx-right hlx-col-start">${formatTime(start)}</td>`;
      if (cols.includes('end')) rowElement.innerHTML += `<td class="hlx-col hlx-s hlx-right hlx-col-end">${formatTime(end)}</td>`;
      if (cols.includes('url')) rowElement.innerHTML += `<td class="hlx-col hlx-xl hlx-col-url">${url ? `<a href="${url}" target="_blank">${urlDislay}</a>` : ''}</td>`;
      if (cols.includes('type')) rowElement.innerHTML += `<td class="hlx-col hlx-m hlx-center hlx-col-type"><span title="${name || ''}" class="hlx-badge">${type === 'mark' || type === 'paint' ? name : type}</span></td>`;
      if (cols.includes('size')) rowElement.innerHTML += `<td class="hlx-col hlx-s hlx-right hlx-col-size">${size !== undefined ? formatSize(size) : ''}</td>`;
      if (cols.includes('totalSize')) rowElement.innerHTML += `<td class="hlx-col hlx-s hlx-right hlx-col-totalSize">${totalSize !== undefined ? formatSize(totalSize) : ''}</td>`;
      if (cols.includes('duration')) rowElement.innerHTML += `<td class="hlx-col hlx-s hlx-right hlx-col-duration">${duration !== undefined ? formatTime(duration) : ''}</td>`;
      if (cols.includes('preview')) rowElement.innerHTML += `<td class="hlx-col hlx-m hlx-center hlx-col-preview" title="${previewTitle}">${preview}</td>`;
      if (cols.includes('details')) rowElement.innerHTML += `<td class="hlx-col hlx-m hlx-wrap hlx-col-details"><a href="#" data-details="${encodeURIComponent(JSON.stringify(details, null, 2))}">Details</a></td>`;

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

  const generateFilters = (list = ['navigation', 'resource', 'lcp', 'tbt', 'cls', 'paint', 'mark'], defaults = ['navigation', 'resource', 'lcp', 'tbt', 'cls', 'paint', 'mark']) => {
    const filters = document.createElement('div');
    filters.classList.add('hlx-filters');
    filters.innerHTML = '';
    if (list.includes('navigation')) {
      filters.innerHTML += `<div class="hlx-navigation"><span class="hlx-badge"><input type="checkbox" ${defaults.includes('navigation') ? 'checked' : ''}>Navigation</span></div>`;
    }
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
        applyFilter(type, checkbox.checked, document.querySelector('hlx-perf-report').shadowRoot.querySelector('.hlx-grid'));
      });
    });

    return filters;
  };

  const VIEWS = {
    LCP: {
      filters: ['navigation', 'resource', 'lcp', 'mark', 'paint'],
      defaultFilters: ['navigation', 'resource', 'lcp', 'paint'],
      cols: ['index', 'start', 'end', 'url', 'type', 'size', 'totalSize', 'preview'],
      sortedBy: 'end',
      data: (d) => {
        const sorted = VIEWS.all.data(d, true);
        const lastIndex = sorted.findLastIndex((entry) => entry.type === 'LCP');
        if (lastIndex === -1) return sorted;
        return sorted.slice(0, lastIndex + 1);
      },
    },
    CLS: {
      filters: ['resource', 'cls', 'mark', 'paint'],
      defaultFilters: ['resource', 'cls'],
      cols: ['end', 'url', 'type', 'preview'],
      sortedBy: 'end',
      data: (data) => {
        data.sort((a, b) => a.end - b.end);
        let running = false;
        let count = 0;
        for (let i = data.length - 1; i >= 0; i -= 1) {
          const entry = data[i];
          if (entry.entryType === 'cls') {
            // found CLS entry
            entry.css = 'hlx-cls-end';
            running = true;
            count = 0;
          } else if (running) {
            entry.css = 'hlx-cls-suspect';
            if (entry.entryType === 'resource') {
              count += 1;
              if (count === 3) {
                entry.css = 'hlx-cls-start';
                count = 0;
                running = false;
              }
            }
          }
        }
        return data;
      },
    },
    all: {
      filters: undefined,
      cols: undefined,
      defaultFilters: undefined,
      data: (data, sortByEndData = false) => {
        if (sortByEndData) {
          data.sort((a, b) => a.end - b.end);
        } else {
          data.sort((a, b) => a.start - b.start);
        }

        let totalSize = 0;

        return data.map((entry) => {
          const { size } = entry;
          if (size !== undefined) {
            totalSize += size;
            entry.totalSize = totalSize;
          }
          entry.before100kb = Math.round(totalSize) < 101000;
          return entry;
        });
      },
    },
  };

  if (!customElements.get('hlx-perf-report')) {
    class PerfReport extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: 'open' });
      }
    }
    customElements.define('hlx-perf-report', PerfReport);
  }

  const display = (data) => {
    const webComponent = document.createElement('hlx-perf-report');
    webComponent.shadowRoot.append(getStyles());

    const container = document.createElement('div');
    container.classList.add('hlx-container');
    container.id = 'hlx-report-dialog';
    webComponent.shadowRoot.append(container);

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

    document.body.prepend(webComponent);

    const views = document.createElement('div');
    views.classList.add('hlx-views');
    views.innerHTML = `
      <label><input type="radio" name="view" value="LCP" checked>LCP Focus</label>
      <label><input type="radio" name="view" value="CLS" >CLS Focus</label>
      <label><input type="radio" name="view" value="all">View All</label>
    `;

    container.appendChild(views);

    const filters = generateFilters(VIEWS.LCP.filters, VIEWS.LCP.defaultFilters);
    container.appendChild(filters);

    // eslint-disable-next-line max-len
    const clone = (items) => items.map((item) => (Array.isArray(item) ? clone(item) : Object.assign({}, item)));

    const grid = generateGrid(
      VIEWS.LCP.data(clone(data)),
      VIEWS.LCP.cols,
      VIEWS.LCP.defaultFilters,
      VIEWS.LCP.sortedBy,
    );
    container.appendChild(grid);

    views.querySelectorAll('input').forEach((input) => {
      input.addEventListener('change', (ev) => {
        const view = VIEWS[ev.target.value];

        container.querySelector('.hlx-filters').remove();
        container.querySelector('.hlx-grid').remove();

        const f = generateFilters(view.filters, view.defaultFilters);
        container.appendChild(f);

        const g = generateGrid(
          view.data(clone(data)),
          view.cols,
          view.defaultFilters,
          view.sortedBy,
        );
        container.appendChild(g);
      });
    });

    return container;
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

  const reportNavigation = async (data) => {
    const entries = await getEntries('navigation');
    entries.forEach((entry) => {
      const {
        name,
        initiatorType,
        startTime,
        duration,
        transferSize,
        responseEnd,
        responseStart,
        activationStart,
        redirectCount,
        redirectStart,
        redirectEnd,
      } = entry;


      let previewHTML = '';

      const ok = [];
      const penalty = [];
      const ttfb = responseStart - (activationStart || 0);
      if (ttfb > 800) {
        penalty.push(`High TTFB: ${formatTimeMS(ttfb)}`);
      } else {
        ok.push(`TTFB: ${formatTimeMS(ttfb)}`);
      }

      if (redirectCount > 0) {
        const redirectTime = redirectEnd - redirectStart;
        const s = redirectCount > 1 ? 's' : '';
        penalty.push(`${redirectCount} redirect${s} - cost: ${formatTimeMS(redirectTime)}`);
      }

      if (ok.length > 0) {
        previewHTML += `<span class="hlx-ok">${ok.join(' | ')}</span>`;
      }

      if (penalty.length > 0) {
        previewHTML += `<span class="hlx-penalty">⚠️ ${penalty.join(' ⚠️ ')}</span>`;
      }

      const d = {
        start: startTime,
        end: responseEnd,
        url: name,
        type: initiatorType,
        entryType: 'navigation',
        duration,
        size: transferSize,
        details: {
          entry,
        },
      };

      if (previewHTML) {
        d.details.previewHTML = previewHTML;
      }

      data.push(d);
    });
  };

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

      let previewHTML = null;

      const tcpHandshake = connectEnd - connectStart;
      const dnsLookup = domainLookupEnd - domainLookupStart;
      if (tcpHandshake > 0 || dnsLookup > 0 || renderBlockingStatus !== 'non-blocking') {
        const title = [];
        if (tcpHandshake > 0) title.push(`TCP handshake: ${formatTimeMS(tcpHandshake)}`);
        if (dnsLookup > 0) title.push(`DNS lookup: ${formatTimeMS(dnsLookup)}`);
        if (renderBlockingStatus !== 'non-blocking') title.push(`Render blocking: ${renderBlockingStatus}`);
        previewHTML = `<span class="hlx-penalty">⚠️ ${title.join(' ⚠️ ')}</span>`;
      }

      const d = {
        start: startTime,
        end: responseEnd,
        url: name,
        type: initiatorType,
        entryType: 'resource',
        duration,
        size: transferSize,
        details: {
          entry,
        },
      };

      if (previewHTML) {
        d.details.previewHTML = previewHTML;
      }

      data.push(d);
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
        preview: tag ? entry.element.outerHTML : null,
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
      reportNavigation(data),
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

    const s = document.querySelector('hlx-perf-report');
    if (s) s.remove();
  };

  const main = async () => {
    cleanup();
    const data = await getPerformanceReport();
    // console.table(data);
    display(data);
  };

  main();
})();
