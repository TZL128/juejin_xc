import { request } from "./axios";
import { XC, Section, SectionParams, XCCategory, Comment } from "#/global";

//获取的我小册
export const xcList = async (): Promise<XC[]> => {
  const { data, code } = await request({
    url: "/booklet/bookletshelflist",
    method: "post",
  });
  if (code !== 200) {
    return [];
  }
  return (data || []).map((item: any) => {
    const {
      is_buy,
      is_new,
      section_updated_count,
      base_info: {
        background_img,
        booklet_id,
        title,
        summary,
        section_count,
        course_type,
      },
      user_info: { user_name },
    } = item;
    return {
      is_buy,
      is_new,
      background_img,
      booklet_id,
      title,
      summary,
      user_name,
      section_count,
      section_updated_count,
      course_type,
    };
  });
};

//获取小册章节
export const xcSections = async (data: {
  booklet_id: string;
}): Promise<Section[]> => {
  const res = await request({
    url: "/booklet/get",
    method: "post",
    data,
  });
  if (res.code !== 200) {
    return [];
  }
  return (res.data?.sections || []).map((item: any) => {
    const {
      booklet_id,
      section_id,
      title,
      status,
      is_free,
      reading_progress,
    } = item;
    return {
      booklet_id,
      section_id,
      title,
      status,
      is_free,
      has_update: reading_progress?.has_update,
      progress: reading_progress?.reading_progress,
      markdown_show: res.data?.introduction.markdown_show,
    };
  });

};

//小册内容
export const xcContent = async (data: SectionParams): Promise<string> => {
  const res = await request({
    url: "/section/get",
    method: "post",
    data,
  });
  if (res.code !== 200) {
    return "";
  }
  return res.data?.section.content;
};

//章节评论
export const xcComment = async (data: any): Promise<{
  data: Comment[],
  hasMore?: boolean,
  total?: Number
}> => {
  const res = await request({
    url: "https://api.juejin.cn/interact_api/v1/comment/list",
    method: "post",
    data,
  });
  if (res.code !== 200) {
    return {
      total: 0,
      hasMore: false,
      data: []
    };
  }
  return {
    total: res.count,
    data: res.data,
    hasMore: res.has_more
  };
};

//更多评论
export const xcMoreComment = async (id: string): Promise<Comment[]> => {
  const [item_id, comment_id] = id.split('_');
  const res = await request({
    url: "https://api.juejin.cn/interact_api/v1/reply/list",
    method: "POST",
    data: {
      client_type: 2608,
      comment_id,
      cursor: "0",
      item_id,
      item_type: 13,
      limit: 20,
    },
  });
  if (res.code !== 200) {
    return [];
  }
  return res.data;
};

//获取小册分类
export const xcCategory = async (): Promise<XCCategory[]> => {
  const res = await request({
    url: "/course/course_category_list",
    method: "post",
    data: { show_type: 2 },
  });
  if (res.code !== 200) {
    return [];
  }
  return res.data?.booklet_categories.map((item: any) => {
    const { category_id, category_name } = item;
    return { category_id, category_name };
  });
};

//获取分类下的小册列表
export const xcCategoryList = async (category_id: string): Promise<XC[]> => {
  const res = await request({
    url: "/booklet/listbycategory",
    method: "post",
    data: {
      category_id,
      cursor: "0",
      is_vip: 0,
      limit: 9999,
      sort: 10,
    },
  });
  if (res.code !== 200) {
    return [];
  }
  const has: XC[] = [],
    no: XC[] = [];
  (res.data || []).forEach((item: any) => {
    const {
      is_buy,
      is_new,
      section_updated_count,
      base_info: {
        background_img,
        booklet_id,
        title,
        summary,
        section_count,
        course_type,
      },
      user_info: { user_name },
    } = item;
    const xc = {
      is_buy,
      is_new,
      background_img,
      booklet_id,
      title,
      summary,
      user_name,
      section_count,
      section_updated_count,
      course_type,
    };
    is_buy ? has.push(xc) : no.push(xc);
  });
  return [...no, ...has];
};
