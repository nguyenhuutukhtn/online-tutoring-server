

Đồ án cuối kỳ môn Phát triển ứng dụng web nâng cao Giảng viên: thầy Nguyễn Huy Khánh

Đề tài: Website tìm kiếm gia sư

Danh sách thành viên:

1612277 - Ngô Đức Kha

1612700 - Nguyễn Ngô Tín

1612766 - Nguyễn Hữu Tú

Công nghệ phía backend:
+ ExpressJs
+ Socket.io
+ mySQL database
+ mySQL npm package
+ Docker
+ PassportJs, JWT authentication
+ Cloudiary storage

Lý do lựa chọn:

Expressjs: Tạo ra server cho phép nhận request từ client, xử lý yêu cầu và gửi response chứa dữ liệu phản hồi
Socket.io: Thực hiện chức năng real-time như chat, thông báo
mySQL: Database: Lưu trữ dữ liệu theo cấu trúc bảng, dễ sử dụng, truy xuất và lưu trữ. Có thể lưu trữ trên các host online free, tốn ít dung lượng lưu trữ hơn so với các database phi cấu trúc
mysql npm package: Dùng để tạo kết nối và hỗ trợ truy xuất dữ liệu giữa ứng dụng express với MySQL database
PassportJs, JWT authentication: Chứng thực đăng nhập bằng username, password, đăng nhập bằng google, facebook. Phân quyền người dùng, bảo vệ API
Cloudiary storage: Hỗ trợ upload và lưu trữ hình ảnh
Docker: ......

Kiến trúc phần mềm:
Kiến trúc chính: Client-server
Tách biệt website thành ba thành phần riêng biệt: Client (Reactjs), Server(Expressjs), Database(MySQL)
Server - client giao tiếp với nhau thông qua RESTful API, đảm bảo khả năng phát triển các chức năng song song nhau. Có thể chia nhỏ thành các server độc lập

Kiến trúc phía server: MVC
Gồm ba phần: 
Thư mục views chứa các file template (file có phần mở rộng là .hbs), các file này được dùng để hiển thị dữ liệu, tức là tương tự với phần Views trong MVC.
Thư mục routes được dùng để chuyển hướng các URL đến các hàm xử lý tương ứng, tức là tương tự với Controller trong MVC.
Model: Dùng để truy xuất và lưu trữ dữ liệu
