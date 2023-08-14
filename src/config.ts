import * as vscode from "vscode";
import type { Theme } from "#/global";

export const getCooKie = (): string =>
  vscode.workspace.getConfiguration().get("juejin_xc.cookie") + "";

export const isReady = () => !!getCooKie();

//getConfiguration(xxx)  xxx 指 configuration中的title 
export const setField = (key: string, value: any) => vscode.workspace.getConfiguration('juejin_xc').update(key, value, vscode.ConfigurationTarget.Global);

export const getField = (key: string) => vscode.workspace.getConfiguration('juejin_xc').get(key);

export const getBaseTheme = (): Array<Theme> => {
  return [
    {
      theme: "default",
      name: "默认",
      color: "var(--vscode-editor-foreground)",
      backgroundColor: "inherit",
    },
    {
      theme: "white",
      name: "白色",
      color: "rgba(60, 60, 60, 0.7)",
      backgroundColor: "#fff",
    },
    {
      theme: "black",
      name: "黑色",
      color: "rgba(255, 255, 255, 0.75)",
      backgroundColor: "#121212",
    }
  ];
};

export const getThemList = (): Array<Theme> => {
  const options = getField('options') as Record<string, any>;
  const theme: Array<Theme> =
    options.theme && Array.isArray(options.theme)
      ? [...getBaseTheme(), ...options.theme]
      : getBaseTheme();
  return theme;
};

export const getThemeCss = (): string => {
  const theme = getThemList();
  let themeCss = ``;
  theme.forEach((item) => {
    themeCss += `
    .${item.theme}{
      color:${item.color};
      background-color:${item.backgroundColor};
    }
    `;
  });
  return themeCss;
};

export const getCurrentTheme = () => {
  const option = getField('options') as Record<string, any>;
  return { fs: option.fs || '12px', theme: option.currentTheme };
};
