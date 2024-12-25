import * as vscode from "vscode";

export const useDownloadStatusBar = () => {
    let statusBar: vscode.StatusBarItem;

    const createStatusBar = (text: string) => {
        if (!statusBar) {
            statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        }
        statusBar.text = text;
        statusBar.show();
    };

    const destroyStatusBar = () => {
        statusBar.hide();
    };

    return {
        createStatusBar,
        destroyStatusBar
    };

};