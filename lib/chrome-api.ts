/**
 * Chrome Extension API 包装器
 * 提供安全的 Chrome API 调用，自动处理 runtime.lastError
 */

/**
 * 安全地发送消息到 Chrome 扩展的 runtime
 * @param message 要发送的消息
 * @param callback 回调函数（可选）
 * @returns Promise，如果使用回调则返回 void
 */
export function safeSendMessage(
  message: any,
  callback?: (response: any) => void
): Promise<any> | void {
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    console.debug('[Chrome API] Chrome runtime not available');
    return callback ? undefined : Promise.reject(new Error('Chrome runtime not available'));
  }

  // 如果有回调函数，使用回调方式
  if (callback) {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        // 必须检查 lastError
        if (chrome.runtime.lastError) {
          console.debug('[Chrome API] Runtime error:', chrome.runtime.lastError.message);
          return; // 静默处理错误，不抛出异常
        }
        callback(response);
      });
      return;
    } catch (error) {
      console.debug('[Chrome API] Send message error:', error);
      return;
    }
  }

  // 如果没有回调，返回 Promise
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        // 必须检查 lastError
        if (chrome.runtime.lastError) {
          console.debug('[Chrome API] Runtime error:', chrome.runtime.lastError.message);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(response);
      });
    } catch (error) {
      console.debug('[Chrome API] Send message error:', error);
      reject(error);
    }
  });
}

/**
 * 安全地发送消息到指定的标签页
 * @param tabId 标签页 ID
 * @param message 要发送的消息
 * @param callback 回调函数（可选）
 * @returns Promise，如果使用回调则返回 void
 */
export function safeSendMessageToTab(
  tabId: number,
  message: any,
  callback?: (response: any) => void
): Promise<any> | void {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    console.debug('[Chrome API] Chrome tabs API not available');
    return callback ? undefined : Promise.reject(new Error('Chrome tabs API not available'));
  }

  // 如果有回调函数，使用回调方式
  if (callback) {
    try {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        // 必须检查 lastError
        if (chrome.runtime.lastError) {
          console.debug('[Chrome API] Tabs sendMessage error:', chrome.runtime.lastError.message);
          return; // 静默处理错误，不抛出异常
        }
        callback(response);
      });
      return;
    } catch (error) {
      console.debug('[Chrome API] Send message to tab error:', error);
      return;
    }
  }

  // 如果没有回调，返回 Promise
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        // 必须检查 lastError
        if (chrome.runtime.lastError) {
          console.debug('[Chrome API] Tabs sendMessage error:', chrome.runtime.lastError.message);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(response);
      });
    } catch (error) {
      console.debug('[Chrome API] Send message to tab error:', error);
      reject(error);
    }
  });
}

/**
 * 安全地监听 Chrome runtime 消息
 * @param callback 消息处理回调
 * @returns 取消监听的函数
 */
export function safeOnMessage(
  callback: (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => void | boolean
): () => void {
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    console.debug('[Chrome API] Chrome runtime not available');
    return () => {}; // 返回空函数
  }

  const listener = (
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => {
    try {
      const result = callback(message, sender, sendResponse);
      // 如果回调返回 true，表示会异步调用 sendResponse
      return result === true;
    } catch (error) {
      console.debug('[Chrome API] Message listener error:', error);
      // 检查 lastError
      if (chrome.runtime.lastError) {
        console.debug('[Chrome API] Runtime error in listener:', chrome.runtime.lastError.message);
      }
      return false;
    }
  };

  chrome.runtime.onMessage.addListener(listener);

  // 返回取消监听的函数
  return () => {
    if (chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.removeListener(listener);
    }
  };
}

/**
 * 检查 Chrome API 是否可用
 */
export function isChromeAPIAvailable(): boolean {
  return typeof chrome !== 'undefined' && 
         chrome.runtime !== undefined && 
         chrome.runtime.id !== undefined;
}

