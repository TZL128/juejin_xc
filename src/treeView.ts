import * as vscode from "vscode";
import { xcList, xcSections, xcCategory, xcCategoryList } from "@/api/request";
import { isReady, getConfiguration, OTHERCONFIG } from "@/config";
import { iconSvg } from "@/utils";

class XCViewItem extends vscode.TreeItem { }

export class XCTreeView implements vscode.TreeDataProvider<XCViewItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    XCViewItem | undefined | null | void
  > = new vscode.EventEmitter<XCViewItem | undefined | null | void>();

  private renderXCList(): Promise<XCViewItem[]> {
    return new Promise(async (resolve) => {
      const list = await xcList();
      const has: XCViewItem[] = [],no:XCViewItem[]=[];
      list.forEach(xc => {
        if (xc.is_buy) {
          const item = new XCViewItem(
            xc.title,
            vscode.TreeItemCollapsibleState.Collapsed
          );
          item.contextValue = `XC_${xc.booklet_id}_${xc.is_buy}_${xc.course_type}`;
          item.tooltip = `作者：${xc.user_name}\n描述：${xc.summary}\n总章节数：${xc.section_count}\n已更新章节数：${xc.section_updated_count}`;
          item.iconPath = {
            light: iconSvg("xc"),
            dark: iconSvg("xc"),
          };
          const order = (getConfiguration(OTHERCONFIG) as Record<string, any>).order || [];
          const index = order.indexOf(xc.booklet_id);
          index !== -1 ? has.splice(index, 1, item) : no.push(item);
        }
      });
      return resolve([...has,...no]);
    });
  }

  private renderSection(booklet_id: string): Promise<XCViewItem[]> {
    return new Promise(async (resolve) => {
      const list = await xcSections({ booklet_id });
      resolve(
        list.map((section, index) => {
          const order = index + 1 < 10 ? `${index + 1}  ` : `${index + 1}`;
          const item = new XCViewItem(`${order} ${section.title}`);
          item.command = {
            title: "章节内容",
            command: "juejin_xc.sections",
            arguments: [true, section, item, 0],
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

export class XCAllTreeView implements vscode.TreeDataProvider<XCViewItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    XCViewItem | undefined | null | void
  > = new vscode.EventEmitter<XCViewItem | undefined | null | void>();

  private renderCategory(): Promise<XCViewItem[]> {
    return new Promise(async (resolve) => {
      const list = await xcCategory();
      resolve(
        list.map((category) => {
          const item = new XCViewItem(
            category.category_name,
            vscode.TreeItemCollapsibleState.Collapsed
          );
          item.contextValue = `category_${category.category_id}`;
          return item;
        })
      );
    });
  }

  private renderXCList(category_id: string): Promise<XCViewItem[]> {
    return new Promise(async (resolve) => {
      const list = await xcCategoryList(category_id);
      resolve(
        list.map((xc) => {
          const item = new XCViewItem(
            `${xc.title}`,
            vscode.TreeItemCollapsibleState.Collapsed
          );
          item.contextValue = `XC_${xc.booklet_id}_${xc.is_buy}_${xc.course_type}`;
          item.tooltip = `作者：${xc.user_name}\n是否购买：${xc.is_buy ? "是" : "否"
            }\n是否上新：${xc.is_new ? "是" : "否"}\n总章节数：${xc.section_count
            }\n已更新章节数：${xc.section_updated_count}\n描述：${xc.summary}`;
          const icon = iconSvg(xc.is_new ? "new" : xc.is_buy ? "has" : "xc");
          item.iconPath = {
            light: icon,
            dark: icon,
          };
          return item;
        })
      );
    });
  }

  private renderSection(
    booklet_id: string,
    is_buy: boolean
  ): Promise<XCViewItem[]> {
    return new Promise(async (resolve) => {
      const list = await xcSections({ booklet_id });
      resolve(
        list.map((section, index) => {
          const order: string =
            index + 1 < 10 ? `${index + 1}  ` : `${index + 1}`;
          const item = new XCViewItem(`${order} ${section.title}`);
          item.command = {
            title: "章节内容",
            command: "juejin_xc.sections",
            arguments: [is_buy, section, item, 1],
          };
          item.tooltip = `能否试学：${section.is_free ? "能" : "否"
            }\n是否创作完毕：${section.status ? "是" : "否"}`;

          if (
            (!is_buy && section.is_free === 0) ||
            (is_buy && section.status === 0)
          ) {
            item.iconPath = {
              light: iconSvg("lock"),
              dark: iconSvg("lock"),
            };
          }

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
      const [type, id, buy] = contextValue!.split("_");
      return type === "category"
        ? this.renderXCList(id)
        : type === "XC"
          ? this.renderSection(id, buy === "true")
          : [];
    } else {
      return this.renderCategory();
    }
  }

  getParent?(element: XCViewItem): vscode.ProviderResult<XCViewItem> {
    return element;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}
