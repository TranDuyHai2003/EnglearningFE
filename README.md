# EngLearning Frontend

Giao diện người dùng cho dự án EngLearning, được xây dựng bằng Next.js 15, React 19 và Tailwind CSS.

## 🛠 Công nghệ sử dụng
- **Framework**: Next.js 15 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS v4, Shadcn/ui
- **State**: Zustand
- **Form**: React Hook Form + Zod

## 🚀 Hướng dẫn Cài đặt & Chạy Local

### 1. Yêu cầu
- **Node.js**: Phiên bản 18 trở lên.
- **Package Manager**: Khuyên dùng `pnpm` (hoặc `npm`).

### 2. Cài đặt dependencies
```bash
git clone https://github.com/TranDuyHai2003/EnglearningFE.git
cd EnglearningFE
pnpm install
# hoặc npm install
```

### 3. Cấu hình môi trường
Tạo file `.env.local` tại thư mục gốc của dự án:

```env
# URL của Backend API (đang chạy local hoặc production)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Chạy dự án
```bash
npm run dev
```
Truy cập trình duyệt tại: `http://localhost:3000`

## 📦 Hướng dẫn Deploy

Cách đơn giản và tối ưu nhất để deploy Next.js là sử dụng **Vercel**.

### Các bước thực hiện:

1.  Push code lên GitHub.
2.  Truy cập [Vercel](https://vercel.com) và đăng nhập.
3.  Chọn **Add New...** -> **Project**.
4.  Import repository `EnglearningFE`.
5.  **Cấu hình Project**:
    - Framework Preset: Next.js (Tự động nhận diện).
    - **Environment Variables**: Thêm biến `NEXT_PUBLIC_API_URL` với giá trị là **URL của Backend đã deploy** (ví dụ: `https://englearning-be.onrender.com/api`).
6.  Nhấn **Deploy**.

## 📂 Cấu trúc dự án
- `app/`: Chứa các page và layout (App Router).
    - `(public)`: Các trang công khai (Home, Login...).
    - `(protected)`: Các trang cần đăng nhập (Dashboard, Learning...).
- `components/`: Các UI component tái sử dụng.
- `lib/`: Các hàm tiện ích, gọi API (axios), và định nghĩa kiểu dữ liệu.
- `store/`: Quản lý state toàn cục (Zustand).
