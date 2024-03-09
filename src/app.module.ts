import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LanguageModule } from './categories/language/language.module';
import { LocationModule } from './categories/location/location.module';
import { TypeToureModule } from './categories/type-toure/type-toure.module';
import { TagModule } from './categories/tag/tag.module';
import { BlogModule } from './blog/blog.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    LanguageModule,
    LocationModule,
    TypeToureModule,
    TagModule,
    BlogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
