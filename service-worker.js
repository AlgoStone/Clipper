/* eslint-disable no-undef */

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension Installed");
});

chrome.action.onClicked.addListener(function () {
    chrome.tabs.create({ url: "index.html" });
});
