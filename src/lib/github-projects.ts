export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  homepage: string | null;
  fork: boolean;
  archived: boolean;
  stargazers_count: number;
  pushed_at: string;
}

const EXCLUDED_REPO_PATTERNS = [/portfolio/i, /^suwam[-_]?portfolio$/i, /^portfolio$/i, /^suwam$/i];

export const formatRepoTitle = (repoName: string) =>
  repoName
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

export const normalizeRepoKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/^suwam\//, "")
    .replace(/\.git$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getGithubRepoApiUrl = (username: string) =>
  `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&direction=desc&per_page=100`;

export const isExcludedGithubRepo = (repo: Pick<GithubRepo, "name">) =>
  EXCLUDED_REPO_PATTERNS.some((pattern) => pattern.test(repo.name.trim()));