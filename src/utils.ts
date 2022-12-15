import * as path from "path";
import * as vscode from 'vscode';

//返回icon路径
export const iconSvg = (svg: string): string => {
  return path.join(__dirname, "..", "resource", "svgs", `${svg}.svg`);
};

export const setContext = (key: string, val: boolean) =>
  vscode.commands.executeCommand("setContext", key, val);
