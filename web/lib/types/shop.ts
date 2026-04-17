/** 對應後端 `GET /shops` 項目（蛇形命名與 API 一致） */
export type ShopListItem = {
  id: string;
  name: string;
  cover_image_url: string;
  district: string;
  summary: string;
};

export type ServiceItem = {
  id: string;
  name: string;
  price_ntd: number;
  duration_minutes: number;
};

export type DayAvailability = {
  date: string;
  slots: string[];
};

/** 對應後端 `GET /shops/{id}` */
export type ShopDetail = ShopListItem & {
  address: string;
  description: string;
  phone: string;
  services: ServiceItem[];
  availability: DayAvailability[];
};
