chrome.runtime.onConnect.addListener((devToolsConnection: any) => {
  const devToolsListener = (message: any) => {
    chrome.tabs.executeScript(message.tabId, { file: message.scriptToInject });
  };
  devToolsConnection.onMessage.addListener(devToolsListener);
  devToolsConnection.onDisconnect.addListener(() => {
    devToolsConnection.onMessage.removeListener(devToolsListener);
  });
});
