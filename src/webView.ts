import * as vscode from "vscode";
import { xcContent } from "@/api/request";
import { getThemeCss, getCurrentTheme } from "@/config";
import type { SectionParams,SectionPanel } from "#/global";

const sectionHtml = (data: SectionParams): Promise<string> => {
  const { fs, theme } = getCurrentTheme();  
  return new Promise(async (resolve) =>
    resolve(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
      :root{
        --fs:${fs}
      }
      body{
        transition: all .3s linear;
      }
      ${getThemeCss()}
      #container{
        margin: 30px auto;
        width:70%;
        min-width: 600px;
        font-size:var(--fs)
      }
    </style>
    </head>
    <body class='${theme}'>
      <div id="container">
        ${await xcContent(data)}
      </div>
      <script>
        (function () {
          const vscode = acquireVsCodeApi();
          function debounce(fn, wait = 50, immediate) {
            let timer = null;
            return function (...args) {
              if (timer) clearTimeout(timer);
              if (immediate && !timer) {
                fn.apply(this, args);
              }
              timer = setTimeout(() => {
                fn.apply(this, args);
              }, wait);
            };
          }
          const el = document.querySelector("#container");
          window.document.addEventListener(
            "scroll",
            debounce(
              function (event) {
                const { scrollHeight, scrollTop, clientHeight } = event.target.scrollingElement
                if (scrollTop + clientHeight + 50 >= scrollHeight) {
                  vscode.postMessage({
                    type:'over',
                    id:'${ data.section_id }'
                  })
                }
              },
              200
            )
          );
          window.addEventListener("message", (event) => {
            const data = event.data;
            if (data.type === "skin") {
              document.body.className = data.value;
            } else if (data.type === "fs") {
              el.style.setProperty("--fs", data.value);
            }
          });
        })();
      </script>
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
): SectionPanel => {
  const panel = vscode.window.createWebviewPanel(id, name, column, options);
  const reRender = () =>
    sectionHtml(requestParams).then((html) => {
      panel.webview.html = html;
    });
  reRender();
  return Object.assign(panel,{reRender});
};
