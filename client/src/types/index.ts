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
  repositoryUrl?: string;
  version: number;
  techStack: string[];
  security: {
    score: number;
    vulnerabilities: string[];
    recommendations: string[];
  };
  apis: Array<{ method: string; path: string; file: string; description: string }>;
  database: {
    models: Array<{ name: string; type: string; file: string; fields: string[] }>;
    prismaModels: Array<{ name: string; type: string; file: string }>;
  };
  architecture: {
    systemDiagram: string;
    authDiagram: string;
    apiDiagram: string;
    summary: string;
  };
  authentication: Record<string, unknown>;
  interviewQuestions: Record<string, string[]>;
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

