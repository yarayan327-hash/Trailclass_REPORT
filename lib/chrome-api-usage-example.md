# Chrome API 安全使用指南

## 问题说明

Chrome 扩展中，当调用 `chrome.runtime.sendMessage` 或 `chrome.tabs.sendMessage` 时，如果接收端不存在，会抛出 `Unchecked runtime.lastError` 错误。

## 解决方案

使用 `lib/chrome-api.ts` 中提供的安全包装函数，它们会自动处理 `chrome.runtime.lastError`。

## 使用示例

### 1. 使用回调方式发送消息

```typescript
import { safeSendMessage } from '@/lib/chrome-api';

// 方式 1: 使用回调（自动处理错误）
safeSendMessage({ type: 'GET_DATA' }, (response) => {
  if (response) {
    console.log('收到响应:', response);
  }
  // 如果连接失败，回调不会被调用，错误已被静默处理
});
```

### 2. 使用 Promise 方式发送消息

```typescript
import { safeSendMessage } from '@/lib/chrome-api';

// 方式 2: 使用 Promise
try {
  const response = await safeSendMessage({ type: 'GET_DATA' });
  console.log('收到响应:', response);
} catch (error) {
  // 错误已被捕获，不会抛出未捕获异常
  console.debug('发送消息失败:', error);
}
```

### 3. 发送消息到标签页

```typescript
import { safeSendMessageToTab } from '@/lib/chrome-api';

// 获取当前标签页 ID
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]?.id) {
    safeSendMessageToTab(tabs[0].id, { type: 'INJECT_SCRIPT' }, (response) => {
      // 自动处理错误
    });
  }
});
```

### 4. 监听消息

```typescript
import { safeOnMessage } from '@/lib/chrome-api';

// 监听消息（自动处理错误）
const removeListener = safeOnMessage((message, sender, sendResponse) => {
  if (message.type === 'GET_DATA') {
    sendResponse({ data: 'some data' });
    return true; // 表示异步响应
  }
  return false;
});

// 取消监听
// removeListener();
```

## 迁移现有代码

### 旧代码（会抛出错误）

```typescript
// ❌ 不安全的调用
chrome.runtime.sendMessage({ type: 'GET_DATA' }, (response) => {
  // 如果接收端不存在，这里会抛出 Unchecked runtime.lastError
  console.log(response);
});
```

### 新代码（安全）

```typescript
// ✅ 安全的调用
import { safeSendMessage } from '@/lib/chrome-api';

safeSendMessage({ type: 'GET_DATA' }, (response) => {
  // 错误已被处理，不会抛出异常
  if (response) {
    console.log(response);
  }
});
```

## 注意事项

1. 所有错误都会被静默处理（使用 `console.debug` 记录）
2. 如果接收端不存在，回调函数不会被调用
3. 使用 Promise 方式时，错误会被 reject，需要 try-catch
4. 在非扩展环境中，函数会安全地返回，不会抛出错误

