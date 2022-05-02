import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './routes/categories/categories.module';
import { LanguagesModule } from './routes/languages/languages.module';
import { GamesModule } from './routes/games/games.module';
import { ImagesModule } from './routes/images/images.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: 3306,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      cli: {
        migrationsDir: 'migration',
      },
    }),
    AuthModule,
    CategoriesModule,
    LanguagesModule,
    GamesModule,
    ImagesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
