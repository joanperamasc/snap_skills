const fs = require('fs');
let code = fs.readFileSync('src/components/SidePanel.tsx', 'utf8');

// 1. Update imports
code = code.replace(
  /import \{ Zap, Search, (.*?) \} from 'lucide-react';/,
  "import { Zap, Search, $1, Plus, PenTool, Bold, Italic, Code, List, Eye, Edit2 } from 'lucide-react';"
);

// 2. Update Skill type
code = code.replace(
  /path: string;\n\};/,
  'path: string;\n  isCustom?: boolean;\n  content?: string;\n};'
);

// 3. Update translations & state
code = code.replace(
  /const tHistory = useTranslations\('History'\);/,
  "const tHistory = useTranslations('History');\n  const tCreated = useTranslations('Created');\n  const tEditor = useTranslations('Editor');"
);
code = code.replace(
  /useState<'library' \| 'saved' \| 'history' \| 'settings'>/,
  "useState<'library' | 'saved' | 'history' | 'created' | 'settings'>"
);
code = code.replace(
  /const \[savedSkills, setSavedSkills\] = useState<Skill\[\]>\(\[\]\);/,
  "const [savedSkills, setSavedSkills] = useState<Skill[]>([]);\n  const [createdSkills, setCreatedSkills] = useState<Skill[]>([]);\n  const [isCreating, setIsCreating] = useState(false);\n  const [editId, setEditId] = useState('');\n  const [editTitle, setEditTitle] = useState('');\n  const [editContent, setEditContent] = useState('');\n  const [editPreview, setEditPreview] = useState(false);\n  const textareaRef = useRef<HTMLTextAreaElement>(null);"
);
code = code.replace(
  /import \{ useState, useEffect \} from 'react';/,
  "import { useState, useEffect, useRef } from 'react';"
);

