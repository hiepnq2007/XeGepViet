# Landing Page Result

Tài liệu này ghi lại trạng thái hiện tại của landing page để lần sau quay lại có thể tiếp tục ngay.

## Tình trạng hiện tại

- Landing page là site tĩnh, deploy bằng GitHub Pages từ branch `master` ở root.
- Có 2 ngôn ngữ:
  - `index.html` cho tiếng Việt.
  - `en.html` cho tiếng Anh.
- Site đã có:
  - `canonical`
  - `hreflang`
  - Open Graph
  - Twitter Card
  - `privacy.html` và `privacy-en.html`
- Site đang dùng `script.js` thuần để xử lý giao diện và form lead.

## Việc đã chỉnh gần đây

- Thêm QR code cho App Store và Google Play ở khối tải ứng dụng.
- Giữ layout QR theo kiểu ngang, không làm vỡ bố cục.
- Cập nhật các nút `App Store` và `Google Play` theo đúng style hiện có.
- Bỏ các câu chữ kiểu “sắp ra mắt” khi nội dung đã live.
- Chỉnh copy theo hướng ứng dụng dành cho hành khách, không nhấn mạnh driver trong phần app chính.
- Bổ sung form lead ở landing page để thu thông tin:
  - Họ tên
  - Số điện thoại
  - Vai trò `customer` hoặc `driver`
- Form lead hiện gửi dữ liệu sang forum microservice qua API:
  - `POST /community/forum/api/forum/landing-leads` khi chạy production
  - `POST http://127.0.0.1:3020/api/forum/landing-leads` khi chạy local

## SEO hiện tại

### Đã có

- Title và meta description theo từng ngôn ngữ.
- Open Graph phục vụ chia sẻ mạng xã hội.
- `hreflang` để phân biệt `vi`, `en` và `x-default`.
- `canonical` cho từng bản.
- Trang privacy riêng cho App Store và website.

### Cần giữ đúng khi sửa tiếp

- Không đổi URL chính thức nếu chưa cập nhật đồng bộ SEO.
- Không bỏ `canonical` hoặc `hreflang`.
- Không để nội dung Việt/Anh bị lệch nhau quá nhiều ở các block chính.
- Khi thêm section mới, cần cập nhật:
  - title
  - description
  - OG tags
  - bản tiếng Anh tương ứng

## Hướng SEO tiếp theo

1. Giữ nội dung landing page ngắn, rõ, có từ khóa chính:
   - xe ghép liên tỉnh
   - đặt xe ghép
   - đặt xe intercity
   - chuyến đi liên tỉnh
2. Mỗi section nên có heading rõ nghĩa, không nhồi từ khóa.
3. Ảnh QR và ảnh minh họa nên có `alt` mô tả đúng nội dung.
4. Khi cần thêm bài viết marketing hoặc chiến dịch SEO, nên tạo nội dung theo nhóm:
   - landing page
   - bài blog
   - fanpage/social
   - hướng dẫn sử dụng app

## Ghi chú vận hành

- Sau khi sửa landing page, chỉ cần commit và push `master` để GitHub Pages tự cập nhật.
- Không cần build tool.
- Nếu sau này thêm form hoặc tracking khác, nên ghi lại endpoint và payload vào file này.
