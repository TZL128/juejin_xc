import * as vscode from "vscode";
import * as path from "path";
import { XCTreeView, ShopTreeView, XCViewItem } from "./treeView";
import { sectionWebView, CommentWebView } from "./webView";
import { Section, SectionPanel } from "#/global";
import { iconSvg, setContext } from "@/utils";
import {
  isReady,
  getThemList,
  setField,
  getField,
} from "@/config";
import { useDownloadStatusBar } from "./statusBar";

const track = () => {
  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("juejin_xc.cookie")) {
      setContext("juejin_xc.ready", isReady());
      setContext("juejin_xc.noList", false);
      vscode.commands.executeCommand("juejin_xc.refresh");
      vscode.commands.executeCommand("juejin_xc.refresh.shop");
    } else if (e.affectsConfiguration("juejin_xc.showDesc")) {
      isReady() && vscode.commands.executeCommand("juejin_xc.refresh");
    }
  });
};

const updatePannel = (
  xcSectionPanels: Array<SectionPanel>,
  config: Record<string, any>,
  data: { type: "skin" | "fs"; value?: string },
  isAnimation: boolean = true
) => {
  setField('options', config).then(() => {
    Promise.resolve().then(() => {
      xcSectionPanels.forEach((p) => {
        isAnimation && p.webview.postMessage(data);
        p.reRender();
      });
    });
  });

};

const updateFontSize = (
  xcSectionPanels: Array<SectionPanel>,
  isAdd: boolean = true
) => {
  const options = getField('options') as Record<string, any>;
  const step = isAdd ? 2 : -2;
  options.fs = isNaN(parseInt(options.fs))
    ? `${12 + step}px`
    : `${parseInt(options.fs) + step}px`;
  updatePannel(xcSectionPanels, options, { type: "fs", value: options.fs });
};

const handleOver = (id: string) => {
  const options = getField("options") as Record<string, any>;
  const overList = options.overList
    ? Array.isArray(options.overList)
      ? options.overList
      : []
    : [];
  if (overList.includes(id)) { return; }
  options.overList = [...overList, id];
  setField("options", options);
};

const hanldeDownload = () => {
  setContext('juejin_xc.sectionDownloading', false);
  destroyStatusBar();
};

const { createStatusBar, destroyStatusBar } = useDownloadStatusBar();


