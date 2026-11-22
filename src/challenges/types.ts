export type LevelId = 'easy' | 'medium' | 'hard' | 'interview';

/** 'list' = singly linked list (ListNode), 'tree' = binary tree (TreeNode, level-order array with nulls). */
export type DataType = 'list' | 'tree' | null;

export type Compare =
  | 'exact'          // deep equality
  | 'unordered'      // outer array may be in any order
  | 'unorderedDeep'  // outer and inner arrays may be in any order
  | 'float';         // numbers within 1e-6

/** A test: [arguments, expected]. For class challenges: [[methodNames, argLists], expectedOutputs]. */
export type Test = [unknown[], unknown];

export type ChallengeDef = {
  title: string;
  /** Function (or class) name in JavaScript. Python uses the snake_case version (classes keep their name). */
  fn: string;
  /** Parameter names in JavaScript; Python uses snake_case. */
  args: string[];
  prompt: string;
  notes?: string[];
  tests: Test[];
  compare?: Compare;
  types?: { args?: DataType[]; ret?: DataType };
  /** Design problems: a class with these methods. Tests list method calls; the first call is the constructor. */
  methods?: { name: string; args: string[] }[];
  js: string;
  py: string;
  explain: string;
  complexity: string;
};

export type ModuleDef = {
  id: string;
  title: string;
  description: string;
  challenges: ChallengeDef[];
};

export type Challenge = ChallengeDef & {
  id: string;
  level: LevelId;
  moduleId: string;
  moduleTitle: string;
  index: number; // 1-based position inside its module
};

export type Module = Omit<ModuleDef, 'challenges'> & { level: LevelId; key: string; challenges: Challenge[] };

export type Level = { id: LevelId; title: string; blurb: string; color: string; modules: Module[] };
