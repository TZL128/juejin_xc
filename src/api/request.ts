import { request } from "./axios";
import { XC, Section } from "#/global";

//获取的我小册
export const myXcList = (): Promise<XC[]> => {
  return new Promise(async (resolve) => {
    const { data, code } = await request({
      url: "/booklet/bookletshelflist",
      method: "post",
    });
    if (code !== 200) {
      return resolve([]);
    }

    resolve(
      data.map((item: any) => {
        const {
          is_buy,
          is_new,
          base_info: { background_img, booklet_id, title, summary },
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
