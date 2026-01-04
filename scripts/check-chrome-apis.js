#!/usr/bin/env node

/**
 * 扫描项目中所有 Chrome API 调用的脚本
 * 用于查找 chrome.runtime.sendMessage 和 chrome.tabs.sendMessage
 */

const fs = require('fs');
const path = require('path');

const CHROME_API_PATTERNS = [
  /chrome\.runtime\.sendMessage/gi,
  /chrome\.tabs\.sendMessage/gi,
  /chrome\.runtime\.onMessage/gi,
  /chrome\.tabs\.onMessage/gi,
  /chrome\.runtime\.connect/gi,
  /chrome\.tabs\.connect/gi,
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const matches = [];
    
    CHROME_API_PATTERNS.forEach((pattern, index) => {
      const patternMatches = content.match(pattern);
      if (patternMatches) {
        patternMatches.forEach(match => {
          const lines = content.substring(0, content.indexOf(match)).split('\n');
          const lineNumber = lines.length;
          matches.push({
            pattern: pattern.source,
            match,
            line: lineNumber,
            file: filePath,
          });
        });
      }
    });
    
    return matches;
  } catch (error) {
    return [];
  }
}

function scanDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 跳过 node_modules 和 .next
      if (file !== 'node_modules' && file !== '.next' && !file.startsWith('.')) {
        scanDirectory(filePath, fileList);
      }
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// 主函数
const projectRoot = path.join(__dirname, '..');
const allFiles = scanDirectory(projectRoot);
const allMatches = [];

allFiles.forEach(file => {
  const matches = scanFile(file);
  allMatches.push(...matches);
});

if (allMatches.length === 0) {
  console.log('✅ 未发现任何 Chrome API 调用');
  console.log('   项目中没有使用 chrome.runtime.sendMessage 或 chrome.tabs.sendMessage');
} else {
  console.log(`⚠️  发现 ${allMatches.length} 处 Chrome API 调用：\n`);
  allMatches.forEach(({ file, line, match }) => {
    console.log(`   ${file}:${line}`);
    console.log(`   ${match}\n`);
  });
}

