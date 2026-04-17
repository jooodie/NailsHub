/** 對應 `POST /bookings` 請求（蛇形命名與 API 一致） */
export type BookingCreatePayload = {
  shop_id: string;
  service_id: string;
  date: string;
  time_slot: string;
  customer_name: string;
  customer_phone: string;
  customer_notes?: string | null;
};

/** 對應 `POST /bookings`、`GET /bookings/{id}` 回應 */
export type BookingConfirmation = {
  id: string;
  shop_id: string;
  shop_name: string;
  service_id: string;
  service_name: string;
  price_ntd: number;
  duration_minutes: number;
  date: string;
  time_slot: string;
  customer_name: string;
  customer_phone: string;
  customer_notes: string | null;
  status: string;
};
