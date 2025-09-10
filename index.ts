import { join } from "path";
import { mkdir } from "fs/promises";
import { handler as gitEditorHandler } from "@/agents/git-editor";
import { handler as notionEditorHandler } from "@/agents/notion-editor";
import { handler as selfWritingJournalHandler } from "@/agents/self-writing-journal";
import htmxBase from "./htmx/base";
import { esc, fileToDataUrl, oob, safeName } from "@/common/serverUtils";

Bun.serve({
  port: 3000,
  idleTimeout: 30,
  //@ts-ignore
  async fetch(req, server) {
    const { pathname, searchParams } = new URL(req.url);

    if (req.method === "POST" && pathname === "/upload") {
      const form = await req.formData();
      const file = form.get("file");

      if (!(file instanceof File) || file.size === 0) {
        return new Response("<div>❌ No file</div>", {
          headers: { "content-type": "text/html" },
          status: 400,
        });
      }

      const uploadDir = join(import.meta.dir, "uploads");
      await mkdir(uploadDir, { recursive: true });

      const name = safeName(file.name || "upload.bin");
      const filename = `${Date.now()}-${crypto.randomUUID()}-${name}`;
      const dest = join(uploadDir, filename);

      await Bun.write(dest, file);

      const wsUrl = `/ws?file=${encodeURIComponent(filename)}`;

      const fragment = /*html*/ `
        <div class="upload-row">✅ Saved <code>${esc(filename)}</code></div>
        <div id="file-socket" ws-connect="${wsUrl}">
            <div id="file-status">Connecting…</div>
            <div id="chat"></div>
        </div>
        `;
      return new Response(fragment, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    const url = new URL(req.url);

    if (url.pathname === "/ws") {
      return server.upgrade(req, {
        data: {
          path: pathname,
          query: searchParams,
        },
      });
    }

    if (pathname === "/" && server.upgrade(req)) {
      return new Response("OK", { status: 200 });
    }

    let html;

    if (pathname === "/magic-bucket") {
      html = htmxBase(/*html*/ `
        <h1>Magic Bucket</h1>
          <p>Upload a screenshot with the word "workout" in the name to kick off the notion editor agent, or a screenshot with the word "nutrition" in the name to kick off the git editor agent.</p>
          <form id='form' hx-encoding='multipart/form-data' hx-post='/upload'>
          <input type='file' name='file'>
          <button>Upload</button>
        </form>
    `);
    }

    if (pathname === "/self-writing-journal") {
      const journalEntry = await selfWritingJournalHandler()
      html = htmxBase(journalEntry)
    }

    if (html) {
      return new Response(html, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    return new Response("Not found", { status: 404 });
  },

  websocket: {
    async open(ws) {
      const filepath = join(
        import.meta.dir,
        "uploads",
        // @ts-ignore
        ws.data.query.get("file")
      );
      const dataUrl = await fileToDataUrl(filepath);

      function handleUpdates(message: string) {
        ws.send(
          oob(
            "#chat",
            /*html*/ `<div>${message}</div>`,
            "beforeend"
          )
        );
      }
      ws.send(
        oob(
          "#chat",
          `<div><em>✅ connected at ${new Date().toLocaleTimeString()}</em></div>`
        )
      );
      if (filepath.includes("workout")) {
        await notionEditorHandler(dataUrl, handleUpdates);
      }
      if (filepath.includes("nutrition")) {
        await gitEditorHandler(dataUrl, handleUpdates);
      }
    },

    async message(ws, raw) {
      console.log(raw);
      if (typeof raw !== "string") {
        return new Response("No message", { status: 400 });
      }
      const obj = JSON.parse(raw);

      function handleUpdates(message: string) {
        ws.send(
          oob(
            "#chat",
            /*html*/ `<div>${message}</div>`,
            "beforeend"
          )
        );
      }

      if (obj.git_editor_prompt) {
        await gitEditorHandler(
          "add a paragraph with an affirmative message after the table",
          handleUpdates
        );
      }
      if (obj.notion_editor_prompt) {
        ws.send(
          oob(
            "#chat",
            `<div><strong>Handler not implemented yet!</div>`,
            "beforeend"
          )
        );
      }
    },

    close() { },
  },
});

console.log("http://localhost:3000/magic-bucket")
console.log("http://localhost:3000/self-writing-journal")
