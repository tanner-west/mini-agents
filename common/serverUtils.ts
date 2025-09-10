import { extname } from "path";

export function oob(
  target: string,
  html: string,
  mode: "beforeend" | "afterbegin" | "innerHTML" = "beforeend"
) {
  return `<div hx-swap-oob="${mode}:${target}">${html}</div>`;
}
export function esc(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ]!)
  );
}
export function safeName(name: string) {
  // trim paths and keep it tame
  return name
    .replace(/^.*[\\/]/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 120);
}

export function guessMime(path: string): string {
  const ext = extname(path).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

export async function fileToDataUrl(path: string): Promise<string> {
  const f = Bun.file(path);
  const buf = await f.arrayBuffer();

  const b64 = Buffer.from(buf).toString("base64");
  const mime = guessMime(path);
  return `data:${mime};base64,${b64}`;
}
