import * as vscode from "vscode";

export const getCooKie = (): string =>
  vscode.workspace.getConfiguration().get("juejin_xc.cookie") + "";

export const isReady = () => !!getCooKie();
