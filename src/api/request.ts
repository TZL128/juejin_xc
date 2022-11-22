import { request } from "./axios";
import { XC, Section, SectionParams, XCCategory } from "#/global";

//获取的我小册
export const xcList = (): Promise<XC[]> => {
  return new Promise(async (resolve) => {
    const { data, code } = await request({
      url: "/booklet/bookletshelflist",
      method: "post",
    });
    if (code !== 200) {
      return resolve([]);
    }

    resolve(
      (data || []).map((item: any) => {
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
            course_type
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
          course_type
        };
      })
    );
  });
};

//获取小册章节
export const xcSections = (data: {
  booklet_id: string;
}): Promise<Section[]> => {
  return new Promise(async (resolve) => {
    const res = await request({
      url: "/booklet/get",
      method: "post",
      data,
    });
    if (res.code !== 200) {
      return resolve([]);
    }
    resolve(
      res.data?.sections.map((item: any) => {
        const { booklet_id, section_id, title, status, is_free, is_update } =
          item;
        return {
          booklet_id,
          section_id,
          title,
          status,
          is_free,
          is_update,
          markdown_show: res.data?.introduction.markdown_show,
        };
      })
    );
  });
};

//小册内容
export const xcContent = (data: SectionParams): Promise<string> => {
  return new Promise(async (resolve) => {
    const res = await request({
      url: "/section/get",
      method: "post",
      data,
    });
    if (res.code !== 200) {
      return resolve("");
    }
    resolve(res.data?.section.content);
  });
};

//获取小册分类
export const xcCategory = (): Promise<XCCategory[]> => {
  return new Promise(async (resolve) => {
    const res = await request({
      url: "/course/course_category_list",
      method: "post",
      data: { show_type: 2 },
    });
    if (res.code !== 200) {
      return resolve([]);
    }
    resolve(
      res.data?.booklet_categories.map((item: any) => {
        const { category_id, category_name } = item;
        return { category_id, category_name };
      })
    );
  });
};

//获取分类下的小册列表
export const xcCategoryList = (category_id: string): Promise<XC[]> => {
  return new Promise(async (resolve) => {
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
      return resolve([]);
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
          course_type
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
        course_type
      };
      is_buy ? has.push(xc) : no.push(xc);
    });
    resolve([...no, ...has]);
  });
};
