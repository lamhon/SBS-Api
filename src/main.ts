declare const module: any;

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import Config from './configs/configs';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  app.setGlobalPrefix(Config.VERSION);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,  // Chỉ cho phép đối tượng được định nghĩa trong DTO và bỏ qua những đối tượng chưa được định nghĩa trong DTO
    transform: true,  // Chuyển đổi dữ liệu đầu vào nếu muốn nhận là 1 dạng chuỗi mà đầu vào là số thì sẽ tự động generate số thành chuỗi
    forbidNonWhitelisted: true, // Bất cứ thuộc tính nào không có trong whitelist sẽ gây ra lỗi và không được chấp thuận
    transformOptions: {
      enableImplicitConversion: true
    }
  }));

  await app.listen(Config.PORT);

  Logger.log(`SBS APIs server is running on: http://localhost:${Config.PORT}`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
