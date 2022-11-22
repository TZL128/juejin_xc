import * as vscode from "vscode";
import { XCTreeView, XCAllTreeView } from "./treeView";
import { sectionWebView } from "./webView";
import { Section } from "#/global";
import { iconSvg } from "@/utils";
import {
  isReady,
  setConfiguration,
  getConfiguration,
  OTHERCONFIG,
} from "@/config";

const trigger = () => {
  setConfiguration(OTHERCONFIG, {
    ...(getConfiguration(OTHERCONFIG) as Object),
    activateTime: Date.now(),
  });
};

const setReady = () =>
  vscode.commands.executeCommand("setContext", "juejin_xc.ready", isReady());

const track = () => {
  vscode.workspace.onDidChangeConfiguration(() => {
    setReady();
    vscode.commands.executeCommand("juejin_xc.refresh");
    vscode.commands.executeCommand("juejin_xc.refresh.all");
  });
};

export function activate(context: vscode.ExtensionContext) {
  setReady();
  let xcSectionPanels: Array<vscode.WebviewPanel> = [];
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
  const xcAllTreeViewProvider = new XCAllTreeView();
  const allXCTreeView = vscode.window.createTreeView(
    "juejin_xc_activitybar.xc.all",
    {
      treeDataProvider: xcAllTreeViewProvider,
    }
  );
  context.subscriptions.push(allXCTreeView);
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
        const list = xcSectionPanels.filter(
          (panel) => panel.viewType === section.section_id
        );
        if (list.length) {
          list[0].reveal(vscode.ViewColumn.One);
        } else {
          const sectionPanel = sectionWebView(
            section.section_id,
            section.title,
            vscode.ViewColumn.One,
            { treeItem },
            { section_id: section.section_id }
          );
          xcSectionPanels.push(sectionPanel);
          const icon = vscode.Uri.file(iconSvg("xc"));
          sectionPanel.iconPath = {
            light: icon,
            dark: icon,
          };
          sectionPanel.onDidDispose(() => {
            xcSectionPanels = xcSectionPanels.filter(
              (panel) => panel !== sectionPanel
            );
          });
          sectionPanel.onDidChangeViewState(({ webviewPanel }) => {
            if (webviewPanel.active) {
              let treeView = type ? allXCTreeView : myXCTreeView;
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
    vscode.commands.registerCommand("juejin_xc.refresh", () => {
      xcTreeViewProvider.refresh();
    })
  );
  //刷新全部小册数据
  context.subscriptions.push(
    vscode.commands.registerCommand("juejin_xc.refresh.all", () => {
      xcAllTreeViewProvider.refresh();
    })
  );
  //小册置顶
  context.subscriptions.push(
    vscode.commands.registerCommand("juejin_xc.section.top", (arg) => {
      if (!arg) { return; }
      const [, id] = arg.contextValue.split("_");
      const config= (getConfiguration(OTHERCONFIG) as Record<string,any>);
      if(!config.order){
        config.order=[];
      }
      if(id===config.order[0]){
        return;
      }
      const index=config.order.indexOf(id);
      if(index!==-1){
        config.order.splice(index,1);
      }
      config.order.unshift(id);
      setConfiguration(OTHERCONFIG,config).then(()=>vscode.commands.executeCommand('juejin_xc.refresh'));   
    })
  );
  //小册链接
  context.subscriptions.push(
    vscode.commands.registerCommand("juejin_xc.link", (arg) => {
      if (!arg) { return; }
      const [, id, , type] = arg.contextValue.split("_");
      vscode.env.openExternal(vscode.Uri.parse(`https://juejin.cn/${type === 1 ? 'book' : 'video'}/${id}`));
    })
  );
  track();
}

export function deactivate() { }
