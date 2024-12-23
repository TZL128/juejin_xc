import * as vscode from "vscode";
import { xcContent, xcComment, xcMoreComment } from "@/api/request";
import { getThemeCss, getCurrentTheme } from "@/config";
import type { SectionParams, SectionPanel } from "#/global";

const markdownBodyCss = `
                .markdown-body h1,
                .markdown-body h2,
                .markdown-body h3,
                .markdown-body h4,
                .markdown-body h5,
                .markdown-body h6 {
                        line-height: 1.5;
                        margin-top: 35px;
                        margin-bottom: 10px;
                        padding-bottom: 5px
                }

                .markdown-body h1 {
                        font-size: 24px;
                        line-height: 38px;
                        margin-bottom: 5px
                }

                .markdown-body h2 {
                        font-size: 22px;
                        line-height: 34px;
                        padding-bottom: 12px;
                        border-bottom: 1px solid #ececec
                }

                .markdown-body h3 {
                        font-size: 20px;
                        line-height: 28px
                }

                .markdown-body h4 {
                        font-size: 18px;
                        line-height: 26px
                }

                .markdown-body h5 {
                        font-size: 17px;
                        line-height: 24px
                }

                .markdown-body h6 {
                        font-size: 16px;
                        line-height: 24px
                }

                .markdown-body p {
                        line-height: inherit;
                        margin-top: 22px;
                        margin-bottom: 22px
                }

                .markdown-body img {
                        max-width: 100%
                }

                .markdown-body hr {
                        border: none;
                        border-top: 1px solid #ddd;
                        margin-top: 32px;
                        margin-bottom: 32px
                }

                .markdown-body code {
                        word-break: break-word;
                        border-radius: 2px;
                        overflow-x: auto;
                        background-color: #fff5f5;
                        color: #ff502c;
                        font-size: .87em;
                        padding: .065em .4em
                }

                .markdown-body code,
                .markdown-body pre {
                        font-family: Menlo, Monaco, Consolas, Courier New, monospace
                }

                .markdown-body pre {
                        overflow: auto;
                        position: relative;
                        line-height: 1.75
                }

                .markdown-body pre>code {
                        font-size: 12px;
                        padding: 15px 12px;
                        margin: 0;
                        word-break: normal;
                        display: block;
                        overflow-x: auto;
                        color: #333;
                        background: #f8f8f8
                }

                .markdown-body a {
                        text-decoration: none;
                        color: #0269c8;
                        border-bottom: 1px solid #d1e9ff
                }

                .markdown-body a:active,
                .markdown-body a:hover {
                        color: #275b8c
                }

                .markdown-body table {
                        display: inline-block !important;
                        font-size: 12px;
                        width: auto;
                        max-width: 100%;
                        overflow: auto;
                        border: 1px solid #f6f6f6
                }

                .markdown-body thead {
                        background: #f6f6f6;
                        color: #000;
                        text-align: left
                }

                .markdown-body tr:nth-child(2n) {
                        background-color: #fcfcfc
                }

                .markdown-body td,
                .markdown-body th {
                        padding: 12px 7px;
                        line-height: 24px
                }

                .markdown-body td {
                        min-width: 120px
                }

                .markdown-body blockquote {
                        color: #666;
                        padding: 1px 23px;
                        margin: 22px 0;
                        border-left: 4px solid #cbcbcb;
                        background-color: #f8f8f8
                }

                .markdown-body blockquote:after {
                        display: block;
                        content: ""
                }

                .markdown-body blockquote>p {
                        margin: 10px 0
                }

                .markdown-body ol,
                .markdown-body ul {
                        padding-left: 28px
                }

                .markdown-body ol li,
                .markdown-body ul li {
                        margin-bottom: 0;
                        list-style: inherit
                }

                .markdown-body ol li .task-list-item,
                .markdown-body ul li .task-list-item {
                        list-style: none
                }

                .markdown-body ol li .task-list-item ol,
                .markdown-body ol li .task-list-item ul,
                .markdown-body ul li .task-list-item ol,
                .markdown-body ul li .task-list-item ul {
                        margin-top: 0
                }

                .markdown-body ol ol,
                .markdown-body ol ul,
                .markdown-body ul ol,
                .markdown-body ul ul {
                        margin-top: 3px
                }

                .markdown-body ol li {
                        padding-left: 6px
                }

                .markdown-body .contains-task-list {
                        padding-left: 0
                }

                .markdown-body .task-list-item {
                        list-style: none
                }

                @media (max-width:720px) {
                        .markdown-body h1 {
                                font-size: 24px
                        }

                        .markdown-body h2 {
                                font-size: 20px
                        }

                        .markdown-body h3 {
                                font-size: 18px
                        }
                }
                /* 高亮 */
                .markdown-body pre,
                .markdown-body pre>code.hljs {
                        color: #333;
                        background: #f8f8f8
                }

                .hljs-comment,
                .hljs-quote {
                        color: #998;
                        font-style: italic
                }

                .hljs-keyword,
                .hljs-selector-tag,
                .hljs-subst {
                        color: #333;
                        font-weight: 700
                }

                .hljs-literal,
                .hljs-number,
                .hljs-tag .hljs-attr,
                .hljs-template-variable,
                .hljs-variable {
                        color: teal
                }

                .hljs-doctag,
                .hljs-string {
                        color: #d14
                }

                .hljs-section,
                .hljs-selector-id,
                .hljs-title {
                        color: #900;
                        font-weight: 700
                }

                .hljs-subst {
                        font-weight: 400
                }

                .hljs-class .hljs-title,
                .hljs-type {
                        color: #458;
                        font-weight: 700
                }

                .hljs-attribute,
                .hljs-name,
                .hljs-tag {
                        color: navy;
                        font-weight: 400
                }

                .hljs-link,
                .hljs-regexp {
                        color: #009926
                }

                .hljs-bullet,
                .hljs-symbol {
                        color: #990073
                }

                .hljs-built_in,
                .hljs-builtin-name {
                        color: #0086b3
                }

                .hljs-meta {
                        color: #999;
                        font-weight: 700
                }

                .hljs-deletion {
                        background: #fdd
                }

                .hljs-addition {
                        background: #dfd
                }

                .hljs-emphasis {
                        font-style: italic
                }

                .hljs-strong {
                        font-weight: 700
                }
`;

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

