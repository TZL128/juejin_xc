import * as vscode from "vscode";

export const useDownloadStatusBar = () => {
    let statusBar: vscode.StatusBarItem;
    let originalText = '';
    const createStatusBar = (text: string) => {
        if (!statusBar) {
            statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        }
        statusBar.text = text;
        originalText = text;
        statusBar.show();
    };

    const destroyStatusBar = () => {
        statusBar.hide();
    };

    const updateProgress = (progress: number, total: number) => {
        statusBar.text = `${originalText}(${progress}/${total})`;
    };


    return {
        createStatusBar,
        destroyStatusBar,
        updateProgress
    };

};