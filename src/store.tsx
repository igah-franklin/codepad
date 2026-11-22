import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TEMPLATES, starterCode } from './templates';
import type { Language } from './theme';

export type Project = {
  id: string;
  name: string; // without extension
  language: Language;
  code: string;
  stdin: string;
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
};

export type Settings = {
  theme: 'dark' | 'light' | 'system';
  fontSize: number;
  wrap: boolean;
  autocomplete: boolean;
  lineNumbers: boolean;
  tabSize: 2 | 4;
  timeoutSec: number;
  haptics: boolean;
  keyBar: boolean;
  preloadPython: boolean;
  clearOnRun: boolean;
};

export const defaultSettings: Settings = {
  theme: 'dark',
  fontSize: 14,
  wrap: false,
  autocomplete: true,
  lineNumbers: true,
  tabSize: 4,
  timeoutSec: 15,
  haptics: true,
  keyBar: true,
  preloadPython: true,
  clearOnRun: true,
};

type Store = {
  ready: boolean;
  projects: Project[];
  settings: Settings;
  updateSettings: (p: Partial<Settings>) => void;
  createProject: (p: { language: Language; name?: string; code?: string; stdin?: string }) => Project;
  updateProject: (id: string, p: Partial<Omit<Project, 'id'>>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => Project | null;
  getProject: (id: string) => Project | undefined;
};

const Ctx = createContext<Store | null>(null);
const K_PROJECTS = 'codepad.projects.v1';
const K_SETTINGS = 'codepad.settings.v1';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

function uniqueName(base: string, language: Language, projects: Project[]) {
  const taken = new Set(projects.filter((p) => p.language === language).map((p) => p.name.toLowerCase()));
  if (!taken.has(base.toLowerCase())) return base;
  let i = 2;
  while (taken.has(`${base}_${i}`.toLowerCase())) i++;
  return `${base}_${i}`;
}

function seed(): Project[] {
  const now = Date.now();
  return ['py-hello', 'js-hello'].map((tid, i) => {
    const t = TEMPLATES.find((x) => x.id === tid)!;
    return { id: uid() + i, name: t.filename, language: t.language, code: t.code, stdin: t.stdin || '', createdAt: now - i * 1000, updatedAt: now - i * 1000 };
  });
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const projectsRef = useRef<Project[]>([]);
  projectsRef.current = projects;

  useEffect(() => {
    (async () => {
      try {
        const [p, s] = await Promise.all([AsyncStorage.getItem(K_PROJECTS), AsyncStorage.getItem(K_SETTINGS)]);
        setProjects(p ? JSON.parse(p) : seed());
        if (s) setSettings({ ...defaultSettings, ...JSON.parse(s) });
      } catch {
        setProjects(seed());
      }
      setReady(true);
    })();
  }, []);

  // Debounced persistence
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(K_PROJECTS, JSON.stringify(projects)).catch(() => {});
    }, 400);
  }, [projects, ready]);
  useEffect(() => {
    if (ready) AsyncStorage.setItem(K_SETTINGS, JSON.stringify(settings)).catch(() => {});
  }, [settings, ready]);

  const updateSettings = useCallback((p: Partial<Settings>) => setSettings((s) => ({ ...s, ...p })), []);

  const createProject = useCallback<Store['createProject']>(({ language, name, code, stdin }) => {
    const now = Date.now();
    const proj: Project = {
      id: uid(),
      name: uniqueName((name || 'untitled').replace(/\.(js|py)$/i, ''), language, projectsRef.current),
      language,
      code: code ?? starterCode[language],
      stdin: stdin || '',
      createdAt: now,
      updatedAt: now,
    };
    projectsRef.current = [proj, ...projectsRef.current];
    setProjects(projectsRef.current);
    return proj;
  }, []);

  const updateProject = useCallback<Store['updateProject']>((id, p) => {
    setProjects((ps) => ps.map((x) => (x.id === id ? { ...x, ...p, updatedAt: p.pinned !== undefined && Object.keys(p).length === 1 ? x.updatedAt : Date.now() } : x)));
  }, []);

  const deleteProject = useCallback((id: string) => setProjects((ps) => ps.filter((x) => x.id !== id)), []);

  const duplicateProject = useCallback((id: string) => {
    const src = projectsRef.current.find((x) => x.id === id);
    if (!src) return null;
    return createProject({ language: src.language, name: src.name + '_copy', code: src.code, stdin: src.stdin });
  }, [createProject]);

  const getProject = useCallback((id: string) => projectsRef.current.find((x) => x.id === id), []);

  const value = useMemo(
    () => ({ ready, projects, settings, updateSettings, createProject, updateProject, deleteProject, duplicateProject, getProject }),
    [ready, projects, settings, updateSettings, createProject, updateProject, deleteProject, duplicateProject, getProject],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside provider');
  return s;
}
