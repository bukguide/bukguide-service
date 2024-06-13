import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LanguageModule } from './categories/language/language.module';
import { LocationModule } from './categories/location/location.module';
import { TagModule } from './categories/tag/tag.module';
import { BlogModule } from './blog/blog.module';
import { PermissionModule } from './categories/permission/permission.module';
import { ExpertiseModule } from './categories/expertise/expertise.module';
import { TypeTourModule } from './categories/type-toure/type-tour.module';
import { UploadModule } from './upload/upload.module';
import { ChatGateway } from './chat/chat.gateway';
import { ChatModule } from './chat/chat.module';
import { ChatService } from './chat/chat.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    LanguageModule,
    LocationModule,
    TypeTourModule,
    TagModule,
    BlogModule,
    PermissionModule,
    ExpertiseModule,
    UploadModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway, ChatService],
})
export class AppModule { }
