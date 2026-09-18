'use strict';
importScripts('scanner.js','custom-rules.js');
self.onmessage = ({ data }) => {
  try {
    const result = self.BeforeYouSendCustom.scan(self.BeforeYouSendScanner,data.text, { mode: data.mode, customRules:data.customRules, caseSensitive:data.caseSensitive });
    self.postMessage({ result });
  } catch { self.postMessage({ error: 'The check could not be completed. Try a smaller section.' }); }
};
