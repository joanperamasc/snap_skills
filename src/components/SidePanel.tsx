import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Zap, Search, Terminal, Database, Bookmark, Loader2, Settings, ArrowLeft, Copy, Check, Download, ExternalLink, History, Plus, PenTool, Bold, Italic, Code, List, Eye, Edit2, X, SlidersHorizontal, Info } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { EmptyState } from './EmptyState';

type Skill = {
  id: string;
  slug: string;
  name: string;
  source: string;
  description?: string;
  path: string;
  isCustom?: boolean;
  content?: string;
};

function Tooltip({ children, content, position = 'bottom' }: { children: React.ReactNode, content: string, position?: 'top' | 'bottom' }) {
  const posClass = position === 'top' 
    ? "bottom-full mb-1.5 left-1/2 -translate-x-1/2" 
    : "top-full mt-1.5 left-1/2 -translate-x-1/2";
    
  return (
    <div className="relative group/tooltip flex items-center justify-center">
      {children}
      <div className={`absolute ${posClass} opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white hover:dark:text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-50 shadow-md`}>
        {content}
      </div>
    </div>
  );
}

export default function SidePanel() {
  const tSettings = useTranslations('Settings');
  const tLibrary = useTranslations('Library');
  const tSaved = useTranslations('Saved');
  const tHistory = useTranslations('History');
  const tCreated = useTranslations('Created');
  const tEditor = useTranslations('Editor');
  const tCommon = useTranslations('Common');
  const tAdvanced = useTranslations('AdvancedSearch');

  const [activeTab, setActiveTab] = useState<'library' | 'saved' | 'history' | 'created' | 'settings'>('library');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({ user: '', repo: '', path: '', strict: false });
  const debouncedAdvancedFilters = useDebounce(advancedFilters, 500);
  const [savedSkills, setSavedSkills] = useState<Skill[]>([]);
  const [createdSkills, setCreatedSkills] = useState<Skill[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editId, setEditId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editPreview, setEditPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [skillMarkdown, setSkillMarkdown] = useState<string | null>(null);
  const [markdownLoading, setMarkdownLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchKeywords, setSearchKeywords] = useState('design, react, video');
  
  // Usar la variable de entorno como valor por defecto si existe
  const defaultToken = import.meta.env.VITE_GITHUB_TOKEN || '';
  const [githubToken, setGithubToken] = useState('');
  const activeToken = githubToken || defaultToken;
  
  const [currentTheme, setCurrentTheme] = useState('light');
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Load saved skills on mount
  useEffect(() => {
    chrome.storage.local.get(['savedSkills', 'githubToken', 'searchHistory', 'createdSkills', 'theme', 'language'], (result) => {
      if (Array.isArray(result.savedSkills)) setSavedSkills(result.savedSkills as Skill[]);
      if (Array.isArray(result.searchHistory)) setSearchHistory(result.searchHistory as string[]);
      if (Array.isArray(result.createdSkills)) setCreatedSkills(result.createdSkills as Skill[]);
      // Solo sobreescribimos el estado si el usuario guardó manualmente uno distinto en storage
      if (typeof result.githubToken === 'string' && result.githubToken) {
        setGithubToken(result.githubToken);
      }
      if (typeof result.theme === 'string') setCurrentTheme(result.theme);
      if (typeof result.language === 'string') setCurrentLanguage(result.language);
    });
  }, []);

  const extractAndSetKeywords = (text: string) => {
    if (!text) return;
    
    // Convert to lowercase and match words
    const words = text.toLowerCase().match(/[a-z0-9áéíóúñ]+/g);
    if (!words) return;

    // Common stop words to filter out (English and Spanish)
    const stopWords = new Set(['the', 'and', 'for', 'with', 'this', 'that', 'you', 'are', 'your', 'from', 'can', 'has', 'have', 'was', 'were', 'what', 'how', 'why', 'where', 'when', 'who', 'chatgpt', 'claude', 'gemini', 'google', 'openai', 'anthropic', 'que', 'los', 'del', 'las', 'por', 'con', 'una', 'para', 'como', 'más', 'pero', 'sus', 'sin', 'sobre', 'este', 'esta']);
    
    // Filter words and get unique ones
    const filteredWords = words.filter(w => w.length > 2 && !stopWords.has(w));
    const uniqueWords = Array.from(new Set(filteredWords));
    
    if (uniqueWords.length > 0) {
      // Take up to 3 keywords
      setSearchKeywords(uniqueWords.slice(0, 3).join(', '));
    } else {
      setSearchKeywords('design, react, video');
    }
  };

  // Dynamically update search placeholder based on active tab
  useEffect(() => {
    if (activeTab !== 'library') return;

    const fetchCurrentTabKeywords = () => {
      try {
        if (chrome && chrome.tabs && chrome.tabs.query) {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs.length > 0) {
              const tab = tabs[0];
              const url = tab.url || '';
              const isSupportedHost = url.includes('chatgpt.com') || url.includes('claude.ai') || url.includes('gemini.google.com');

              if (isSupportedHost && tab.id && chrome.scripting) {
                chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  func: () => {
                    const title = document.title;
                    const metaDesc = document.querySelector('meta[name="description"]');
                    const description = metaDesc ? metaDesc.getAttribute('content') : '';
                    return `${title} ${description || ''}`;
                  }
                }, (results) => {
                  if (results && results[0] && results[0].result) {
                    extractAndSetKeywords(results[0].result as string);
                  } else {
                    extractAndSetKeywords(tab.title || '');
                  }
                });
              } else {
                // Fallback to just the title
                extractAndSetKeywords(tab.title || '');
              }
            }
          });
        }
      } catch (err) {
        console.error('Error fetching tab info:', err);
      }
    };

    // Fetch on mount / when activeTab becomes 'library'
    fetchCurrentTabKeywords();

    // Setup listeners for tab changes
    const handleTabActivated = () => fetchCurrentTabKeywords();
    const handleTabUpdated = (_tabId: number, changeInfo: any) => {
      if (changeInfo.status === 'complete' || changeInfo.title) {
        fetchCurrentTabKeywords();
      }
    };

    if (chrome && chrome.tabs) {
      chrome.tabs.onActivated.addListener(handleTabActivated);
      chrome.tabs.onUpdated.addListener(handleTabUpdated);
    }

    return () => {
      if (chrome && chrome.tabs) {
        chrome.tabs.onActivated.removeListener(handleTabActivated);
        chrome.tabs.onUpdated.removeListener(handleTabUpdated);
      }
    };
  }, [activeTab]);

  // Reset page when query or filters change
  useEffect(() => {
    setPage(1);
    setSearchError(null);
  }, [debouncedQuery, debouncedAdvancedFilters]);

  // Search logic
  useEffect(() => {
    if (activeTab !== 'library') return;

    const fetchSkills = () => {
      setLoading(true);
      // If query is empty and we don't have filters, maybe fetch some defaults or just clear
      if (debouncedQuery.trim() === '' && !debouncedAdvancedFilters.user && !debouncedAdvancedFilters.repo) {
        // Fallback hardcoded for empty state if desired, or empty array
        setSkills([]);
        setHasMore(false);
        setSearchError(null);
        setLoading(false);
        return;
      }

      chrome.runtime.sendMessage({ action: 'SEARCH_SKILLS', query: debouncedQuery, token: activeToken, page, filters: debouncedAdvancedFilters }, (response) => {
        if (response && response.success) {
          setSearchError(null);
          // Data is already mapped by the service worker
          if (page === 1) {
            setSkills(response.data);
          } else {
            setSkills(prev => [...prev, ...response.data]);
          }
          
          setHasMore(response.data.length > 0 && response.total_count > (page * 30));

          // Add to history only on first page
          if (page === 1) {
            setSearchHistory(prev => {
              const newHistory = [debouncedQuery, ...prev.filter(q => q !== debouncedQuery)].slice(0, 20);
              chrome.storage.local.set({ searchHistory: newHistory });
              return newHistory;
            });
          }
        } else {
          if (response?.error?.includes('RATE_LIMIT_EXCEEDED')) {
            setSearchError("RATE_LIMIT");
          } else {
            setSearchError(response?.error || "Unknown error");
          }
          setHasMore(false);
          console.error('Search failed:', response?.error);
        }
        setLoading(false);
      });
    };

    fetchSkills();
  }, [debouncedQuery, page, activeTab, activeToken, debouncedAdvancedFilters]);

  
  const debouncedEditTitle = useDebounce(editTitle, 1000);
  const debouncedEditContent = useDebounce(editContent, 1000);

  useEffect(() => {
    if (isCreating && editId) {
      const newSkill = {
        id: editId,
        slug: editTitle.toLowerCase().replace(/\s+/g, '-'),
        name: editTitle || tEditor('untitled'),
        source: 'custom',
        path: 'custom',
        isCustom: true,
        content: editContent
      };
      
      setCreatedSkills(prev => {
        const exists = prev.some(s => s.id === editId);
        const updated = exists ? prev.map(s => s.id === editId ? newSkill : s) : [newSkill, ...prev];
        chrome.storage.local.set({ createdSkills: updated });
        return updated;
      });
    }
  }, [debouncedEditTitle, debouncedEditContent]);

  const handleCreateNew = () => {
    setEditId(crypto.randomUUID());
    setEditTitle('');
    setEditContent('# ' + tEditor('newSkill') + '\n\n');
    setIsCreating(true);
    setEditPreview(false);
  };

  const insertFormat = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = editContent;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);
    
    setEditContent(before + prefix + selected + suffix + after);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
      }
    }, 0);
  };

  const handleSave = (skill: Skill) => {
    const isSaved = savedSkills.some(s => s.id === skill.id);
    let newSaved;
    if (isSaved) {
      newSaved = savedSkills.filter(s => s.id !== skill.id);
    } else {
      newSaved = [...savedSkills, skill];
    }
    setSavedSkills(newSaved);
    chrome.storage.local.set({ savedSkills: newSaved });
  };

  const executeAction = (skill: Skill, type: 'copy' | 'download') => {
    setActionLoading(skill.id);
    if (skill.isCustom) {
      const content = skill.content || '';
      if (type === 'copy') {
        navigator.clipboard.writeText(content);
        setCopiedId(skill.id);
        setTimeout(() => setCopiedId(null), 2000);
      } else if (type === 'download') {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${skill.slug || 'skill'}.md`;
        a.click();
        URL.revokeObjectURL(url);
      }
      setActionLoading(null);
      return;
    }
    chrome.runtime.sendMessage({ action: 'GET_SKILL_DETAILS', source: skill.source, path: skill.path, token: activeToken }, (response) => {
      if (response && response.success && response.data.files) {
        const mdFile = response.data.files.find((f: any) => f.path === skill.path || f.path.endsWith('.md'));
        const content = mdFile ? mdFile.contents : '# ' + skill.name + '\n' + tCommon('noMarkdownContent');
        
        if (type === 'copy') {
          navigator.clipboard.writeText(content);
          setCopiedId(skill.id);
          setTimeout(() => setCopiedId(null), 2000);
        } else if (type === 'download') {
          const blob = new Blob([content], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${skill.slug}.md`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        console.error('Failed to get skill details', response?.error);
      }
      setActionLoading(null);
    });
  };

  const handleOpenGithubSkill = (skill: Skill) => {
    chrome.tabs.create({ url: `https://github.com/${skill.source}/tree/HEAD/${skill.path}` });
  };

  const handleViewSkill = (skill: Skill) => {
    setSelectedSkill(skill);
    if (skill.isCustom) {
      setEditId(skill.id);
      setEditTitle(skill.name);
      setEditContent(skill.content || '');
      setIsCreating(true);
      setEditPreview(false);
      return;
    }
    setMarkdownLoading(true);
    setSkillMarkdown(null);
    chrome.runtime.sendMessage({ action: 'GET_SKILL_DETAILS', source: skill.source, path: skill.path, token: activeToken }, (response) => {
      if (response && response.success && response.data.files) {
        const mdFile = response.data.files.find((f: any) => f.path === skill.path || f.path.endsWith('.md'));
        const content = mdFile ? mdFile.contents : `# ${skill.name}\n${tCommon('noMarkdownContent')}`;
        setSkillMarkdown(content);
      } else {
        console.error('Failed to get skill details', response?.error);
        setSkillMarkdown(`# ${skill.name}\n${tCommon('failedToLoad')}`);
      }
      setMarkdownLoading(false);
    });
  };

  const handleCopy = () => {
    if (selectedSkill?.isCustom) {
      navigator.clipboard.writeText(selectedSkill.content || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    if (skillMarkdown) {
      navigator.clipboard.writeText(skillMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (selectedSkill?.isCustom) {
      const blob = new Blob([selectedSkill.content || ''], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedSkill.slug}.md`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    if (skillMarkdown && selectedSkill) {
      const blob = new Blob([skillMarkdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedSkill.slug}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleOpenGithub = () => {
    if (selectedSkill?.isCustom) return;
    if (selectedSkill) {
      chrome.tabs.create({ url: `https://github.com/${selectedSkill.source}/tree/HEAD/${selectedSkill.path}` });
    }
  };

  const isSelectedSaved = selectedSkill ? savedSkills.some(s => s.id === selectedSkill.id) : false;

  const displayedSkills = activeTab === 'library' ? skills : activeTab === 'created' ? createdSkills : savedSkills;

  return (
    <div className="flex flex-col h-screen w-full max-w-[400px] bg-white dark:bg-black text-neutral-900 dark:text-white font-sans overflow-hidden mx-auto border-r border-l border-neutral-200 dark:border-neutral-800 shadow-sm">
      
      {/* EDITOR VIEW */}
      {isCreating && (
        <div className="flex flex-col h-full overflow-hidden w-full absolute inset-0 bg-white dark:bg-black z-20">
          <div className="flex-none bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => { setIsCreating(false); setSelectedSkill(null); }} className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-white transition-colors cursor-pointer flex-shrink-0">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">{tEditor('newSkill')}</h2>
              </div>
              <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                 <Check className="w-3 h-3" /> Auto-saved
              </div>
            </div>
            <input 
              type="text" 
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder={tEditor('titlePlaceholder')}
              className="w-full bg-transparent text-base font-semibold text-neutral-900 dark:text-white placeholder-neutral-600 focus:outline-none"
            />
          </div>
          
          <div className="flex-none flex items-center border-b border-neutral-200 dark:border-neutral-800 px-4 bg-neutral-100 dark:bg-neutral-100/30 dark:bg-neutral-900/30">
            <button 
              onClick={() => setEditPreview(false)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${!editPreview ? 'border-white text-neutral-900 dark:text-white' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-300'}`}
            >
              <Edit2 className="w-3.5 h-3.5" /> {tEditor('edit')}
            </button>
            <button 
              onClick={() => setEditPreview(true)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${editPreview ? 'border-white text-neutral-900 dark:text-white' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-300'}`}
            >
              <Eye className="w-3.5 h-3.5" /> {tEditor('preview')}
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {!editPreview && (
              <div className="flex-none flex items-center gap-1 p-2 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black">
                <button onClick={() => insertFormat('**', '**')} className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-white hover:bg-neutral-200 dark:bg-neutral-800 rounded transition-colors" title="Bold">
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => insertFormat('*', '*')} className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-white hover:bg-neutral-200 dark:bg-neutral-800 rounded transition-colors" title="Italic">
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-800 mx-1"></div>
                <button onClick={() => insertFormat('```\n', '\n```')} className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-white hover:bg-neutral-200 dark:bg-neutral-800 rounded transition-colors" title="Code Block">
                  <Code className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => insertFormat('- ')} className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-white hover:bg-neutral-200 dark:bg-neutral-800 rounded transition-colors" title="List">
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-neutral-200 dark:bg-neutral-800 [&::-webkit-scrollbar-track]:bg-transparent">
              {!editPreview ? (
                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full min-h-full bg-white dark:bg-black text-neutral-700 dark:text-neutral-300 text-sm p-4 font-mono leading-relaxed resize-none focus:outline-none"
                  placeholder="Escribe tu skill en Markdown..."
                />
              ) : (
                <div className="prose dark:prose-invert prose-sm max-w-none p-4 prose-pre:bg-neutral-100 dark:prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-200 dark:prose-pre:border-neutral-800 prose-code:bg-neutral-100 dark:prose-code:bg-neutral-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-a:text-primary-dark dark:prose-a:text-primary">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {editContent || '*No content*'}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedSkill && !isCreating ? (
        <div className="flex flex-col h-full overflow-hidden w-full">
          <div className="flex-none bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 p-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <button onClick={() => setSelectedSkill(null)} className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-white transition-colors cursor-pointer flex-shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white truncate"><span className="uppercase text-neutral-600 dark:text-neutral-400 font-medium">{selectedSkill.source.split('/')[0]}:</span> {selectedSkill.name}</h2>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Tooltip content={isSelectedSaved ? tCommon('remove') : tCommon('save')} position="bottom">
                <button 
                  onClick={() => handleSave(selectedSkill)}
                  className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-white hover:bg-neutral-100 dark:bg-neutral-900 rounded transition-colors cursor-pointer"
                >
                  <Bookmark className="w-4 h-4" fill={isSelectedSaved ? "currentColor" : "none"} />
                </button>
              </Tooltip>
              <Tooltip content={tCommon('copyContent')} position="bottom">
                <button 
                  onClick={handleCopy}
                  disabled={!skillMarkdown}
                  className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-white hover:bg-neutral-100 dark:bg-neutral-900 rounded transition-colors cursor-pointer disabled:opacity-50"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </Tooltip>
              <Tooltip content={tCommon('downloadMD')} position="bottom">
                <button 
                  onClick={handleDownload}
                  disabled={!skillMarkdown}
                  className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-white hover:bg-neutral-100 dark:bg-neutral-900 rounded transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                </button>
              </Tooltip>
              {!selectedSkill?.isCustom && (
              <Tooltip content={tCommon('viewInGitHub')} position="bottom">
                <button 
                  onClick={handleOpenGithub}
                  className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-white hover:bg-neutral-100 dark:bg-neutral-900 rounded transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </Tooltip>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-neutral-200 dark:bg-neutral [&::-webkit-scrollbar-track]:bg-transparent">
            {markdownLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
              </div>
            ) : (
              <div className="prose dark:prose-invert prose-sm max-w-none prose-pre:bg-neutral-100 dark:prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-200 dark:prose-pre:border-neutral-800 prose-code:bg-neutral-100 dark:prose-code:bg-neutral-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-a:text-primary-dark dark:prose-a:text-primary">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedSkill?.isCustom ? selectedSkill.content || '' : skillMarkdown || ''}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
      {/* HEADER & SEARCH BAR */}
      <div className="flex-none bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800">
        <header className="p-4 pb-3 flex flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-neutral-900 dark:text-white fill-neutral-900 dark:fill-white" strokeWidth={1.5} />
              <div className="relative overflow-hidden flex items-center">
                <pre className="text-[3px] leading-[105%] text-neutral-300 dark:text-neutral-800 select-none whitespace-pre font-mono m-0 p-0">
{`███████╗███╗   ██╗ █████╗ ██████╗     ███████╗██╗  ██╗██╗██╗     ██╗     ███████╗
██╔════╝████╗  ██║██╔══██╗██╔══██╗    ██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝
███████╗██╔██╗ ██║███████║██████╔╝    ███████╗█████╔╝ ██║██║     ██║     ███████╗
╚════██║██║╚██╗██║██╔══██║██╔═══╝     ╚════██║██╔═██╗ ██║██║     ██║     ╚════██║
███████║██║ ╚████║██║  ██║██║         ███████║██║  ██╗██║███████╗███████╗███████║
╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝         ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝`}
                </pre>
                <pre className="absolute top-0 left-0 text-[3px] leading-[105%] text-neutral-900 dark:text-white select-none whitespace-pre font-mono m-0 p-0">
{`███████ ███    ██  █████  ██████      ███████ ██   ██ ██ ██      ██      ███████ 
██      ████   ██ ██  ██ ██  ██       ██      ██  ██  ██ ██      ██      ██      
███████ ██ ██  ██ ██████ ██████       ███████ █████   ██ ██      ██      ███████ 
     ██ ██  ██ ██ ██  ██ ██                ██ ██  ██  ██ ██      ██           ██ 
███████ ██   ████ ██  ██ ██           ███████ ██   ██ ██ ███████ ███████ ███████ 
                                                                                 `}
                </pre>
              </div>
            </div>
            <button onClick={handleCreateNew} className="px-2.5 py-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-white hover:dark:text-white hover:bg-neutral-100 dark:bg-neutral-900 hover:dark:bg-neutral-800 rounded transition-colors cursor-pointer flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span className="text-xs font-medium">{tEditor('newSkill')}</span>
            </button>
          </div>
          <div className="flex flex-col items-start gap-1">
            <div className="px-1.5 py-0.5 rounded-[4px] border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
              <span className="text-[10px] uppercase font-mono text-neutral-600 dark:text-neutral-400 tracking-wider">{tLibrary('subtitle')}</span>
            </div>
          </div>
        </header>

        {activeTab === 'library' && (
          <div className="px-4 pb-4">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-neutral-500" strokeWidth={2} />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={tLibrary('searchPlaceholder', { keywords: searchKeywords })} 
                  className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg py-2 pl-9 pr-8 text-sm text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-2 p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className={`flex-none p-2 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${showAdvancedSearch ? 'bg-neutral-900 dark:bg-white text-white dark:text-black border-transparent' : 'bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900'}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
            
            {showAdvancedSearch && (
              <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="relative group inline-flex items-center gap-1 mb-1">
                      <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">{tAdvanced('user')}</label>
                      <Info className="w-3 h-3 text-neutral-400 cursor-help" />
                      <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block w-48 p-2 bg-neutral-900 dark:bg-white text-white dark:text-black text-[10px] leading-tight rounded shadow-lg z-50">
                        {tAdvanced('userTooltip')}
                        <div className="absolute top-full left-4 -ml-1 border-4 border-transparent border-t-neutral-900 dark:border-t-white"></div>
                      </div>
                    </div>
                    <input 
                      type="text" 
                      value={advancedFilters.user}
                      onChange={(e) => setAdvancedFilters(prev => ({...prev, user: e.target.value}))}
                      placeholder="ej. anthropics"
                      className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded py-1 px-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="relative group inline-flex items-center gap-1 mb-1">
                      <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">{tAdvanced('repo')}</label>
                      <Info className="w-3 h-3 text-neutral-400 cursor-help" />
                      <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block w-48 p-2 bg-neutral-900 dark:bg-white text-white dark:text-black text-[10px] leading-tight rounded shadow-lg z-50">
                        {tAdvanced('repoTooltip')}
                        <div className="absolute top-full left-4 -ml-1 border-4 border-transparent border-t-neutral-900 dark:border-t-white"></div>
                      </div>
                    </div>
                    <input 
                      type="text" 
                      value={advancedFilters.repo}
                      onChange={(e) => setAdvancedFilters(prev => ({...prev, repo: e.target.value}))}
                      placeholder="ej. anthropics/claude-code"
                      className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded py-1 px-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="relative group inline-flex items-center gap-1 mb-1">
                      <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">{tAdvanced('path')}</label>
                      <Info className="w-3 h-3 text-neutral-400 cursor-help" />
                      <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block w-48 p-2 bg-neutral-900 dark:bg-white text-white dark:text-black text-[10px] leading-tight rounded shadow-lg z-50">
                        {tAdvanced('pathTooltip')}
                        <div className="absolute top-full left-4 -ml-1 border-4 border-transparent border-t-neutral-900 dark:border-t-white"></div>
                      </div>
                    </div>
                    <input 
                      type="text" 
                      value={advancedFilters.path}
                      onChange={(e) => setAdvancedFilters(prev => ({...prev, path: e.target.value}))}
                      placeholder="ej. skills/"
                      className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded py-1 px-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 pt-2 mt-1">
                  <div className="relative group inline-flex items-center gap-1.5">
                    <span className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                      {tAdvanced('strict')}
                    </span>
                    <Info className="w-3.5 h-3.5 text-neutral-400 cursor-help" />
                    <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block w-48 p-2 bg-neutral-900 dark:bg-white text-white dark:text-black text-[10px] leading-tight rounded shadow-lg z-50">
                      {tAdvanced('strictTooltip')}
                      <div className="absolute top-full left-4 -ml-1 border-4 border-transparent border-t-neutral-900 dark:border-t-white"></div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={advancedFilters.strict} 
                      onChange={(e) => setAdvancedFilters(prev => ({...prev, strict: e.target.checked}))} 
                      className="sr-only peer" 
                    />
                    <div className="w-7 h-4 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-neutral-600 peer-checked:bg-neutral-900 dark:peer-checked:bg-white"></div>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SETTINGS VIEW */}
      {activeTab === 'settings' && (
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="flex flex-col gap-6 mt-4">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">{tSettings('githubTokenTitle')}</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">
                {tSettings('githubTokenDescription')}
              </p>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  value={githubToken}
                  onChange={(e) => {
                    setGithubToken(e.target.value);
                    chrome.storage.local.set({ githubToken: e.target.value });
                  }}
                  placeholder={tSettings('githubTokenPlaceholder')} 
                  className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg py-2 px-3 text-sm text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
                />
                {githubToken && (
                  <button
                    onClick={() => {
                      setGithubToken('');
                      chrome.storage.local.remove('githubToken');
                    }}
                    className="px-3 py-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap"
                  >
                    {tSettings('restoreDefaultToken')}
                  </button>
                )}
              </div>
            </div>
            {!githubToken && !defaultToken && (
              <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded text-xs text-neutral-600 dark:text-neutral-400">
                {tSettings('githubTokenWarning')}
              </div>
            )}
            {!githubToken && defaultToken && (
              <div className="p-3 bg-primary/10 dark:bg-primary-dark/20 border border-primary/20 dark:border-primary-dark/30 rounded text-xs text-primary-dark dark:text-primary">
                {tSettings('usingDefaultToken')}
              </div>
            )}
            
            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">{tSettings('languageTitle')}</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">
                {tSettings('languageDescription')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    chrome.storage.local.set({ language: 'en' });
                    setCurrentLanguage('en');
                  }}
                  className={`px-3 py-1.5 border rounded text-xs transition-colors ${currentLanguage === 'en' ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-transparent' : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800'}`}
                >
                  {tSettings('languageEnglish')}
                </button>
                <button
                  onClick={() => {
                    chrome.storage.local.set({ language: 'es' });
                    setCurrentLanguage('es');
                  }}
                  className={`px-3 py-1.5 border rounded text-xs transition-colors ${currentLanguage === 'es' ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-transparent' : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800'}`}
                >
                  {tSettings('languageSpanish')}
                </button>
              </div>
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">{tSettings('themeTitle')}</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">
                {tSettings('themeDescription')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    chrome.storage.local.set({ theme: 'light' });
                    setCurrentTheme('light');
                  }}
                  className={`px-3 py-1.5 border rounded text-xs transition-colors ${currentTheme === 'light' ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-transparent' : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800'}`}
                >
                  {tSettings('themeLight')}
                </button>
                <button
                  onClick={() => {
                    chrome.storage.local.set({ theme: 'dark' });
                    setCurrentTheme('dark');
                  }}
                  className={`px-3 py-1.5 border rounded text-xs transition-colors ${currentTheme === 'dark' ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-transparent' : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800'}`}
                >
                  {tSettings('themeDark')}
                </button>
              </div>
            </div>
            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 mt-6 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-500">
                <span>{tCommon('createdBy')} <a href="mailto:info@peramas.com" className="text-neutral-700 dark:text-neutral-300 hover:underline font-medium">Joan Peramas</a></span>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <a href="https://github.com/joanperamasc/snap_skills" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors" title={tCommon('viewInGitHub')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY VIEW */}
      {activeTab === 'history' && (
        <div className="flex-1 overflow-y-auto px-4 pb-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-neutral-200 dark:bg-neutral [&::-webkit-scrollbar-track]:bg-transparent">
          {searchHistory.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-neutral-500 text-sm">
              {tHistory('noHistory')}
            </div>
          ) : (
            <div className="flex flex-col mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{tHistory('title')}</h3>
                <button 
                  onClick={() => {
                    setSearchHistory([]);
                    chrome.storage.local.set({ searchHistory: [] });
                  }}
                  className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-white transition-colors"
                >
                  {tHistory('clearHistory')}
                </button>
              </div>
              {searchHistory.map((historyQuery, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(historyQuery);
                    setActiveTab('library');
                  }}
                  className="flex items-center gap-3 py-3 border-b border-neutral-200 dark:border-neutral-800 last:border-b-0 hover:opacity-80 transition-opacity text-left w-full cursor-pointer"
                >
                  <History className="w-4 h-4 text-neutral-500 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300 truncate">{historyQuery}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SKILLS LIST */}
      {(activeTab === 'library' || activeTab === 'saved' || activeTab === 'created') && (
      <div className="flex-1 overflow-y-auto px-4 pb-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-neutral-200 dark:bg-neutral [&::-webkit-scrollbar-track]:bg-transparent">
        {loading && page === 1 ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
          </div>
        ) : displayedSkills.length === 0 ? (
          <EmptyState 
            type={activeTab === 'library' && debouncedQuery ? 'not-found' : activeTab === 'library' ? 'idle' : activeTab === 'created' ? 'empty-created' : 'empty-saved'} 
            message={activeTab === 'library' ? (debouncedQuery ? tLibrary('noSkillsFound') : tLibrary('searchPrompt')) : activeTab === 'created' ? tCreated('noCreatedSkills') : tSaved('noSavedSkills')} 
          />
        ) : (
          <div className="flex flex-col">
            {displayedSkills.map((skill) => {
              const isSaved = savedSkills.some(s => s.id === skill.id);
              return (
                <div key={skill.id} className="py-4 border-b border-neutral-200 dark:border-neutral-800 last:border-b-0 group flex flex-col gap-1">
                  <div 
                    className="flex flex-col gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleViewSkill(skill)}
                  >
                    <div className="flex items-center gap-3">
                      <Terminal className="w-4 h-4 text-neutral-600 dark:text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        <span className="uppercase text-neutral-600 dark:text-neutral-400 font-medium">{skill.source.split('/')[0]}:</span> {skill.name}
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed ml-7">
                      {skill.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-7 mt-2">
                    <Tooltip content={isSaved ? tCommon('remove') : tCommon('save')} position="top">
                      <button 
                        onClick={() => handleSave(skill)}
                        className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-white hover:bg-neutral-100 dark:bg-neutral-900 rounded transition-colors cursor-pointer"
                      >
                        <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
                      </button>
                    </Tooltip>
                    <Tooltip content={tCommon('copyContent')} position="top">
                      <button 
                        onClick={() => executeAction(skill, 'copy')}
                        disabled={actionLoading === skill.id}
                        className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-white hover:bg-neutral-100 dark:bg-neutral-900 rounded transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {copiedId === skill.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </Tooltip>
                    <Tooltip content={tCommon('downloadMD')} position="top">
                      <button 
                        onClick={() => executeAction(skill, 'download')}
                        disabled={actionLoading === skill.id}
                        className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-white hover:bg-neutral-100 dark:bg-neutral-900 rounded transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {actionLoading === skill.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      </button>
                    </Tooltip>
                    {!skill.isCustom && (
                    <Tooltip content={tCommon('viewInGitHub')} position="top">
                      <button 
                        onClick={() => handleOpenGithubSkill(skill)}
                        className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-white hover:bg-neutral-100 dark:bg-neutral-900 rounded transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </Tooltip>
                    )}
                  </div>
                </div>
              );
            })}
            
            {activeTab === 'library' && searchError && searchError === 'RATE_LIMIT' && (
              <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                <EmptyState 
                  type="rate-limit"
                  message={tLibrary('rateLimitTitle')} 
                  submessage={tLibrary('rateLimitDesc')} 
                />
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="mt-6 px-4 py-2 bg-neutral-900 text-white dark:bg-white dark:text-black rounded text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  {tLibrary('goToSettings')}
                </button>
              </div>
            )}

            {activeTab === 'library' && searchError && searchError !== 'RATE_LIMIT' && (
              <div className="py-4 text-center">
                <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">{searchError}</p>
              </div>
            )}
            
            {activeTab === 'library' && hasMore && !searchError && (
              <div className="py-4 flex justify-center border-t border-neutral-100 dark:border-neutral-800/50">
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={loading}
                  className="px-4 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 hover:text-white dark:text-white bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {loading && page > 1 && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Cargar Más
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      )}

      {/* BOTTOM NAVIGATION */}
      <div className="flex-none flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black h-14">
        <button 
          onClick={() => setActiveTab('library')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full cursor-pointer transition-colors ${activeTab === 'library' ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-600 dark:text-neutral-400'}`}
        >
          <Database className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-[10px] font-medium">{tLibrary('title')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('saved')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full cursor-pointer transition-colors ${activeTab === 'saved' ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-600 dark:text-neutral-400'}`}
        >
          <Bookmark className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-[10px] font-medium">{tSaved('title')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('created')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full cursor-pointer transition-colors ${activeTab === 'created' ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-600 dark:text-neutral-400'}`}
        >
          <PenTool className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-[10px] font-medium">{tCreated('title')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full cursor-pointer transition-colors ${activeTab === 'history' ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-600 dark:text-neutral-400'}`}
        >
          <History className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-[10px] font-medium">{tHistory('title')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full cursor-pointer transition-colors ${activeTab === 'settings' ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-600 dark:text-neutral-400'}`}
        >
          <Settings className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-[10px] font-medium">{tSettings('title')}</span>
        </button>
      </div>
        </>
      )}
    </div>
  );
}