const sectionHtml = async (data: SectionParams, url: any): Promise<string> => {
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
      p{
        width: 100%;
      }
      img{
        width: 100%;
        object-fit: cover;
      }
      ${markdownBodyCss}
    </style>
    </head>
    <body class='${theme}'>
      <div id="container" class="markdown-body">
        ${await xcContent(data)}
      </div>
      <script src='${url.html2canvas}'></script>
      <script src='${url.jspdf}'></script>
      <script></script>
      <script>
        (function () {
          const vscode = acquireVsCodeApi();
          const { jsPDF } = window.jspdf
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
            } else if (data.type === "download") {
              handleExportPDF(data.value);
             }
          });
           const getCanvasToImage = (dom, xGap = 80) => {
            if (typeof dom === 'string') dom = document.querySelector(dom);
            return new Promise((resolve, reject) => {
                html2canvas(dom, {
                    allowTaint: true, // 允许渲染跨域图片
                    useCORS: true,// 允许跨域
                    onclone:function(cloneDoc){
                      cloneDoc.querySelector('#container').style.color="#252933"
                    },
                    scale: 2 
                }).then(canvas => {
                    // 这是实际dom转canvas的画布尺寸
                    let contentWidth = canvas.width;
                    let contentHeight = canvas.height;
                    // 实际渲染到pdf上图片的尺寸（把canvas按比例缩放成A4的尺寸，考虑到我们需要保留左右边距）。以下纵向为例
                    let imgWidth = 592.28 - xGap; // 保留了总的横向xGap的边距，下面让图片则x轴上的xGap/2位置渲染就可保证在x轴居中
                    let imgHeight = imgWidth / contentWidth * contentHeight;
                    let imageData = canvas.toDataURL('image/png');
                    resolve({ imageData, imgWidth, imgHeight });
                })
            })
        };

        const handleExportPDF = async (name) => {
            const doms = [...document.querySelector('#container').childNodes].filter(node => node.nodeType === 1)
            const xGap = 30; // 设置总的横向边距（包含左右）
            const topGap = 10; // 顶部边距（每一页的顶部边距）
            const a4W = 529.28
            const a4H = 841.89
            const pdf = new jsPDF('p', 'pt', [a4W, a4H]);
            const batchNum= 20
            const lineGap=10
            let renderH = 0, positions = 0
            for (let i = 0; i < doms.length; i+=batchNum) {
              const domsBatch = doms.slice(i, i + batchNum)
              await Promise.all(domsBatch.map(dom => getCanvasToImage(dom, xGap))).then((imageArr) => {
                imageArr.map(({ imageData, imgWidth, imgHeight }) => {
                    const widthRatio = (a4W - xGap) / imgWidth
                    const heightRatio = (a4H - topGap) / imgHeight
                    const ratio = Math.min(widthRatio, heightRatio)
                    const realWidth = imgWidth * ratio
                    const realHeight = imgHeight * ratio
                    if (renderH + imgHeight >= (a4H - topGap)) {
                        pdf.addPage()
                        positions = 0
                        pdf.addImage(imageData, 'PNG', xGap / 2, positions + topGap, realWidth, realHeight);
                        renderH = realHeight+lineGap
                        positions = realHeight+lineGap
                    } else {
                        pdf.addImage(imageData, 'PNG', xGap / 2, positions + topGap, realWidth, realHeight);
                        renderH += (realHeight+lineGap)
                        positions += (realHeight+lineGap)
                    }
                })
              })
            }
            pdf.save(name);
            vscode.postMessage({type:'downloadOver'});
        }
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
  options: Record<string, any> = {},
  requestParams: SectionParams
): SectionPanel => {
  const panel = vscode.window.createWebviewPanel(id, name, column, options);
  const getUrl = (path: string) => panel.webview.asWebviewUri(vscode.Uri.joinPath(options.extensionPath, 'resource', path));
  const url = {
    html2canvas: getUrl('js/html2canvas.min.js'),
    jspdf: getUrl('js/jspdf.umd.min.js')
  };
  const reRender = () =>
    sectionHtml(requestParams, url).then((html) => {
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
            onclick=preViewImg('${img.pic_url}',${img.width},${img.height})
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
                <div class="commentText">${item.comment_info.comment_content}</div>
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
          .join(" ")}
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
