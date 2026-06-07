export type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  totalAnalyzedRepositories?: number;
};

export type Report = {
  _id: string;
  project?: string;
  title: string;
  summary: string;
  overview: string;
  repositoryUrl?: string;
  version: number;
  languageBreakdown?: Array<{ language: string; files: number }>;
  controllers?: Array<{ file: string; functions: string[]; responsibilities: string[]; source?: SourceRef }>;
  middleware?: Array<{ file: string; name: string; checks: string[]; source?: SourceRef }>;
  services?: Array<{ file: string; name: string; externalCalls: string[]; source?: SourceRef }>;
  dependencyGraph?: {
    apiChains?: Array<{ endpoint: string; chain: string[] }>;
    services?: Array<{ name: string; file: string; externalCalls: string[] }>;
  };
  codeQuality?: {
    score: number;
    summary: string;
    issues: Array<AnalysisIssue>;
  };
  techStack: string[];
  security: {
    score: number;
    issues?: Array<AnalysisIssue>;
    vulnerabilities?: string[];
    recommendations: string[];
    checklist?: Record<string, boolean>;
  };
  apis: Array<{ method: string; path: string; file: string; description: string; controller?: string; middleware?: string[]; request?: string[]; response?: string[]; citations?: SourceRef[]; source?: SourceRef; flowTrace?: RouteFlow }>;
  database: {
    models: Array<ModelInfo>;
    prismaModels: Array<ModelInfo>;
    relationships?: Array<{ from: string; to: string; field: string; file: string; type?: string }>;
    relationshipSummary?: string[];
    explanation?: string;
  };
  architecture: {
    systemDiagram: string;
    authDiagram: string;
    apiDiagram: string;
    databaseDiagram?: string;
    dependencyDiagram?: string;
    summary: string;
    layers?: Record<string, string[]>;
  };
  authentication: {
    type?: string;
    jwtGeneration?: Array<{ file: string; line: number; code: string }>;
    jwtVerification?: Array<{ file: string; line: number; code: string }>;
    cookieSettings?: Array<{ file: string; line: number; code: string }>;
    protectedRoutes?: Array<{ method: string; path: string; middleware: string[]; source: SourceRef }>;
    publicRoutes?: Array<{ method: string; path: string; source: SourceRef }>;
    logoutFlow?: { explanation: string; locations: SourceRef[] };
    loginFlow?: string;
    registrationFlow?: string;
    authorizationFlow?: string;
    middlewareExplanation?: string;
  };
  interviewQuestions: Record<string, string[]>;
  projectExplanations?: Record<string, string>;
  repositoryWalkthrough?: { title: string; explanation: string; evidence: SourceRef[] };
  resumeKit?: {
    resumeBullets: string[];
    linkedInDescription: string;
    githubReadme: string;
    twoMinutePitch: string;
  };
  qualitySignals?: Record<string, boolean>;
  readme?: string;
  markdown: string;
  createdAt: string;
};

export type SourceRef = {
  file: string;
  line: number;
  code?: string;
};

export type AnalysisIssue = {
  severity: "Critical" | "High" | "Medium" | "Low";
  title: string;
  recommendation: string;
  evidence?: SourceRef[];
};

export type ModelInfo = {
  name: string;
  type: string;
  file: string;
  fields: string[];
  keyFields?: string[];
  purpose?: string;
  source?: SourceRef;
};

export type RouteFlow = {
  label: string;
  route: SourceRef;
  middleware: Array<{ name: string; source?: SourceRef | null }>;
  controller: { name: string; source?: SourceRef | null };
  services: Array<{ name: string; source: SourceRef }>;
  models: Array<{ name: string; source: SourceRef }>;
  externalApis: Array<{ name: string; source: SourceRef }>;
  steps: string[];
};

export type Project = {
  _id: string;
  name: string;
  sourceType: string;
  repositoryUrl?: string;
  techStack: string[];
  totalApis: number;
  totalModels: number;
  securityScore: number;
  latestVersion: number;
};
