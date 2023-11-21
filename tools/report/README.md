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

## Project extension: performance.mark

In a project, you use `performance.mark()` to add custom entries in the report "timeline" and visualise when they happen in the loading sequence. Here is an example:

```
if (window.performance) performance.mark('block-loaded', { detail: { preview: blockName, className: block.className } });
```

The first parameter is the name of the mark. All marks are classified with the `ELD` type

The second parameter is optional but very useful to share some "details":
- the `preview` property will be displayed in the "Info" column of the report
- the full object will be displayed when clicking on the `Details` link

## Analysis

This is still WIP and early stage but ideally it should be easy to visualize resources which are loaded to early (before the LCP but not critical to the initial loading sequence), resources which are too big (first 100KiB are crucial for page to perform well) or resources which take too long to load (3rd party domain, slow server, non h2/h3 protocol).

## Limitations

The page you want to run the report on can have a CSP blocking script execution if script is not in the predefined list. A CSP killer Chrome extension should do the trick (a first test seems to indicate CSP killers have an impact on Chrome Performance monitoring API - TODO: investigate)

## Development

- Clone the current repo and start a light web server from the project root
- Update the bookmarklet above to point to localhost