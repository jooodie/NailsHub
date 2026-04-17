# 台南美甲預約網站平台｜核心資料表設計草稿

## 1. 文件目的

本文件用於整理台南美甲預約網站平台的核心資料表設計，作為後續資料庫建模、API 設計與系統實作的基礎。

此版本以 MVP 功能需求為核心，僅納入目前必要的資料結構，避免過早設計過多商業化欄位。未來如需擴充會員系統、通知機制、評價系統、金流與平台抽成，可再於後續版本延伸。

---

## 2. 設計原則

### 2.1 對齊 MVP 功能
目前資料表設計主要支援以下流程：
- 店家上架
- 服務管理
- 可預約時段管理
- 顧客預約
- 預約管理

### 2.2 保留未來擴充性
雖然 MVP 不一定立即支援會員、金流與通知功能，但資料表會預留基本延伸空間，例如：
- 預約狀態欄位
- 金額欄位
- 建立/更新時間
- 可擴充的角色設計

### 2.3 先求清楚，再求複雜
現階段以簡單、可實作、易理解為主，不急著處理太複雜的排班、拆帳或跨分店情境。

---

## 3. 核心實體

MVP 階段主要包含以下核心實體：
- users：系統使用者
- shops：店家資料
- services：店家提供的服務項目
- availability_slots：店家可預約時段
- bookings：顧客預約紀錄

---

## 4. 資料表設計

## 4.1 users

### 用途
儲存系統中的使用者帳號資料。MVP 階段主要包含店家與管理員，若未來要加入顧客會員系統，也可沿用此表。

### 欄位建議
- id：使用者 ID（PK）
- name：姓名
- email：電子郵件
- password_hash：密碼雜湊值
- role：角色（shop_owner / admin / customer）
- phone：聯絡電話（可選）
- created_at：建立時間
- updated_at：更新時間

### 備註
- 若 MVP 初期不做顧客登入，可先只建立 shop_owner 與 admin。
- customer 角色可作為未來會員系統擴充預留。

---

## 4.2 shops

### 用途
儲存美甲店家的基本資訊，每一家店家通常對應一位店家帳號。

### 欄位建議
- id：店家 ID（PK）
- owner_id：店家擁有者 ID（FK -> users.id）
- shop_name：店家名稱
- description：店家介紹
- district：行政區（例如：東區、中西區、北區）
- address：完整地址
- contact_phone：聯絡電話
- business_hours：營業時間說明
- cover_image_url：封面圖片連結
- status：審核狀態（pending / approved / rejected）
- created_at：建立時間
- updated_at：更新時間

### 備註
- 若之後支援多分店，可再拆出 branch 或 locations 資料表。
- business_hours 在 MVP 可先用文字儲存，未來若要更精細管理可再結構化。

---

## 4.3 services

### 用途
儲存每家店提供的美甲服務項目，例如單色凝膠、美甲設計、卸甲等。

### 欄位建議
- id：服務 ID（PK）
- shop_id：店家 ID（FK -> shops.id）
- name：服務名稱
- description：服務說明
- price：價格
- duration_minutes：服務時長（分鐘）
- is_active：是否上架中
- created_at：建立時間
- updated_at：更新時間

### 備註
- price 建議使用整數儲存，例如以新台幣元為單位。
- duration_minutes 對預約時段切分與後續排程很重要。

---

## 4.4 availability_slots

### 用途
儲存店家可開放預約的時段，供顧客選擇。

### 欄位建議
- id：時段 ID（PK）
- shop_id：店家 ID（FK -> shops.id）
- date：日期
- start_time：開始時間
- end_time：結束時間
- is_available：是否可預約
- created_at：建立時間
- updated_at：更新時間

### 備註
- MVP 可先以「店家預先開時段」的方式處理，實作較直觀。
- 未來若要支援更進階排班，可再拆成 weekly_templates、exceptions 等資料表。
- 系統需搭配 booking 邏輯避免同一時段被重複預約。

---

## 4.5 bookings

### 用途
儲存顧客的預約紀錄，是整個平台最核心的交易資料。

### 欄位建議
- id：預約 ID（PK）
- shop_id：店家 ID（FK -> shops.id）
- service_id：服務 ID（FK -> services.id）
- slot_id：時段 ID（FK -> availability_slots.id，可選）
- customer_name：顧客姓名
- customer_phone：顧客電話
- customer_email：顧客電子郵件（可選）
- booking_date：預約日期
- booking_time：預約時間
- note：備註
- status：預約狀態（pending / confirmed / completed / cancelled）
- total_amount：預約金額
- created_at：建立時間
- updated_at：更新時間

### 備註
- 若顧客未登入，MVP 可直接以 customer_name / phone 儲存。
- 若未來支援顧客會員，可加入 customer_user_id（FK -> users.id）。
- total_amount 可先保留，未來串金流會更方便。

---

## 5. 資料表關係

### 關係摘要
- 一位使用者（shop_owner）可擁有一家店家
- 一家店家可有多個服務項目
- 一家店家可有多個可預約時段
- 一家店家可有多筆預約紀錄
- 一個服務項目可對應多筆預約
- 一個時段原則上只應對應一筆有效預約

### 關係示意
- users 1 --- 1 shops
- shops 1 --- N services
- shops 1 --- N availability_slots
- shops 1 --- N bookings
- services 1 --- N bookings
- availability_slots 1 --- 0..1 bookings

---

## 6. 欄位設計補充

### 6.1 status 類欄位
建議使用 enum 或受控字串值，避免資料混亂。

#### shops.status
- pending
- approved
- rejected

#### bookings.status
- pending
- confirmed
- completed
- cancelled

---

### 6.2 時間欄位
建議所有主要資料表都保留：
- created_at
- updated_at

原因：
- 方便後續做後台管理
- 方便查詢最新資料
- 方便未來擴充報表分析

---

### 6.3 刪除策略
MVP 階段建議採用「軟刪除」或 is_active 類方式，而不要直接刪除重要資料。

例如：
- services 可用 is_active 下架
- bookings 不建議真的刪除，應改為 cancelled

---

## 7. 未來可擴充的資料表

以下資料表可待 Phase 2 或 Phase 3 再新增：

### 顧客會員系統
- customer_profiles
- favorite_shops

### 通知機制
- notifications
- message_logs

### 評價系統
- reviews
- review_images

### 金流機制
- payments
- refunds
- payout_records

### 平台營運分析
- shop_metrics
- booking_reports

---

## 8. 實作建議

### MVP 階段建議優先順序
1. users
2. shops
3. services
4. availability_slots
5. bookings

### 原因
這五張表已足以支撐最基本的平台流程：
- 店家註冊與上架
- 新增服務
- 建立可預約時段
- 顧客完成預約
- 店家管理預約狀態

---

## 9. 一句話總結

這份核心資料表設計的重點，是用最少但足夠的資料結構支撐台南美甲預約平台的 MVP，先把「店家可管理、顧客可預約、系統不撞單」這三件事做穩，再逐步擴充會員、通知、評價與金流功能。