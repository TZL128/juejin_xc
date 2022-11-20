import { type } from "os";

//小册
export type XC = {
  background_img: string;
  booklet_id: string;
  title: string;
  summary: string;
  is_buy: boolean;
  is_new: boolean;
  user_name: string;
};

//章节
export type Section = {
  booklet_id: string;
  section_id: string;
  title: string;
  status: number;
  is_update: number;
  is_free: number;
  markdown_show: string;
};

//章节内容请求参数
export type SectionParams = {
  section_id: string;
};
