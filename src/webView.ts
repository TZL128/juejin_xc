import * as vscode from "vscode";
import { xcContent } from "@/api/request";
import type { SectionParams } from "#/global";

const sectionHtml = (data: SectionParams): Promise<string> => {
  return new Promise(async (resolve) =>
    resolve(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
      .container{
        margin: 30px auto;
        width:70%;
        min-width: 600px;
      }
    </style>
    </head>
    <body>
      <div class="container">
        ${await xcContent(data)}
      </div>
    </body>
    </html>
  `)
  );
};

export const sectionWebView = (
  id: string,
  name: string,
  column: vscode.ViewColumn,
  options: Object = {},
  requestParams: SectionParams
): vscode.WebviewPanel => {
  const panel = vscode.window.createWebviewPanel(id, name, column, options);
  sectionHtml(requestParams).then((html) => (panel.webview.html = html));
  return panel;
};
