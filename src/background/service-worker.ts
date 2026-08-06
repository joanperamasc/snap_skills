/// <reference types="chrome"/>
// Service Worker para Manifest V3
chrome.runtime.onInstalled.addListener(() => {
  console.log("SnapSkills Extension Installed");
  
  // Habilitar el Side Panel al hacer click en el icono de la extensión
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error: any) => console.error("Error setting side panel behavior:", error));
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'SEARCH_SKILLS') {
    const query = encodeURIComponent(request.query || '');
    const token = request.token;
    
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(`https://api.github.com/search/code?q=filename:SKILL.md+${query}`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        const skills = (data.items || []).map((item: any) => {
          const parts = item.path.split('/');
          const folderName = parts.length > 1 ? parts[parts.length - 2] : item.name;
          return {
            id: item.html_url,
            slug: item.path,
            name: folderName,
            source: item.repository.full_name,
            description: item.repository.description || `From ${item.repository.full_name}`,
            path: item.path
          };
        });
        sendResponse({ success: true, data: skills });
      })
      .catch((error) => sendResponse({ success: false, error: error.toString() }));
    return true; // Indicates async response
  }
  
  if (request.action === 'GET_SKILL_DETAILS') {
    const { source, path, token } = request;
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }
    
    // We attempt to fetch from the main branch. 
    // If a repo uses master, this might fail, but main is the standard now.
    fetch(`https://raw.githubusercontent.com/${source}/main/${path}`, { headers })
      .then((res) => {
        if (!res.ok) {
          // Fallback to master if main fails
          if (res.status === 404) {
            return fetch(`https://raw.githubusercontent.com/${source}/master/${path}`, { headers });
          }
          throw new Error(`Raw GitHub error: ${res.status} ${res.statusText}`);
        }
        return res;
      })
      .then((res) => {
        if (!res.ok) throw new Error(`Raw GitHub error: ${res.status} ${res.statusText}`);
        return res.text();
      })
      .then((text) => {
        // Return in the format expected by the frontend
        sendResponse({ 
          success: true, 
          data: {
            files: [
              { path: path, contents: text }
            ]
          }
        });
      })
      .catch((error) => sendResponse({ success: false, error: error.toString() }));
    return true;
  }
});
