import * as vscode from "vscode";

export const OTHERCONFIG = "juejin_xc.options";

export const getCooKie = (): string =>
  vscode.workspace.getConfiguration().get("juejin_xc.cookie") + "";

export const isReady = () => !!getCooKie();

export const setConfiguration = (key: string, value: any) =>
  vscode.workspace.getConfiguration().update(key, value, true);

export const getConfiguration = (key: string) =>
  vscode.workspace.getConfiguration().get(key);
