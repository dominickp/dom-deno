import type { Middleware } from "https://deno.land/x/lume@v1.18.4/core.ts";

import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

function wrapText(text: string, lineWidth: number): string {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "\t";

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= lineWidth) {
      if (currentLine != "\t") {
        currentLine += " ";
      }
      currentLine += word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.join("\n\t");
}

function generateTextFromHTML(original_response_html: string) {
  const doc = new DOMParser().parseFromString(
    original_response_html,
    "text/html",
  );
  const body_rows =
    doc?.querySelectorAll("body .container .row .column:not(.footer)") ||
    [];

  let new_plaintext_response = `
  █▀▄ █▀█ █▀▄▀█ █ █▄░█ █ █▀▀ █▄▀ ░ █▀▀ █▀▀
  █▄▀ █▄█ █░▀░█ █ █░▀█ █ █▄▄ █░█ ▄ █▄▄ █▄▄\n\n`;

  const nodes_to_skip = ["SCRIPT", "SVG"];
  const line_width = 80;

  for (const row of body_rows) {
    for (const line of row.childNodes) {
      // Skip any svg or scripts
      if (nodes_to_skip.includes(line.nodeName)) continue;
      // Skip any nodes empty of text content
      const line_text_content = line.textContent.trim();
      if (line_text_content.trim() == "") continue;

      // Format headings
      if (line.nodeName == "H1") {
        new_plaintext_response +=
          `\n ## ${line_text_content.toUpperCase()} ##\n\n`;
        continue;
      }

      // Check to see if node is a wrapper div with a bunch of buttons, render differently
      if (line.firstChild.nodeName == "A") {
        for (const link of line.childNodes) {
          new_plaintext_response += `\t- ${link.textContent.trim()}:\t${
            link.getAttribute("href")
          }\n`;
        }
        continue;
      }

      // Format normal text content
      if (["P", "DIV"].includes(line.nodeName)) {
        new_plaintext_response += `${
          wrapText(line_text_content, line_width)
        }\n\n`;
        continue;
      }
    }
  }

  return new_plaintext_response;
}

export default function serveCLI(): Middleware {
  return async (request, next) => {
    const userAgent = request.headers.get("User-Agent");

    if (userAgent?.toLowerCase().startsWith("curl")) {
      const response = await next(request);
      const { status } = response;

      const response_headers = new Headers();
      response_headers.append("Content-Type", "text/plain");

      const new_plaintext_response = generateTextFromHTML(
        await response.text(),
      );

      return new Response(new_plaintext_response, {
        status,
        headers: response_headers,
      });
    }

    return await next(request);
  };
}
