import * as vscode from "vscode";
import { XCTreeView, ShopTreeView, XCViewItem } from "./treeView";
import { sectionWebView } from "./webView";
import { Section, SectionPanel } from "#/global";
import { iconSvg, setContext } from "@/utils";
import {
  isReady,
  setConfiguration,
  getConfiguration,
  getThemList,
  OTHERCONFIG,
} from "@/config";

// const trigger = () => {
//   setConfiguration(OTHERCONFIG, {
//     ...(getConfiguration(OTHERCONFIG) as Object),
//     activateTime: Date.now(),
//   });
// };

const track = () => {
  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("juejin_xc.cookie")) {
      setContext("juejin_xc.ready", isReady());
      setContext("juejin_xc.noList", false);
      vscode.commands.executeCommand("juejin_xc.refresh");
      vscode.commands.executeCommand("juejin_xc.refresh.shop");
    }
  });
};

const updatePannel = (
  xcSectionPanels: Array<SectionPanel>,
  config: Record<string, any>,
  data: { type: "skin" | "fs"; value?: string },
  isAnimation: boolean = true
) => {
  setConfiguration(OTHERCONFIG, config).then(() => {
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
  const config = getConfiguration(OTHERCONFIG) as Record<string, any>;
  const step = isAdd ? 2 : -2;
  config.fs = isNaN(parseInt(config.fs))
    ? `${12 + step}px`
    : `${parseInt(config.fs) + step}px`;
  updatePannel(xcSectionPanels, config, { type: "fs", value: config.fs });
};

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
          list[0].reveal(vscode.ViewColumn.One);
        } else {
          const sectionPanel = sectionWebView(
            `XC${section.section_id}`,
            section.title,
            vscode.ViewColumn.One,
            { treeItem, enableScripts: true },
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
                (panel) => panel !== sectionPanel
              );
            } else {
              xcSectionPanels = xcSectionPanels.filter(
                (panel) => panel !== sectionPanel
              );
            }
          });
          sectionPanel.onDidChangeViewState(({ webviewPanel }) => {
            if (webviewPanel.active) {
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
        }
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
      const config = getConfiguration(OTHERCONFIG) as Record<string, any>;
      if (!config.order || !Array.isArray(config.order)) {
        config.order = [];
      }
      if (id === config.order[0]) {
        return;
      }
      config.order = [...new Set([id, ...config.order])];
      setConfiguration(OTHERCONFIG, config).then(() =>
        vscode.commands.executeCommand("juejin_xc.refresh")
      );
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
      setConfiguration(OTHERCONFIG, {
        ...(getConfiguration(OTHERCONFIG) as Object),
        order: [],
      }).then(() => {
        vscode.commands.executeCommand("juejin_xc.refresh");
      });
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("juejin_xc.skin", () => {
      const config = getConfiguration(OTHERCONFIG) as Record<string, any>;
      type SelectType = { label: string; theme: string };
      const themes: Array<SelectType> = [],
        temp: Array<SelectType> = [];

      getThemList().forEach(({ name, theme }) => {
        const select = { label: name ? name : theme, theme };
        theme === config.currentTheme ? temp.push(select) : themes.push(select);
      });
      vscode.window.showQuickPick(temp.concat(themes)).then((res) => {
        config.currentTheme = res?.theme;
        updatePannel([...xcSectionPanels, ...shopSectionPanels], config, {
          type: "skin",
          value: res?.theme,
        });
        // setConfiguration(OTHERCONFIG, config).then(() => {
        //   //不是最新？？？ 加个任务队列
        //   Promise.resolve().then(() => {
        //     xcSectionPanels.forEach((p) => {
        //       p.webview.postMessage({
        //         type: "skin",
        //         value: res?.theme,
        //       });
        //       p.reRender();
        //     });
        //   });
        // });
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
