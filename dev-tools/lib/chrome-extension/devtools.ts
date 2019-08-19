const backgroundPageConnection = chrome.runtime.connect({
  name: 'devtools-page',
});

chrome.devtools.panels.create(
  'React Viewport Utils',
  'MyPanelIcon.png',
  'panel.html',
  () => {
    backgroundPageConnection.postMessage({
      tabId: chrome.devtools.inspectedWindow.tabId,
      scriptToInject: 'content_script.js',
    });
  },
);
