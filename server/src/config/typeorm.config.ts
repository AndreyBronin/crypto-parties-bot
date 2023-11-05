import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

let config: any = {
  type: 'postgres',
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PWD,
  autoLoadEntities: true, // No need to import entities.
  synchronize: true,
  logging: 'all',
};

if (process.env.NODE_ENV === 'production') {
  config = {
    ...config,
    extra: {
      socketPath: process.env.DB_HOST,
    },
  };
}

if (process.env.NODE_ENV === 'development') {
  config = {
    ...config,
    port: +process.env.DB_PORT,
  };
}

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PWD,
  autoLoadEntities: true, // No need to import entities.
  synchronize: true,
  logging: 'all',
};

// https://github.com/brianc/node-postgres/issues/1617
// https://stackoverflow.com/questions/58129579/cant-connect-to-cloud-sql-using-node-postgres
// https://github.com/typeorm/typeorm/issues/2614
