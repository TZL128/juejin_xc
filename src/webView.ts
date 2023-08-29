import * as vscode from "vscode";
import { xcContent, xcComment, xcMoreComment } from "@/api/request";
import { getThemeCss, getCurrentTheme } from "@/config";
import type { SectionParams, SectionPanel } from "#/global";

const errorHtml = () => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      * {
        padding: 0;
        margin: 0;
      }
      .error {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-weight: 600;
        font-size: 18px;
        color: #444;
      }
    </style>
  </head>
  <body>
    <div class="error">出错啦~~</div>
  </body>
</html>`;

const preViewHtml = (src: string) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
    * {
      padding: 15px;
      margin: 0;
      }
  </style>
  </head>
  <body>
    <img src=${src}  />
  </body>
</html>`;

const sectionHtml = async (data: SectionParams): Promise<string> => {
  try {
    const { fs, theme } = getCurrentTheme();
    return `
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
                    id:'${data.section_id}'
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
  `;
  } catch (error) {
    return errorHtml();
  }
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
  return Object.assign(panel, { reRender });
};

export class CommentWebView implements vscode.WebviewViewProvider {
  private _webviewView: vscode.WebviewView | null;
  private _imgPanel: vscode.WebviewPanel | null;
  constructor() {
    this._webviewView = null;
    this._imgPanel = null;
  }

  private renderReply = (reply: Array<any>) => {
    const findTarget = (targetId: string) => {
      const target = reply.find(item => {
        return item.reply_info.reply_id === targetId;
      });
      return target?.reply_info.reply_content;
    };
    return reply
      .map((item) => {
        return `<div class="comment-item">
      <div class="commemt-item-left">
        <img
          src=${item.user_info.avatar_large}
          alt=${item.user_info.user_name}
        />
      </div>
      <div class="comment-item-right">
        <div class="userName">${item.user_info.user_name}</div>
        <div class="commentPic">
          ${item.reply_info.reply_pics.map(
          (img: any) => `<img
            src=${img.pic_url}
          />`
        )}
        </div>
        <div class="commentText">
          ${item.reply_info.reply_content}
          ${item.reply_info.reply_to_reply_id !== "0"
            ? `<div class="target">${findTarget(
              item.reply_info.reply_to_reply_id
            )}</div>`
            : ``
          }
        </div>
      </div>
    </div>
      `;
      })
      .join("");
  };

