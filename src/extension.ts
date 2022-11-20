import * as vscode from "vscode";
import { XCTreeView } from "./treeView";
import { Section } from "#/global";

export function activate(context: vscode.ExtensionContext) {
  const xCTreeViewProvider = new XCTreeView();
  const treeView = vscode.window.createTreeView("juejin_xc_activitybar.xc", {
    treeDataProvider: xCTreeViewProvider,
  });
  context.subscriptions.push(treeView);

  context.subscriptions.push(
    vscode.commands.registerCommand("juejin_xc.sections", (arg: Section) => {
      if (!arg) {
        return;
      }
      if (arg.status === 0) {
        return vscode.window.showInformationMessage("小册还在写作中...");
      }
    })
  );
}

export function deactivate() {}
