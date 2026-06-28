import "server-only";
import fs from "fs/promises";
import path from "path";

const CONTENT_ROOT = path.join(process.cwd(), "storage", "content");
const MAX_CHARS = 20_000;
const ALLOWED_EXTENSIONS = new Set([".md", ".json", ".txt"]);

/** Safely resolve a user-supplied relative path inside storage/content/.
 *  Throws if the resolved path escapes the content root (path traversal guard). */
function safePath(relativePath: string): string {
  // Normalize and strip leading slashes
  const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
  const resolved = path.resolve(CONTENT_ROOT, normalized);

  if (!resolved.startsWith(CONTENT_ROOT)) {
    throw new Error(`Path traversal detected: "${relativePath}" is not allowed.`);
  }

  return resolved;
}

// ---------------------------------------------------------------------------
// Tool 1: list_files
// ---------------------------------------------------------------------------

/** List files and directories inside storage/content/<path>. */
export async function executeListFiles(relativePath: string): Promise<string> {
  try {
    const target = safePath(relativePath);
    const entries = await fs.readdir(target, { withFileTypes: true });

    const result = entries.map((e) => ({
      name: e.name,
      type: e.isDirectory() ? "directory" : "file",
    }));

    return JSON.stringify(result, null, 2);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return JSON.stringify({ error: `list_files failed: ${message}` });
  }
}

// ---------------------------------------------------------------------------
// Tool 2: read_file
// ---------------------------------------------------------------------------

/** Read the content of a single file inside storage/content/<path>.
 *  Files larger than MAX_CHARS are head+tail truncated to preserve context. */
export async function executeReadFile(relativePath: string): Promise<string> {
  try {
    const target = safePath(relativePath);
    const ext = path.extname(target).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return JSON.stringify({ error: `File type "${ext}" is not allowed. Only .md, .json, .txt files can be read.` });
    }

    const raw = await fs.readFile(target, "utf-8");

    if (raw.length <= MAX_CHARS) {
      return raw;
    }

    // Smart truncation: first 15k + last 5k chars with a notice in between
    const head = raw.slice(0, 15_000);
    const tail = raw.slice(-5_000);
    return `${head}\n\n[... content truncated (${raw.length} total chars, showing first 15,000 and last 5,000) ...]\n\n${tail}`;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return JSON.stringify({ error: `read_file failed: ${message}` });
  }
}

// ---------------------------------------------------------------------------
// Tool 3: grep_content
// ---------------------------------------------------------------------------

interface GrepMatch {
  file: string;
  lines: { lineNumber: number; text: string }[];
}

/** Search for a keyword across all allowed files in storage/content/<directory>.
 *  Returns file names and matching line excerpts (case-insensitive). */
export async function executeGrepContent(
  directory: string,
  query: string
): Promise<string> {
  try {
    const target = safePath(directory);
    const matches: GrepMatch[] = [];

    await grepDir(target, target, query.toLowerCase(), matches);

    if (matches.length === 0) {
      return JSON.stringify({ message: `No matches found for "${query}" in "${directory}".` });
    }

    return JSON.stringify(matches, null, 2);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return JSON.stringify({ error: `grep_content failed: ${message}` });
  }
}

async function grepDir(
  rootDir: string,
  currentDir: string,
  query: string,
  results: GrepMatch[]
): Promise<void> {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      await grepDir(rootDir, fullPath, query, results);
    } else if (entry.isFile() && ALLOWED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      const content = await fs.readFile(fullPath, "utf-8");
      const lines = content.split("\n");
      const matchingLines: { lineNumber: number; text: string }[] = [];

      lines.forEach((line, i) => {
        if (line.toLowerCase().includes(query)) {
          matchingLines.push({ lineNumber: i + 1, text: line.trim() });
        }
      });

      if (matchingLines.length > 0) {
        results.push({
          file: path.relative(rootDir, fullPath),
          lines: matchingLines.slice(0, 20), // Max 20 matching lines per file
        });
      }
    }
  }
}
