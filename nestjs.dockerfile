# Sử dụng image cơ bản
FROM node

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép các file package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép mã nguồn của ứng dụng vào thư mục làm việc
COPY . .

# Tạo schema của Prisma
RUN npm cache clean --force
RUN npm rebuild bcrypt --build-from-source
RUN npm install prisma
RUN npx prisma generate

# Expose cổng mà ứng dụng của bạn chạy trên
EXPOSE 3000

# Lệnh để chạy ứng dụng của bạn
CMD ["npm", "run", "start:prod"]