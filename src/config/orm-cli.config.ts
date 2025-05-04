import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Carga de Dotenv específica para la CLI
const nodeEnv = process.env.NODE_ENV || 'development';
// process.cwd() es más fiable para la CLI, asume que ejecutas `npm run typeorm...` desde la raíz
const envPath = join(process.cwd(), `.env.${nodeEnv}`);
console.log(`[CLI Config] Loading environment variables for CLI from: ${envPath}`);
dotenv.config({ path: envPath, debug: true }); // debug opcional

const getCliDataSourceOptions = (): DataSourceOptions => {
    const currentEnv = process.env.NODE_ENV; // Usa la variable ya leída

    if (currentEnv === 'test') {
        return {
            type: (process.env.DB_TYPE as any) || 'sqlite', // Debería ser 'sqlite' en .env.test
            database: process.env.DB_DATABASE || 'test.sqlite', // Lee de .env.test o default
            // Para la CLI, usa rutas relativas a la raíz (donde está tsconfig.json)
            entities: [join(process.cwd(), 'src', '**', '*.entity.{ts,js}')],
            // Las migraciones usualmente no se corren con sync:true, pero defínelas si las necesitas
            migrations: [join(process.cwd(), 'src', 'database', 'migrations', '*{.ts,.js}')],
            synchronize: false, // CLI no debe sincronizar
        };
    } else {
        const type = process.env.DB_TYPE as any;
        const host = process.env.DB_HOST;
        const port = parseInt(process.env.DB_PORT || '5432', 10);
        const username = process.env.DB_USERNAME;
        const password = process.env.DB_PASSWORD;
        const database = process.env.DB_DATABASE;

        if (!type || !host || !port || !username || !database) {
            throw new Error('[CLI] Missing required PostgreSQL ENV variables');
        }
        if (type !== 'postgres') {
            throw new Error(`[CLI] Invalid DB_TYPE specified: ${type}`);
        }

        return {
            type: "postgres",
            host: host,
            port: port,
            username: username,
            password: password,
            database: database,
            // Rutas relativas a la raíz para CLI
            entities: [join(process.cwd(), 'src', '**', '*.entity.{ts,js}')],
            migrations: [join(process.cwd(), 'src', 'database', 'migrations', '*{.ts,.js}')],
            migrationsTableName: "migrations",
            synchronize: false, // CLI nunca sincroniza
            ssl: currentEnv === 'production'
                ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true' }
                : false,
        };
    }
};

const cliDataSourceOptions = getCliDataSourceOptions();
// Exporta la instancia DataSource para que la CLI la encuentre
export default new DataSource(cliDataSourceOptions);