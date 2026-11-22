import type { Challenge, Level, LevelId, Module, ModuleDef } from './types';

import eBasics from './data/easy/basics';
import eStrings from './data/easy/strings';
import eArrays from './data/easy/arrays';
import eLoops from './data/easy/loops';
import eConditionals from './data/easy/conditionals';
import eDicts from './data/easy/dicts';
import eNumbers from './data/easy/numbers';
import eTransforms from './data/easy/transforms';
import eText from './data/easy/text';
import eSearching from './data/easy/searching';

import mHashing from './data/medium/hashing';
import mTwoPointers from './data/medium/twopointers';
import mWindow from './data/medium/window';
import mStacks from './data/medium/stacks';
import mIntervals from './data/medium/intervals';
import mBinary from './data/medium/binarysearch';
import mStrings from './data/medium/strings';
import mMatrix from './data/medium/matrix';
import mBacktracking from './data/medium/backtracking';
import mLinked from './data/medium/linkedlists';

import hDp1 from './data/hard/dp1';
import hDp2 from './data/hard/dp2';
import hGraphs from './data/hard/graphs';
import hTrees from './data/hard/trees';
import hGreedy from './data/hard/greedy';
import hStrings from './data/hard/strings';
import hArrays from './data/hard/arrays';
import hBacktracking from './data/hard/backtracking';
import hBits from './data/hard/bits';
import hDesign from './data/hard/design';

import iArrays from './data/interview/arrays';
import iStrings from './data/interview/strings';
import iTrees from './data/interview/trees';
import iGraphs from './data/interview/graphs';
import iDp from './data/interview/dp';
import iLinked from './data/interview/linkedlists';
import iDesign from './data/interview/design';
import iMath from './data/interview/math';
import iSorting from './data/interview/sorting';
import iMock from './data/interview/mock';

const RAW: { id: LevelId; title: string; blurb: string; color: string; modules: ModuleDef[] }[] = [
  {
    id: 'easy', title: 'Easy', color: '#3FB950',
    blurb: 'Core syntax: loops, conditions, strings, arrays and dictionaries.',
    modules: [eBasics, eStrings, eArrays, eLoops, eConditionals, eDicts, eNumbers, eTransforms, eText, eSearching],
  },
  {
    id: 'medium', title: 'Medium', color: '#D29922',
    blurb: 'Core techniques: hashing, two pointers, sliding windows, stacks, binary search and recursion.',
    modules: [mHashing, mTwoPointers, mWindow, mStacks, mIntervals, mBinary, mStrings, mMatrix, mBacktracking, mLinked],
  },
  {
    id: 'hard', title: 'Hard', color: '#F85149',
    blurb: 'Advanced algorithms: dynamic programming, graphs, heaps, tries and data-structure design.',
    modules: [hDp1, hDp2, hGraphs, hTrees, hGreedy, hStrings, hArrays, hBacktracking, hBits, hDesign],
  },
  {
    id: 'interview', title: 'Interview', color: '#A371F7',
    blurb: 'Classic questions from real interview loops, grouped by topic, with the follow-ups interviewers ask.',
    modules: [iArrays, iStrings, iTrees, iGraphs, iDp, iLinked, iDesign, iMath, iSorting, iMock],
  },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const LEVELS: Level[] = RAW.map((lvl) => ({
  ...lvl,
  modules: lvl.modules.map((m): Module => {
    const key = `${lvl.id}.${m.id}`;
    return {
      id: m.id, title: m.title, description: m.description, level: lvl.id, key,
      challenges: m.challenges.map((c, i): Challenge => ({
        ...c, id: `${key}.${slug(c.title)}`, level: lvl.id, moduleId: m.id, moduleTitle: m.title, index: i + 1,
      })),
    };
  }),
}));

export const ALL_CHALLENGES: Challenge[] = LEVELS.flatMap((l) => l.modules.flatMap((m) => m.challenges));
const byId = new Map(ALL_CHALLENGES.map((c) => [c.id, c]));
const modByKey = new Map(LEVELS.flatMap((l) => l.modules).map((m) => [m.key, m]));

export const getChallenge = (id: string | undefined) => (id ? byId.get(id) : undefined);
export const getModule = (key: string | undefined) => (key ? modByKey.get(key) : undefined);
export const getLevel = (id: string | undefined) => LEVELS.find((l) => l.id === id);

export type { Challenge, Level, LevelId, Module } from './types';
