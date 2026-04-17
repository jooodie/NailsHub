/** 對應後端 `GET /shops` 項目（蛇形命名與 API 一致） */
export type ShopListItem = {
  id: string;
  name: string;
  cover_image_url: string;
  district: string;
  summary: string;
};
