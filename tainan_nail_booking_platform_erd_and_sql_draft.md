# 台南美甲預約網站平台｜ERD 關係整理與 SQL Schema 草稿

## 1. 文件目的

本文件根據 MVP 規格與核心資料表設計草稿，進一步整理：
- 核心實體之間的關係（ERD 概念）
- 資料表建立時可參考的 SQL Schema 草稿

此版本以 MVP 階段為主，目標是支撐以下核心流程：
- 店家註冊 / 上架
- 店家建立服務項目
- 店家設定可預約時段
- 顧客建立預約
- 店家管理預約狀態

---

## 2. ERD 關係概念

### 核心資料表
- users
- shops
- services
- availability_slots
- bookings

### 關係說明
- 一位 `users` 可作為一位店家帳號（shop_owner）
- 一位店家帳號可對應一家 `shops`
- 一家 `shops` 可擁有多個 `services`
- 一家 `shops` 可擁有多個 `availability_slots`
- 一家 `shops` 可擁有多筆 `bookings`
- 一個 `services` 可被多筆 `bookings` 使用
- 一個 `availability_slots` 原則上只應被一筆有效預約占用

### 文字版 ERD
```text
users (1) ─── (1) shops
shops (1) ─── (N) services
shops (1) ─── (N) availability_slots
shops (1) ─── (N) bookings
services (1) ─── (N) bookings
availability_slots (1) ─── (0..1) bookings
```

---

## 3. 建表順序建議

建議依照以下順序建立資料表，以避免 foreign key 相依問題：

1. users
2. shops
3. services
4. availability_slots
5. bookings

---

## 4. SQL Schema 草稿

以下以 MySQL / MariaDB 常見語法風格撰寫，之後也可依 PostgreSQL 再調整。

### 4.1 users

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('shop_owner', 'admin', 'customer') NOT NULL DEFAULT 'shop_owner',
    phone VARCHAR(30),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 說明
- `email` 設為唯一，避免重複註冊。
- `role` 先保留 customer，方便未來擴充會員系統。

---

### 4.2 shops

```sql
CREATE TABLE shops (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    owner_id BIGINT NOT NULL UNIQUE,
    shop_name VARCHAR(150) NOT NULL,
    description TEXT,
    district VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(30),
    business_hours VARCHAR(255),
    cover_image_url VARCHAR(500),
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_shops_owner
        FOREIGN KEY (owner_id) REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);
```

### 說明
- `owner_id` 設 `UNIQUE`，表示 MVP 階段先假設一位店家帳號對應一家店。
- `district` 可用來支援台南行政區篩選。

---

### 4.3 services

```sql
CREATE TABLE services (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shop_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    duration_minutes INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_services_shop
        FOREIGN KEY (shop_id) REFERENCES shops(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);
```

### 說明
- `price` 用整數儲存，方便金額運算。
- `duration_minutes` 對後續排程與預約判斷重要。
- `is_active` 讓店家可下架服務而不必硬刪資料。

---

### 4.4 availability_slots

```sql
CREATE TABLE availability_slots (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shop_id BIGINT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_slots_shop
        FOREIGN KEY (shop_id) REFERENCES shops(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_slot_time
        CHECK (end_time > start_time)
);
```

### 建議索引
```sql
CREATE INDEX idx_slots_shop_date ON availability_slots(shop_id, date);
```

### 說明
- 先用單純的日期 + 起訖時間表示可預約時段。
- `is_available` 可搭配店家手動關閉特定時段使用。

---

### 4.5 bookings

```sql
CREATE TABLE bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shop_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    slot_id BIGINT,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    customer_email VARCHAR(255),
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    note TEXT,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    total_amount INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_shop
        FOREIGN KEY (shop_id) REFERENCES shops(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_service
        FOREIGN KEY (service_id) REFERENCES services(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_slot
        FOREIGN KEY (slot_id) REFERENCES availability_slots(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);
```

### 建議索引
```sql
CREATE INDEX idx_bookings_shop_date ON bookings(shop_id, booking_date);
CREATE INDEX idx_bookings_service ON bookings(service_id);
CREATE INDEX idx_bookings_slot ON bookings(slot_id);
```

### 說明
- `slot_id` 可連到使用者選擇的時段。
- `total_amount` 先保留，方便未來接金流。
- MVP 若不做顧客登入，先直接儲存顧客聯絡資訊即可。

---

## 5. 重複預約避免策略

這個平台最重要的系統邏輯之一，是避免同一時段被重複預約。

### MVP 可行做法

#### 做法 A：用 slot_id 控制
- 顧客只能從 `availability_slots` 中選擇時段
- 成功建立 booking 後，將該 slot 標記為不可用
- 或在查詢時只顯示尚未被有效 booking 占用的 slot

#### 做法 B：以 booking 狀態判斷
可將以下狀態視為「占用時段」：
- pending
- confirmed

不占用時段：
- completed
- cancelled

### 額外建議
如果你希望更嚴格，可以在應用層加入交易機制：
1. 建立 booking 前再次確認 slot 是否可用
2. 成功建立 booking 後立即更新 slot 狀態
3. 使用 transaction 避免併發撞單

---

## 6. 後續可擴充欄位建議

目前先不一定要建立，但未來可能會加上的欄位如下：

### bookings 可擴充
- payment_status
- payment_method
- booking_type
- customer_user_id
- cancel_reason

### shops 可擴充
- instagram_url
- line_contact
- latitude
- longitude

### services 可擴充
- category
- image_url
- sort_order

---

## 7. API 設計時可直接對應的資源

這份 schema 之後很適合直接對應 RESTful API：

- `GET /shops`
- `GET /shops/{id}`
- `POST /shops`
- `PUT /shops/{id}`
- `GET /shops/{id}/services`
- `POST /shops/{id}/services`
- `GET /shops/{id}/slots`
- `POST /shops/{id}/slots`
- `GET /shops/{id}/bookings`
- `POST /bookings`
- `PATCH /bookings/{id}`

---

## 8. 一句話總結

這份 ERD 與 SQL 草稿的目的，是把台南美甲預約平台的 MVP 從概念推進到可實作層級，先穩定支撐店家上架、服務管理、時段設定與顧客預約，再逐步擴充成更完整的商業平台。