  private async createdCommetHtml(id: string): Promise<string> {
    const FN = this.renderReply;
    try {
      const { data: list, total } = await xcComment({
        client_type: 2608,
        cursor: "0",
        item_id: id,
        item_type: 13,
        limit: 1000,
        sort: 0,
      });
      return `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            * {
              padding: 0;
              margin: 0;
            }
            body {
              background-color: #fff;
            }
            .container .comment-item {
              display: flex;
              border-bottom: 1px solid #e4e6eb80;
              padding: 12px 0px;
            }
            .container .comment-item:last-of-type {
              border-bottom: none;
            }
            .container .comment-item .commemt-item-left {
              flex-basis: 50px;
              box-sizing: border-box;
              padding: 0px 5px;
            }
            .container .comment-item .commemt-item-left img {
              width: 30px;
              height: 30px;
              border-radius: 50%;
            }
            .container .comment-item .comment-item-right {
              flex: 1;
            }
            .container .comment-item .comment-item-right .userName {
              color: #252933;
              font-size: 14px;
              font-weight: 500;
            }
            .container .comment-item .comment-item-right .commentPic {
              display: flex;
              flex-wrap: wrap;
              margin-top: 8px;
            }
            .container .comment-item .comment-item-right .commentPic img {
              width: 72px;
              object-fit: cover;
              cursor: pointer;
            }
            .container .comment-item .comment-item-right .commentText {
              margin-top: 8px;
              font-size: 14px;
              color: #515767;
            }
            .container .comment-item .comment-item-right .commentText .target {
              background: #eee;
              border-radius: 2px;
              padding: 0 12px;
              line-height: 34px;
              height: 34px;
              font-size: 14px;
              color: #8a919f;
              margin-top: 8px;
              display: -webkit-box;
              overflow: hidden;
              text-overflow: ellipsis;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 1;
            }
            .container .comment-item .comment-item-right .reply {
              padding: 12px 0px;
              background-color: #f2f3f5;
            }
            .container .comment-item .comment-item-right .more {
              display: flex;
              align-items: center;
              justify-content: center;
              color: #515767;
              height: 42px;
              box-sizing: border-box;
              font-size: 14px;
              cursor: pointer;
              border-top: 1px solid #e4e6eb80;
              background-color: #f2f3f5;
              margin: 0;
            }
            .container .replyNumber {
              display: flex;
              align-items: center;
              justify-content: center;
              color: #515767;
              font-size: 14px;
              height: 22px;
              padding: 10px 0px;
              border-top: 1px solid #e4e6eb80;
              margin: 0;
            }
            .container .allReply {
              display: flex;
              align-items: center;
              justify-content: center;
              color: #515767;
              font-size: 14px;
              height: 22px;
              padding-top: 10px;
              cursor: pointer;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
          ${total ? `<div class="replyNumber">全部评论（${total}）</div>` : ``}
          ${list
          .map(
            (item) => `<div class="comment-item">
              <div class="commemt-item-left">
                <img
                  src=${item.user_info.avatar_large}
                  alt=${item.user_info.user_name}
                />
              </div>
              <div class="comment-item-right">
                <div class="userName">${item.user_info.user_name}</div>
                <div class="commentPic">
                 ${item.comment_info.comment_pics
                .map(
                  (pic: any) =>
                    `<img src=${pic.pic_url} onclick=preViewImg('${pic.pic_url}',${pic.width},${pic.height}) >`
                )
                .join("")}
                </div>
                <div class="commentText">${item.comment_info.comment_content
              }</div>
                ${item.reply_infos.length
                ? `
                <div class="reply" id=${item.comment_info.item_id}_${item.comment_info.comment_id
                }>
                  ${this.renderReply(item.reply_infos)}
                </div>`
                : ""
              }
                ${item.comment_info.reply_count > 2
                ? `<div id=${item.comment_info.comment_id}  class="more" onclick=handleMore('${item.comment_info.item_id}_${item.comment_info.comment_id}')>查看更多回复</div>`
                : ""
              }
              </div>
            </div>`
          )
          .join("")}
          </div>
          <script>
            const vscode = acquireVsCodeApi();
            let current=null;
            const render=${FN}
            const preViewImg = (src,width,height) => {
              vscode.postMessage({
                type:'preView',
                params:{
                  src,
                  width,
                  height
                }
              })
            };
            const handleMore=(id)=>{
              current=id
              const btn=document.getElementById(id.split('_')[1])
              btn.style.display='none';
              vscode.postMessage({type:'comment',params:{id}})
            }
            window.addEventListener("message", (event) => {
              const data = event.data;
              const reply=document.getElementById(current)
              reply.innerHTML=render(data.list)
            });
          </script>
        </body>
      </html>
      `;
    } catch (error) {
      return errorHtml();
    }
  }

  initHtml(render: boolean) {
    if (render && this._webviewView) {
      this._webviewView.webview.html = "请先阅读小册章节";
      return "";
    }
    return "请先阅读小册章节";
  }
  async changeHtml(id: string) {
    if (this._webviewView) {
      this._webviewView.webview.html = await this.createdCommetHtml(id);
    }
  }
  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext<unknown>,
    token: vscode.CancellationToken
  ): void {
    webviewView.webview.html = this.initHtml(false);
    webviewView.webview.options = {
      enableScripts: true,
    };
    webviewView.webview.onDidReceiveMessage(async (data) => {
      if (data.type === "preView") {
        if (!this._imgPanel) {
          this._imgPanel = vscode.window.createWebviewPanel(
            "preViewImg",
            "图片预览",
            vscode.ViewColumn.Two
          );
          this._imgPanel.onDidDispose(() => {
            this._imgPanel = null;
          });
        }
        this._imgPanel.webview.html = preViewHtml(data.params.src);
      } else if (data.type === "comment") {
        const comments = await xcMoreComment(data.params.id);
        this._webviewView?.webview.postMessage({
          list: comments,
        });
      }
    });
    this._webviewView = webviewView;
  }
}
