import * as vscode from "vscode";
import { xcList, xcSections } from "@/api/request";
import { isReady } from "@/config";
import { iconSvg } from "@/utils";

class XCViewItem extends vscode.TreeItem {}

export class XCTreeView implements vscode.TreeDataProvider<XCViewItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    XCViewItem | undefined | null | void
  > = new vscode.EventEmitter<XCViewItem | undefined | null | void>();

  private renderXCList(): Promise<XCViewItem[]> {
    return new Promise(async (resolve) => {
      const list = await xcList();
      return resolve(
        list
          .filter((xc) => xc.is_buy)
          .map((xc) => {
            const item = new XCViewItem(
              xc.title,
              vscode.TreeItemCollapsibleState.Collapsed
            );
            item.contextValue = `XC_${xc.booklet_id}`;
            item.tooltip = `作者：${xc.user_name}\n描述：${xc.summary}`;
            item.iconPath = {
              light: iconSvg("xc"),
              dark: iconSvg("xc"),
            };
            return item;
          })
      );
    });
  }

  private renderSection(booklet_id: string): Promise<any> {
    return new Promise(async (resolve) => {
      const list = await xcSections({ booklet_id });
      resolve(
        list.map((section, index) => {
          const order = index + 1 < 10 ? `${index + 1}  ` : `${index + 1}`;
          const item = new XCViewItem(`${order} ${section.title}`);
          item.command = {
            title: "章节内容",
            command: "juejin_xc.sections",
            arguments: [section, item],
          };
          section.status === 0 &&
            (item.iconPath = {
              light: iconSvg("lock"),
              dark: iconSvg("lock"),
            });
          // item.tooltip = section.markdown_show;
          return item;
        })
      );
    });
  }

  onDidChangeTreeData?:
    | vscode.Event<void | XCViewItem | XCViewItem[] | null | undefined>
    | undefined = this._onDidChangeTreeData.event;

  getTreeItem(
    element: XCViewItem
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }
  getChildren(
    element?: XCViewItem | undefined
  ): vscode.ProviderResult<XCViewItem[]> {
    if (element) {
      const { contextValue } = element;
      return contextValue?.includes("XC")
        ? this.renderSection(contextValue?.split("_")[1])
        : [];
    } else {
      if (!isReady()) {
        return [];
      }
      return this.renderXCList();
    }
  }

  getParent?(element: XCViewItem): vscode.ProviderResult<XCViewItem> {
    return element;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}
