import * as vscode from "vscode";

export const useDownloadStatusBar = () => {
    let statusBar: vscode.StatusBarItem;

    const createStatusBar = (text: string) => {
        statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        statusBar.text = text;
        statusBar.show();
    };

    const destroyStatusBar = () => {
        statusBar.dispose();
    };

    return {
        createStatusBar,
        destroyStatusBar
    };

};