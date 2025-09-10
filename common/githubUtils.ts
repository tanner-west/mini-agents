interface GitHubFileEditOptions {
  owner: string;
  repo: string;
  path: string;
  content: string;
  message: string;
  token: string;
  branch?: string;
}

interface GitHubFileResponse {
  sha: string;
  content: string;
  encoding: string;
}

export async function editGitHubFile(options: GitHubFileEditOptions) {
  const {
    owner,
    repo,
    path,
    content,
    message,
    token,
    branch = "main",
  } = options;

  const baseUrl = "https://api.github.com";
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };

  try {
    // First, get the current file to obtain its SHA
    const getFileUrl = `${baseUrl}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const getResponse = await fetch(getFileUrl, {
      method: "GET",
      headers,
    });

    if (!getResponse.ok) {
      throw new Error(
        `Failed to get file: ${getResponse.status} ${getResponse.statusText}`
      );
    }

    const fileData: GitHubFileResponse = await getResponse.json();

    // Update the file with new content
    const updateFileUrl = `${baseUrl}/repos/${owner}/${repo}/contents/${path}`;
    const updatePayload = {
      message,
      content: Buffer.from(content).toString("base64"),
      sha: fileData.sha,
      branch,
    };

    const updateResponse = await fetch(updateFileUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify(updatePayload),
    });

    if (!updateResponse.ok) {
      throw new Error(
        `Failed to update file: ${updateResponse.status} ${updateResponse.statusText}`
      );
    }

    const updateResult = await updateResponse.json();
    return {
      success: true,
      data: updateResult,
      message: `File ${path} updated successfully`,
    };
  } catch (error) {
    console.error("Error updating GitHub file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function readGitHubFile(options: {
  owner: string;
  repo: string;
  path: string;
  token: string;
  branch?: string;
}) {
  const { owner, repo, path, token, branch = "main" } = options;

  const baseUrl = "https://api.github.com";
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
  };

  try {
    const getFileUrl = `${baseUrl}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const response = await fetch(getFileUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to read file: ${response.status} ${response.statusText}`
      );
    }

    const fileData: GitHubFileResponse = await response.json();

    // Decode the base64 content
    const decodedContent = Buffer.from(fileData.content, "base64").toString(
      "utf-8"
    );

    return {
      success: true,
      data: {
        content: decodedContent,
        sha: fileData.sha,
        encoding: fileData.encoding,
        path: path,
      },
      message: `File ${path} read successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function createGitHubFile(
  options: Omit<GitHubFileEditOptions, "sha">
) {
  const {
    owner,
    repo,
    path,
    content,
    message,
    token,
    branch = "main",
  } = options;

  const baseUrl = "https://api.github.com";
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };

  try {
    const createFileUrl = `${baseUrl}/repos/${owner}/${repo}/contents/${path}`;
    const createPayload = {
      message,
      content: Buffer.from(content).toString("base64"),
      branch,
    };

    const createResponse = await fetch(createFileUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify(createPayload),
    });

    if (!createResponse.ok) {
      throw new Error(
        `Failed to create file: ${createResponse.status} ${createResponse.statusText}`
      );
    }

    const createResult = await createResponse.json();
    return {
      success: true,
      data: createResult,
      message: `File ${path} created successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
