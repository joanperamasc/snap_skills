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
    const filters = request.filters || { strict: false };
    let queryParts = ['filename:SKILL.md', 'language:markdown'];
    
    if (filters.strict !== false) {
      queryParts.push('snapskill', 'size:>200');
    }
    if (filters.user) queryParts.push(`user:${filters.user}`);
    if (filters.repo) queryParts.push(`repo:${filters.repo}`);
    if (filters.path) queryParts.push(`path:${filters.path}`);
    if (request.query) queryParts.push(request.query);
    
    const rawQuery = queryParts.join(' ');
    const query = encodeURIComponent(rawQuery);
    const token = request.token;
    const page = request.page || 1;
    
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const cacheKey = `search_${query}_${page}`;
    
    // Attempt to load from cache
    chrome.storage.session.get([cacheKey], (result) => {
      const cached = result[cacheKey] as any;
      const CACHE_TIME = 15 * 60 * 1000; // 15 minutes
      if (cached && (Date.now() - cached.timestamp < CACHE_TIME)) {
        console.log("Returning cached search results for", cacheKey);
        sendResponse({
          success: true,
          data: cached.data,
          total_count: cached.total_count
        });
        return;
      }

      fetch(`https://api.github.com/search/code?q=${query}&page=${page}`, { headers })
        .then((res) => {
          if (!res.ok) {
            if (res.status === 403) {
              throw new Error('RATE_LIMIT_EXCEEDED');
            }
            throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
          }
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
          
          // Save to cache
          chrome.storage.session.set({
            [cacheKey]: {
              data: skills,
              total_count: data.total_count || 0,
              timestamp: Date.now()
            }
          });
          
          sendResponse({ 
            success: true, 
            data: skills,
            total_count: data.total_count || 0
          });
        })
        .catch((error) => sendResponse({ success: false, error: error.toString() }));
    });
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