// 4. Update storage GET
code = code.replace(
  /chrome\.storage\.local\.get\(\['savedSkills', 'githubToken', 'searchHistory'\], \(result\) => \{/,
  "chrome.storage.local.get(['savedSkills', 'githubToken', 'searchHistory', 'createdSkills'], (result) => {"
);
code = code.replace(
  /if \(Array\.isArray\(result\.searchHistory\)\) setSearchHistory\(result\.searchHistory as string\[\]\);/,
  "if (Array.isArray(result.searchHistory)) setSearchHistory(result.searchHistory as string[]);\n      if (Array.isArray(result.createdSkills)) setCreatedSkills(result.createdSkills as Skill[]);"
);

// 5. Insert Editor auto-save logic after executeAction
const autoSaveLogic = `
  const debouncedEditTitle = useDebounce(editTitle, 1000);
  const debouncedEditContent = useDebounce(editContent, 1000);

  useEffect(() => {
    if (isCreating && editId) {
      const newSkill = {
        id: editId,
        slug: editTitle.toLowerCase().replace(/\\s+/g, '-'),
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
    setEditContent('# ' + tEditor('newSkill') + '\\n\\n');
    setIsCreating(true);
    setEditPreview(false);
  };

  const insertFormat = (prefix, suffix = '') => {
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
`;

code = code.replace(/const handleSave = /, autoSaveLogic + '\n  const handleSave = ');

// 6. Update executeAction to handle custom skills
code = code.replace(
  /const mdFile = response\.data\.files\.find[^\n]*\n[^\n]*\n/,
  `const mdFile = response.data.files.find((f) => f.path === skill.path || f.path.endsWith('.md'));
        const content = mdFile ? mdFile.contents : '# ' + skill.name + '\\n' + tCommon('noMarkdownContent');
`
);
// Make executeAction check for custom first
code = code.replace(
  /setActionLoading\(skill\.id\);\n    chrome\.runtime\.sendMessage/,
  `setActionLoading(skill.id);
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
        a.download = \`\${skill.slug || 'skill'}.md\`;
        a.click();
        URL.revokeObjectURL(url);
      }
      setActionLoading(null);
      return;
    }
    chrome.runtime.sendMessage`
);

// 7. Update handleViewSkill for custom skills
code = code.replace(
  /const handleViewSkill = \(skill: Skill\) => \{\n    setSelectedSkill\(skill\);\n    setMarkdownLoading\(true\);\n    setSkillMarkdown\(null\);\n    chrome\.runtime\.sendMessage/,
  `const handleViewSkill = (skill) => {
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
    chrome.runtime.sendMessage`
);

// 8. Update handleCopy and handleDownload for custom skills inside detail view
code = code.replace(
  /const handleCopy = \(\) => \{/,
  `const handleCopy = () => {
    if (selectedSkill?.isCustom) {
      navigator.clipboard.writeText(selectedSkill.content || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }`
);
code = code.replace(
  /const handleDownload = \(\) => \{\n    if \(skillMarkdown && selectedSkill\) \{/,
  `const handleDownload = () => {
    if (selectedSkill?.isCustom) {
      const blob = new Blob([selectedSkill.content || ''], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`\${selectedSkill.slug}.md\`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    if (skillMarkdown && selectedSkill) {`
);
code = code.replace(
  /const handleOpenGithub = \(\) => \{\n    if \(selectedSkill\) \{/,
  `const handleOpenGithub = () => {
    if (selectedSkill?.isCustom) return;
    if (selectedSkill) {`
);

// 9. Hide Open in GitHub if isCustom inside detail view
code = code.replace(
  /<Tooltip content=\{tCommon\('viewInGitHub'\)\} position="bottom">\n                <button \n                  onClick=\{handleOpenGithub\}\n                  className="p-1\.5 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded transition-colors cursor-pointer"\n                >\n                  <ExternalLink className="w-4 h-4" \/>\n                <\/button>\n              <\/Tooltip>/,
  `{!selectedSkill?.isCustom && (
              <Tooltip content={tCommon('viewInGitHub')} position="bottom">
                <button 
                  onClick={handleOpenGithub}
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </Tooltip>
              )}`
);

// Do the same for list view viewInGitHub button
code = code.replace(
  /<Tooltip content=\{tCommon\('viewInGitHub'\)\} position="top">\n                      <button \n                        onClick=\{\(\) => handleOpenGithubSkill\(skill\)\}\n                        className="p-1\.5 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded transition-colors cursor-pointer"\n                      >\n                        <ExternalLink className="w-4 h-4" \/>\n                      <\/button>\n                    <\/Tooltip>/g,
  `{!skill.isCustom && (
                    <Tooltip content={tCommon('viewInGitHub')} position="top">
                      <button 
                        onClick={() => handleOpenGithubSkill(skill)}
                        className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </Tooltip>
                    )}`
);

// 10. Update displayedSkills to include created
code = code.replace(
  /const displayedSkills = activeTab === 'library' \? skills : savedSkills;/,
  `const displayedSkills = activeTab === 'library' ? skills : activeTab === 'created' ? createdSkills : savedSkills;`
);

// 11. Add + button in header
code = code.replace(
  /<div className="flex items-center gap-2">\n            <Zap className="w-5 h-5 text-white fill-white" strokeWidth=\{1\.5\} \/>\n            <h1 className="text-base font-semibold tracking-wide m-0 text-white">SNAPSKILLS<\/h1>\n          <\/div>/,
  `<div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-white fill-white" strokeWidth={1.5} />
              <h1 className="text-base font-semibold tracking-wide m-0 text-white">SNAPSKILLS</h1>
            </div>
            <Tooltip content={tEditor('newSkill')} position="bottom">
              <button onClick={handleCreateNew} className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded transition-colors cursor-pointer">
                <Plus className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>`
);

// 12. Add Editor View
const editorView = `
      {/* EDITOR VIEW */}
      {isCreating && (
        <div className="flex flex-col h-full overflow-hidden w-full absolute inset-0 bg-black z-20">
          <div className="flex-none bg-black border-b border-neutral-800 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => { setIsCreating(false); setSelectedSkill(null); }} className="text-neutral-400 hover:text-white transition-colors cursor-pointer flex-shrink-0">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-semibold text-white">{tEditor('newSkill')}</h2>
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
              className="w-full bg-transparent text-base font-semibold text-white placeholder-neutral-600 focus:outline-none"
            />
          </div>
          
          <div className="flex-none flex items-center border-b border-neutral-800 px-4 bg-neutral-900/30">
            <button 
              onClick={() => setEditPreview(false)}
              className={\`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 \${!editPreview ? 'border-white text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'}\`}
            >
              <Edit2 className="w-3.5 h-3.5" /> {tEditor('edit')}
            </button>
            <button 
              onClick={() => setEditPreview(true)}
              className={\`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 \${editPreview ? 'border-white text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'}\`}
            >
              <Eye className="w-3.5 h-3.5" /> {tEditor('preview')}
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {!editPreview && (
              <div className="flex-none flex items-center gap-1 p-2 border-b border-neutral-800 bg-black">
                <button onClick={() => insertFormat('**', '**')} className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors" title="Bold">
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => insertFormat('*', '*')} className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors" title="Italic">
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <div className="w-[1px] h-4 bg-neutral-800 mx-1"></div>
                <button onClick={() => insertFormat('\`\`\`\\n', '\\n\`\`\`')} className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors" title="Code Block">
                  <Code className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => insertFormat('- ')} className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors" title="List">
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-neutral-800 [&::-webkit-scrollbar-track]:bg-transparent">
              {!editPreview ? (
                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full min-h-full bg-black text-neutral-300 text-sm p-4 font-mono leading-relaxed resize-none focus:outline-none"
                  placeholder="Escribe tu skill en Markdown..."
                />
              ) : (
                <div className="prose prose-invert prose-sm max-w-none p-4 prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-800 prose-a:text-blue-400">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {editContent || '*No content*'}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(/\{selectedSkill \? \(/, editorView + '\n      {selectedSkill && !isCreating ? (');

// 13. Update SKILLS LIST condition
code = code.replace(
  /\{\(activeTab === 'library' \|\| activeTab === 'saved'\) && \(/,
  `{(activeTab === 'library' || activeTab === 'saved' || activeTab === 'created') && (`
);

// 14. Update 'noSkillsFound' logic
code = code.replace(
  /activeTab === 'library' \? \(query \? tLibrary\('noSkillsFound'\) : tLibrary\('searchPrompt'\)\) : tSaved\('noSavedSkills'\)/,
  `activeTab === 'library' ? (query ? tLibrary('noSkillsFound') : tLibrary('searchPrompt')) : activeTab === 'created' ? tCreated('noCreatedSkills') : tSaved('noSavedSkills')`
);

// 15. Update detail content display if custom skill
code = code.replace(
  /<ReactMarkdown remarkPlugins=\{\[remarkGfm\]\}>\n                  \{skillMarkdown \|\| ''\}\n                <\/ReactMarkdown>/,
  `<ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedSkill?.isCustom ? selectedSkill.content || '' : skillMarkdown || ''}
                </ReactMarkdown>`
);

// 16. Add Created tab in bottom nav
code = code.replace(
  /<Bookmark className="w-4 h-4" strokeWidth=\{1\.5\} \/>\n          <span className="text-\[10px\] font-medium">\{tSaved\('title'\)\}<\/span>\n        <\/button>/,
  `<Bookmark className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-[10px] font-medium">{tSaved('title')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('created')}
          className={\`flex-1 flex flex-col items-center justify-center gap-1 h-full cursor-pointer transition-colors \${activeTab === 'created' ? 'text-white' : 'text-neutral-500 hover:text-neutral-400'}\`}
        >
          <PenTool className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-[10px] font-medium">{tCreated('title')}</span>
        </button>`
);

fs.writeFileSync('src/components/SidePanel.tsx', code);
console.log('Update completed successfully.');
