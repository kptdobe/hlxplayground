# Performance report

Prototype to see if it is possible to use Chrome `PerformanceResourceTiming` in order to analyze and display useful information to fix performances issues.

The tool uses the page currently loaded in the browser, loads all the `PerformanceResourceTiming` entries and displays a report which can be used to analyze what and when resources are loaded on the page. It shows timing and size information for each resource and shows the identified LCP resource and when the LCP event fires in the loading sequence.

The tool should can used as bookmarklet or loaded directly in the page to be tested (delayed 5s to leave time for all resources to be loaded).

## Bookmarklet

In Chrome bookmark, create a new link and add the following "url":

```
javascript:(() => %7Bconst s=document.createElement('script');s.id='hlx-report';s.src='https://main--hlxplayground--kptdobe.hlx.live/tools/report/report.js';if(document.getElementById('hlx-report'))%7Bdocument.getElementById('hlx-report').replaceWith(s);%7D else %7Bdocument.head.append(s);%7D%7D)();
```

## Usage

- Load a page
- Click on the bookmarklet link

## Project extension

### performance.mark

In a project, you use `performance.mark()` to add custom entries in the report "timeline" and visualise when they happen in the loading sequence. Here is an example:

```
if (window.performance) performance.mark('block-loaded', { detail: { preview: blockName, className: block.className } });
```

The first parameter is the name of the mark. All marks are classified with the `ELD` type

The second parameter is optional but very useful to share some "details":
- the `preview` property will be displayed in the "Info" column of the report
- the full object will be displayed when clicking on the `Details` link

### first section mutation observer

To optimise the LCP and avoid CLS, the first section must be displayed as quickly as possible and not be changed anymore afterward. Sometimes, external factors (css, js, loading sequence) change the first section and introduces CLS or may even delay the LCP. To track this, you can easily add a `MutationObserver` on the first section:

```
  const observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach((m) => {
      if (m.type === 'childList') {
        if (m.addedNodes.length > 0) {
          performance.mark('first-section-mutation', { detail: { preview: `Node(s) added to ${m.target.outerHTML}` }});
        }
        if (m.removedNodes.length > 0) {
          performance.mark('first-section-mutation', { detail: { preview: `Node(s) removed from ${m.target.outerHTML}` }});
        }
      } else if (m.type === 'attributes') {
        performance.mark('first-section-mutation', { detail: { preview: `Attribute "${m.attributeName}" new value: "${m.target.getAttribute(m.attributeName)}"` }});
      }
    });
  });
  // section must be the first one
  observer.observe(section, { attributes: true, childList: true, subtree: true });
```

In the context of a Helix site, you will need to the observer in the `updateSectionsStatus` method - see sample commit here: https://github.com/adobe/helix-website/commit/65a6295a470d69872e32279684c2a6ae6a719a5b

## Analysis

This is still WIP and early stage but ideally it should be easy to visualize resources which are loaded to early (before the LCP but not critical to the initial loading sequence), resources which are too big (first 100KiB are crucial for page to perform well) or resources which take too long to load (3rd party domain, slow server, non h2/h3 protocol).

## Limitations

The page you want to run the report on can have a CSP blocking script execution if script is not in the predefined list. A CSP killer Chrome extension should do the trick (a first test seems to indicate CSP killers have an impact on Chrome Performance monitoring API - TODO: investigate)

## Development

- Clone the current repo and start a light web server from the project root
- Update the bookmarklet above to point to localhost