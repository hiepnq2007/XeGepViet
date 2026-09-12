# Xe Ghép Việt Landing Page

Static landing page cho dự án **Xe Ghép Việt**, deploy bằng GitHub Pages từ branch
`master`, folder `/(root)`.

## Cấu trúc

```text
.
├── CNAME
├── index.html
├── en.html
├── privacy.html
├── privacy-en.html
├── assets/qr
├── styles.css
├── script.js
└── README.md
```

Không cần build tool. Site dùng HTML/CSS/JS thuần nên GitHub Pages có thể phục vụ
trực tiếp từ root repository.

## Chạy local

Cách nhanh nhất:

```bash
open index.html
```

Hoặc chạy local server để test giống static hosting:

```bash
python3 -m http.server 8080
```

Sau đó mở:

```text
http://localhost:8080
```

## Deploy GitHub Pages

Repository GitHub Pages đang cấu hình:

- Source: `Deploy from a branch`
- Branch: `master`
- Folder: `/(root)`
- HTTPS: enabled

Quy trình deploy:

```bash
git add index.html styles.css script.js CNAME README.md
git commit -m "Build landing page"
git push origin master
```

Sau khi push, GitHub Pages sẽ tự publish site từ file `index.html`.

## Đa ngôn ngữ và SEO

Site dùng tiếng Việt làm mặc định:

```text
https://xeghepviet.com/
```

Bản tiếng Anh dùng URL riêng:

```text
https://xeghepviet.com/en.html
```

Các trang chính có `canonical`, `hreflang`, Open Graph và Twitter Card để phục
vụ SEO, chia sẻ link và index đa ngôn ngữ rõ ràng. Khi thêm trang mới, cần thêm:

- `link rel="canonical"` trỏ về URL chính thức của trang.
- `link rel="alternate" hreflang="vi"` và `hreflang="en"` cho cặp ngôn ngữ.
- `hreflang="x-default"` trỏ về bản tiếng Việt mặc định.
- Open Graph gồm `og:title`, `og:description`, `og:url`, `og:image`, `og:locale`.

## Cấu hình domain `xeghepviet.com`

File `CNAME` ở root đã cấu hình:

```text
xeghepviet.com
```

Trong phần quản lý DNS của nhà cung cấp tên miền, cấu hình như sau.

### Apex domain

Với domain gốc `xeghepviet.com`, thêm 4 bản ghi `A` trỏ về GitHub Pages:

```text
Type: A
Name/Host: @
Value: 185.199.108.153

Type: A
Name/Host: @
Value: 185.199.109.153

Type: A
Name/Host: @
Value: 185.199.110.153

Type: A
Name/Host: @
Value: 185.199.111.153
```

Nếu DNS provider hỗ trợ IPv6, có thể thêm `AAAA`:

```text
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

### Subdomain www

Nếu muốn dùng `www.xeghepviet.com`, thêm:

```text
Type: CNAME
Name/Host: www
Value: hiepnq2007.github.io
```

Sau khi DNS cập nhật, vào GitHub repository:

```text
Settings -> Pages -> Custom domain
```

Nhập:

```text
xeghepviet.com
```

Bật `Enforce HTTPS` khi GitHub xác thực domain xong. DNS có thể mất vài phút đến
vài giờ để propagate.

## Cấu hình Cloudflare bảo vệ GitHub Pages

Cloudflare chỉ làm lớp DNS/proxy phía trước GitHub Pages; origin của site vẫn là
GitHub Pages, không trỏ domain này về server BeTrip hoặc IP production riêng.

Thực hiện theo thứ tự sau:

1. Trong GitHub, vào `Settings -> Pages`, đặt custom domain là
   `xeghepviet.com` và chờ GitHub cấp certificate HTTPS.
2. Trong Cloudflare DNS, giữ đúng các record sau:

   ```text
   A      @      185.199.108.153
   A      @      185.199.109.153
   A      @      185.199.110.153
   A      @      185.199.111.153
   CNAME  www    hiepnq2007.github.io
   ```

   Trong lúc GitHub xác thực domain/cấp certificate, để các record ở chế độ
   `DNS only` (mây xám). Sau khi `Enforce HTTPS` hoạt động ổn định, có thể bật
   `Proxied` (mây cam) cho `@` và `www` để dùng WAF, chống DDoS và caching của
   Cloudflare.
3. Tại nhà đăng ký tên miền, thay toàn bộ nameserver cũ bằng đúng hai
   nameserver Cloudflare được cấp cho zone. Không giữ đồng thời nameserver
   ZoneDNS và Cloudflare.
4. Trong Cloudflare `SSL/TLS`, chọn `Full (strict)`, bật `Always Use HTTPS` và
   `Automatic HTTPS Rewrites`. Không dùng `Flexible` vì có thể tạo redirect
   loop và kết nối origin không mã hóa.
5. Không bật DNSSEC ở nhà đăng ký trong lúc đổi nameserver. Sau khi Cloudflare
   báo zone `Active`, nếu cần DNSSEC thì bật trong Cloudflare rồi thêm DS record
   mà Cloudflare cấp tại nhà đăng ký.

Kiểm tra sau khi nameserver propagate:

```bash
dig NS xeghepviet.com
dig A xeghepviet.com
dig CNAME www.xeghepviet.com
curl -I https://xeghepviet.com
curl -I https://www.xeghepviet.com
```

`dig NS` phải trả về nameserver Cloudflare; response HTTPS khi proxy hoạt động
thường có header `server: cloudflare` và `CF-Ray`. Nếu vẫn trả về
`ns*.zonedns.vn`, cần chờ propagation hoặc kiểm tra lại nameserver tại registrar.

## Privacy Policy cho App Store

Privacy policy public URL:

```text
https://xeghepviet.com/privacy.html
```

English privacy policy URL:

```text
https://xeghepviet.com/privacy-en.html
```

URL này dùng cho App Store Connect ở mục:

```text
App Information -> App Privacy -> Privacy Policy URL
```

Chính sách hiện mô tả dữ liệu tài khoản, số điện thoại, hồ sơ tài xế, ảnh giấy
tờ, vị trí foreground/background, thông báo, booking/chuyến đi, lịch sử thu nhập
và quyền yêu cầu xoá dữ liệu.

## Nguồn ảnh

Landing page dùng ảnh remote từ Unsplash/Pexels với license miễn phí. Khi cần
ổn định tuyệt đối cho production, nên tải ảnh tối ưu về repo/CDN riêng và cập
nhật đường dẫn trong `index.html`.
