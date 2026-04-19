const REPO_MENTION_REGEX = /@([a-zA-Z0-9\-_.]+)\/([a-zA-Z0-9\-_.]+)(\/[a-zA-Z0-9\-_./]*)?/g;

function parseRepoReferences(text) {
  if (!text || typeof text !== "string") return [];

  const references = [];
  let match;

  while ((match = REPO_MENTION_REGEX.exec(text)) !== null) {
    const owner = match[1];
    const repoName = match[2];
    const filePath = match[3] ? match[3].replace(/^\//, "") : "";

    references.push({
      raw: match[0],
      owner: sanitizeString(owner),
      repoName: sanitizeString(repoName),
      filePath: sanitizeString(filePath),
      metadata: {},
    });
  }

  REPO_MENTION_REGEX.lastIndex = 0;

  return references;
}

async function fetchRepoMetadata(owner, repo) {
  try {
    const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "DevTinder-App",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `token ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
    });

    if (!response.ok) {
      return {
        description: "",
        stars: 0,
        language: "",
        url: `https://github.com/${owner}/${repo}`,
        ownerAvatar: "",
      };
    }

    const data = await response.json();

    return {
      description: data.description || "",
      stars: data.stargazers_count || 0,
      language: data.language || "",
      url: data.html_url || `https://github.com/${owner}/${repo}`,
      ownerAvatar: data.owner?.avatar_url || "",
    };
  } catch (err) {
    console.error("GitHub API fetch error:", err.message);
    return {
      description: "",
      stars: 0,
      language: "",
      url: `https://github.com/${owner}/${repo}`,
      ownerAvatar: "",
    };
  }
}

function sanitizeString(str) {
  if (!str) return "";
  return str.replace(/[<>\"'&]/g, "").trim();
}

function sanitizeMessageText(text) {
  if (!text) return "";
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .substring(0, 2000);
}

module.exports = {
  parseRepoReferences,
  fetchRepoMetadata,
  sanitizeString,
  sanitizeMessageText,
};
