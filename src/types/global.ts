import * as vscode from "vscode";
//小册
export type XC = {
  background_img: string;
  booklet_id: string;
  title: string;
  summary: string;
  is_buy: boolean;
  is_new: boolean;
  user_name: string;
  section_count: number;
  section_updated_count: number;
  course_type:number
};

//章节
export type Section = {
  booklet_id: string;
  section_id: string;
  title: string;
  status: number;
  has_update: any;
  progress:any;
  is_free: number;
  markdown_show: string;
};

//章节内容请求参数
export type SectionParams = {
  section_id: string;
};

//小册分类
export type XCCategory = {
  category_id: string;
  category_name: string;
};

export type Theme={
  theme:string;
  name?:string;
  color:string;
  backgroundColor:string;
};

export interface SectionPanel extends vscode.WebviewPanel {
  reRender: () => void;
}

