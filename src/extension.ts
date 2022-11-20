import * as vscode from "vscode";
import { XCTreeView } from "./treeView";
import { sectionWebView } from "./webView";
import { Section } from "#/global";
import { iconSvg } from "@/utils";
import {
  isReady,
  setConfiguration,
  getConfiguration,
  OTHERCONFIG,
} from "@/config";

export function activate(context: vscode.ExtensionContext) {
  setConfiguration(OTHERCONFIG, {
    ...(getConfiguration(OTHERCONFIG) as Object),
    activateTime: Date.now(),
  });

  vscode.workspace.onDidChangeConfiguration(() => {
    vscode.commands.executeCommand("setContext", "juejin_xc.ready", isReady());
    const xCTreeViewProvider = new XCTreeView();
    const treeView = vscode.window.createTreeView("juejin_xc_activitybar.xc", {
      treeDataProvider: xCTreeViewProvider,
    });
    context.subscriptions.push(treeView);
    let xcSectionPanels: Array<vscode.WebviewPanel> = [];
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "juejin_xc.sections",
        (section: Section, treeItem: vscode.TreeItem) => {
          if (!section) {
            return;
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
                treeView.reveal((webviewPanel.options as any).treeItem, {
                  select: true,
                });
              }
            });
          }
        }
      )
    );
    context.subscriptions.push(
      vscode.commands.registerCommand("juejin_xc.setting", () =>
        vscode.commands.executeCommand(
          "workbench.action.openSettings",
          "juejin_xc"
        )
      )
    );
  });
}

export function deactivate() {}