export function activate(context: vscode.ExtensionContext) {
  setContext("juejin_xc.ready", isReady());
  let xcSectionPanels: Array<SectionPanel> = [],
    shopSectionPanels: Array<SectionPanel> = [],
    cache: Array<XCViewItem | undefined> = [];

  const clearAllPannel = (index: 0 | 1): boolean => {
    cache[index] = void 0;
    const panels = index ? shopSectionPanels : xcSectionPanels;
    const hasCache = !!panels.length;
    panels.forEach((p) => p.dispose());
    panels.length = 0;
    return hasCache;
  };
  const refresh = (flag: 0 | 1) => {
    const hasCache = clearAllPannel(flag);
    const treeView = flag ? shopXCTreeView : myXCTreeView;
    [cache[flag]] = treeView.selection;
    const provider = flag ? shopTreeViewProvider : xcTreeViewProvider;
    provider.refresh();
    hasCache &&
      cache[flag] &&
      vscode.commands.executeCommand(
        cache[flag]!.command?.command!,
        ...cache[flag]!.command?.arguments!
      );
  };
  //我的小册
  const xcTreeViewProvider = new XCTreeView();
  const myXCTreeView = vscode.window.createTreeView(
    "juejin_xc_activitybar.xc",
    {
      treeDataProvider: xcTreeViewProvider,
    }
  );
  context.subscriptions.push(myXCTreeView);
  //全部小册
  const shopTreeViewProvider = new ShopTreeView();
  const shopXCTreeView = vscode.window.createTreeView(
    "juejin_xc_activitybar.xc.shop",
    {
      treeDataProvider: shopTreeViewProvider,
    }
  );
  context.subscriptions.push(shopXCTreeView);
  //章节评论
  const commentWebViewProvider = new CommentWebView();
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('juejin_xc_activitybar.xc.comment', commentWebViewProvider));
  //设置命令
  context.subscriptions.push(
    vscode.commands.registerCommand("juejin_xc.setting", () =>
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "juejin_xc"
      )
    )
  );
  //章节详情命令
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "juejin_xc.sections",
      (buy, section: Section, treeItem: vscode.TreeItem, type: number) => {
        if (!section) {
          return;
        }
        if (!buy && section.is_free === 0) {
          return vscode.window.showInformationMessage("请先购买小册");
        }
        if (section.status === 0) {
          return vscode.window.showInformationMessage("小册还在写作中...");
        }
        const panels = type ? shopSectionPanels : xcSectionPanels;
        const list = panels.filter(
          (panel) => panel.viewType === `XC${section.section_id}`
        );
        if (list.length) {
          const [p] = list;
          p.reveal(vscode.ViewColumn.One);
        } else {
          const sectionPanel = sectionWebView(
            `XC${section.section_id}`,
            section.title,
            vscode.ViewColumn.One,
            {
              treeItem, enableScripts: true,
              retainContextWhenHidden: true,
              extensionPath: context.extensionUri
            },
            { section_id: section.section_id }
          );
          panels.push(sectionPanel);
          const icon = vscode.Uri.file(iconSvg("xc"));
          sectionPanel.iconPath = {
            light: icon,
            dark: icon,
          };
          sectionPanel.onDidDispose(() => {
            if (type) {
              shopSectionPanels = shopSectionPanels.filter(
                (panel) =>
                  panel !== sectionPanel
              );
            } else {
              xcSectionPanels = xcSectionPanels.filter(
                (panel) =>
                  panel !== sectionPanel
              );
            }
            commentWebViewProvider.initHtml(true);//同步
          });
          sectionPanel.onDidChangeViewState(({ webviewPanel }) => {
            if (webviewPanel.active) {
              commentWebViewProvider.changeHtml(webviewPanel.viewType.slice(2));//异步
              const treeView = type ? shopXCTreeView : myXCTreeView;
              const provider = type ? shopTreeViewProvider : xcTreeViewProvider;
              if ((webviewPanel.options as any).treeItem === cache[type]) {
                const { booklet_id, section_id } =
                  cache[type]?.command?.arguments![1] || {};
                const item = provider.findSectionViewItem(
                  booklet_id,
                  section_id
                );
                item && treeView.reveal(item, { select: true });
                return;
              }
              treeView.reveal((webviewPanel.options as any).treeItem, {
                select: true,
              });
            }
          });

          sectionPanel.webview.onDidReceiveMessage((msg) => {
            switch (msg.type) {
              case 'over':
                if (!xcSectionPanels.includes(sectionPanel)) { return; }
                handleOver(msg.id);
                break;
              case 'downloadOver':
                hanldeDownload();
                break;
            }
          });

        }
        //章节评论
        commentWebViewProvider.changeHtml(section.section_id);
      }
    )
  );
  //刷新数据
  context.subscriptions.push(
    vscode.commands.registerCommand("juejin_xc.refresh", () => refresh(0))
  );
  //刷新全部小册数据
  context.subscriptions.push(
    vscode.commands.registerCommand("juejin_xc.refresh.shop", () => refresh(1))
  );
  //小册置顶
  context.subscriptions.push(
    vscode.commands.registerCommand("juejin_xc.section.top", (arg) => {
      if (!arg) {
        return;
      }
      const [, id] = arg.contextValue.split("_");
      const options = getField('options') as Record<string, any>;
      if (!options.order || !Array.isArray(options.order)) {
        options.order = [];
      }
      if (id === options.order[0]) {
        return;
      }
      options.order = [...new Set([id, ...options.order])];
      setField('options', options).then(() => {
        vscode.commands.executeCommand("juejin_xc.refresh");
      });
    })
  );
  //小册链接
  context.subscriptions.push(
    vscode.commands.registerCommand("juejin_xc.link", (arg) => {
      if (!arg) {
        return;
      }
      const [, id, , type] = arg.contextValue.split("_");
      vscode.env.openExternal(
        vscode.Uri.parse(
          `https://juejin.cn/${type === 1 ? "book" : "video"}/${id}`
        )
      );
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("juejin_xc.sort", () => {
      const options = getField('options') as Record<string, any>;
      options.order = [];
      setField('options', options).then(() => {
        vscode.commands.executeCommand("juejin_xc.refresh");
      });
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("juejin_xc.skin", () => {
      const options = getField('options') as Record<string, any>;
      type SelectType = { label: string; theme: string };
      const themes: Array<SelectType> = [],
        temp: Array<SelectType> = [];

      getThemList().forEach(({ name, theme }) => {
        const select = { label: name ? name : theme, theme };
        theme === options.currentTheme ? temp.push(select) : themes.push(select);
      });
      vscode.window.showQuickPick(temp.concat(themes)).then((res) => {
        if (!res) {
          return;
        }
        options.currentTheme = res.theme;
        updatePannel([...xcSectionPanels, ...shopSectionPanels], options, {
          type: "skin",
          value: res.theme,
        });
      });
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('juejin_xc.sectionDownload', () => {
      [...xcSectionPanels, ...shopSectionPanels].forEach(panel => {
        if (panel.active) {
          setContext('juejin_xc.sectionDownloading', true);
          createStatusBar(`$(explorer-view-icon) 正在下载: ${panel.title}.pdf`);
          panel.webview.postMessage({ type: 'download', value: `${panel.title}.pdf` });

        }
      });
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("juejin_xc.fontSize.d", () =>
      updateFontSize([...xcSectionPanels, ...shopSectionPanels])
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("juejin_xc.fontSize.x", () =>
      updateFontSize([...xcSectionPanels, ...shopSectionPanels], false)
    )
  );
  track();
}

export function deactivate() { }
