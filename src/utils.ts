import * as path from "path";

//返回icon路径
export const iconSvg = (svg: string): string => {
  return path.join(__dirname, "..", "resource", "svgs", `${svg}.svg`);
};
