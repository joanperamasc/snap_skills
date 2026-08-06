/// <reference types="chrome"/>

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'INSERT_TEXT') {
    insertTextIntoEditor(request.text);
    sendResponse({ success: true });
  } else if (request.action === 'ATTACH_FILE') {
    attachFileToEditor(request.fileName, request.content);
    sendResponse({ success: true });
  }
  return true;
});

function insertTextIntoEditor(text: string) {
  // Common selectors for AI chats
  const selectors = [
    '#prompt-textarea', // ChatGPT
    '.ProseMirror', // Claude
    'rich-textarea p', // Gemini inner
    'rich-textarea', // Gemini wrapper
    'div[contenteditable="true"]', // Generic fallback
    'textarea' // Ultimate fallback
  ];

  let targetElement: HTMLElement | null = null;

  for (const selector of selectors) {
    const el = document.querySelector(selector) as HTMLElement;
    if (el) {
      // Prioritize active element if it matches, otherwise use the first found
      if (document.activeElement?.matches(selector)) {
        targetElement = document.activeElement as HTMLElement;
        break;
      }
      if (!targetElement) {
        targetElement = el;
      }
    }
  }

  if (!targetElement) {
    console.error('SnapSkills: Could not find a suitable text editor on this page.');
    return;
  }

  targetElement.focus();

  // 1. React/Vue textarea native setter hack
  if (targetElement instanceof HTMLTextAreaElement) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    if (nativeInputValueSetter) {
      const separator = targetElement.value ? '\n' : '';
      nativeInputValueSetter.call(targetElement, targetElement.value + separator + text);
      targetElement.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }
  }

  // 2. Try execCommand for ContentEditable elements
  let execSuccess = false;
  try {
    execSuccess = document.execCommand('insertText', false, text);
  } catch (e) {
    console.warn('execCommand failed:', e);
  }

  // 3. Fallback to Paste event simulation (ProseMirror / React complex editors)
  if (!execSuccess) {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text/plain', text);
    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: dataTransfer
    });
    targetElement.dispatchEvent(pasteEvent);
  }
}

function attachFileToEditor(fileName: string, content: string) {
  const file = new File([content], fileName, { type: 'text/markdown' });
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);

  // Strategy 1: Find the hidden file input
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  if (fileInput) {
    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }

  // Strategy 2: Simulate a Drop event on the editor's container
  const dropEvent = new DragEvent('drop', {
    bubbles: true,
    cancelable: true,
    dataTransfer: dataTransfer
  });
  
  // Try to find a reasonable drop zone
  const dropZone = document.querySelector('#prompt-textarea')?.closest('form') || 
                   document.querySelector('.ProseMirror')?.parentElement || 
                   document.body;
                   
  dropZone.dispatchEvent(dropEvent);
}
