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
  title: string;
  summary: string;
  overview: string;
  repositoryUrl?: string;
  version: number;
  languageBreakdown?: Array<{ language: string; files: number }>;
  controllers?: Array<{ file: string; functions: string[]; responsibilities: string[] }>;
  middleware?: Array<{ file: string; name: string; checks: string[] }>;
  services?: Array<{ file: string; name: string; externalCalls: string[] }>;
  dependencyGraph?: {
    apiChains?: Array<{ endpoint: string; chain: string[] }>;
    services?: Array<{ name: string; file: string; externalCalls: string[] }>;
  };
  techStack: string[];
  security: {
    score: number;
    issues?: Array<{ severity: "Critical" | "High" | "Medium" | "Low"; title: string; recommendation: string }>;
    vulnerabilities?: string[];
    recommendations: string[];
    checklist?: Record<string, boolean>;
  };
  apis: Array<{ method: string; path: string; file: string; description: string; controller?: string; middleware?: string[]; request?: string[]; response?: string[]; citations?: string[] }>;
  database: {
    models: Array<{ name: string; type: string; file: string; fields: string[] }>;
    prismaModels: Array<{ name: string; type: string; file: string; fields?: string[] }>;
    relationships?: Array<{ from: string; to: string; field: string; file: string }>;
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
    protectedRoutes?: Array<{ method: string; path: string; middleware: string[]; source: string }>;
    loginFlow?: string;
    registrationFlow?: string;
    authorizationFlow?: string;
    middlewareExplanation?: string;
  };
  interviewQuestions: Record<string, string[]>;
  projectExplanations?: Record<string, string>;
  qualitySignals?: Record<string, boolean>;
  readme?: string;
  markdown: string;
  createdAt: string;
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
