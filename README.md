<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->



## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


### Si al ejecutar los tests unitario da error con el Serialize, modificar la configuracion en el package.json:

  ```
  "jest": {
      "moduleFileExtensions": [
        "js",
        "json",
        "ts"
      ],
      "rootDir": "src",
      "testRegex": ".*\\.spec\\.ts$",
      "transform": {
        "^.+\\.(t|j)s$": "ts-jest"
      },
      "collectCoverageFrom": [
        "**/*.(t|j)s"
      ],
      "coverageDirectory": "../coverage",
      "testEnvironment": "node",
      "moduleNameMapper": {
        "^src/(.*)$": "<rootDir>/$1"
      }
    }
  ```


  ## Configuracion

  ``` npm install @nestjs/config ```

  Para establecer la variable de entorno NODE_ENV

    ``` npm install cross-env ```


## Databases - Migraciones


# Gestión de Migraciones de Base de Datos (TypeORM)

Este proyecto utiliza TypeORM para gestionar los cambios en el esquema de la base de datos a través de migraciones. Esto nos permite versionar los cambios del esquema de forma fiable y aplicarlos consistentemente en diferentes entornos (desarrollo, testing, producción), especialmente porque **NO** usamos `synchronize: true` en entornos de staging o producción para evitar la pérdida accidental de datos.

## Configuracion de scripts en el package.json

En la seccion scripts de package.json agregar las líneas de código siguientes:

```bash
    "migration:run": "cross-env NODE_ENV=development typeorm-ts-node-commonjs -d ./src/config/orm-cli.config.ts migration:run",
    "migration:generate": "cross-env NODE_ENV=development typeorm-ts-node-commonjs -d ./src/config/orm-cli.config.ts migration:generate",
    "migration:create": "cross-env NODE_ENV=development typeorm-ts-node-commonjs migration:create",
    "migration:revert": "cross-env NODE_ENV=development typeorm-ts-node-commonjs -d ./src/config/orm-cli.config.ts migration:revert"
```

## Comandos Principales

Todos los comandos de migración se ejecutan a través de scripts de `npm` definidos en `package.json` y utilizan la configuración específica para la CLI (`src/config/orm-cli.config.ts`).

### 1. Generar una Migración Automáticamente (`migration:generate`)

Este comando compara el estado actual de tus entidades (`src/**/*.entity.ts`) con el esquema de la base de datos (configurada en `orm-cli.config.ts`) y genera automáticamente un archivo de migración con las sentencias SQL necesarias para sincronizarlos.

**Cuándo usar:** Después de modificar tus archivos de entidad (añadir/quitar/modificar entidades, columnas, relaciones).

**Prerrequisitos:**
*   La base de datos de desarrollo debe estar en ejecución.
*   Los cambios en los archivos `.entity.ts` ya deben estar realizados.

**Comando:**

```bash
npm run migration:generate -- <carpeta_donde_se_almancenan_las_migraciones>.<NombreDescriptivoDeLaMigracion>
```

Ejemplo para crear el schema inicial:

```bash
  npm run migration:generate -- ./src/database/migrations/InitialSchema
```


Ejemplo: Si añadiste un campo emailVerified a la entidad User:

```bash
npm run migration:generate -- ./src/database/migrations/AddEmailVerifiedToUser
```

Esto creará un archivo como src/database/migrations/<timestamp>-AddEmailVerifiedToUser.ts.

¡¡MUY IMPORTANTE!!

SIEMPRE REVISA EL ARCHIVO GENERADO antes de ejecutarlo (migration:run). Asegúrate de que el SQL en los métodos up() y down() hace lo que esperas. migration:generate no es perfecto.
Para generar la migración inicial (InitialSchema), asegúrate de que tu base de datos de desarrollo esté limpia (sin tablas) antes de ejecutar el comando:

# (Asegúrate que la BD esté vacía)
```bash
npm run migration:generate -- ./src/database/migrations/InitialSchema
```

2. Crear una Migración Manualmente (migration:create)
Este comando crea un archivo de migración vacío (plantilla) donde puedes escribir manualmente las sentencias SQL o usar el QueryRunner de TypeORM.
Cuándo usar:
Para cambios complejos que generate no maneja bien (ej: renombrar columnas/tablas).
Para ejecutar SQL personalizado (crear índices complejos, funciones, etc.).
Para realizar manipulación de datos (actualizar valores, sembrar datos - seeding).
Comando:

```bash
npm run migration:create -- <NombreDescriptivo>
```

Ejemplo: Para crear una migración para añadir datos iniciales:

```bash
npm run migration:create -- ./src/database/migrations/SeedInitialAdminUser
```

Esto creará src/database/migrations/<timestamp>-SeedInitialAdminUser.ts. Deberás editar este archivo y añadir tu lógica SQL/QueryRunner en los métodos up() y down().
3. Ejecutar Migraciones Pendientes (migration:run)
Aplica todas las migraciones que se han creado/generado pero que aún no se han ejecutado en la base de datos actual. TypeORM lleva un registro de las migraciones aplicadas en una tabla especial (usualmente llamada migrations).
Cuándo usar: Después de generar o crear una nueva migración (y revisarla), o al desplegar una nueva versión de la aplicación en un entorno.
Comando:

```bash
npm run migration:run
```

4. Revertir la Última Migración (migration:revert)
Deshace la última migración que fue aplicada a la base de datos ejecutando el método down() de esa migración.
Cuándo usar: Principalmente durante el desarrollo si necesitas deshacer rápidamente el último cambio aplicado. ¡Úsalo con precaución en entornos compartidos!
Comando:

```bash
npm run migration:revert
```

Nota: Solo revierte la última migración aplicada. Para revertir más, ejecuta el comando múltiples veces.

Ejemplos de Flujos de Trabajo Comunes

A. Añadir una Nueva Columna (isActive a User)
Modifica la entidad: Añade la propiedad y el decorador en src/users/user.entity.ts:

```bash
// ...
@Column({ default: true })
isActive: boolean;
// ...
```

```bash
npm run migration:generate -- ./src/database/migrations/AddIsActiveToUser
```

Revisa el archivo: Abre ...-AddIsActiveToUser.ts y verifica que up() contenga ALTER TABLE "user" ADD COLUMN "isActive" boolean ... y down() contenga ALTER TABLE "user" DROP COLUMN "isActive".

Ejecuta la migración:

```bash
npm run migration:run
```

B. Eliminar una Columna (oldField de Report)
Modifica la entidad: Elimina la propiedad y el decorador @Column() de src/reports/report.entity.ts.
Genera la migración:

```bash
npm run migration:generate -- ./src/database/migrations/RemoveOldFieldFromReport
```

Revisa el archivo: Verifica que up() contenga ALTER TABLE "report" DROP COLUMN "oldField" y down() lo vuelva a añadir. ¡Advertencia! Revertir esto (down()) no recuperará los datos perdidos.

Ejecuta la migración:

```bash
npm run migration:run
```

C. Renombrar una Columna (name a fullName en User)
migration:generate a menudo no detecta renombres (lo ve como borrar name y añadir fullName, perdiendo datos). Es mejor usar migration:create.

Crea la migración:

```bash
npm run migration:create -- ./src/database/migrations/RenameNameToFullNameInUser
```

Edita el archivo ...-RenameNameToFullNameInUser.ts:

```bash
// ... (imports)
public async up(queryRunner: QueryRunner): Promise<void> {
    // SQL específico de PostgreSQL para renombrar
    await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "name" TO "fullName"`);
}

public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "fullName" TO "name"`);
}
// ...
```

Modifica la entidad: Cambia el nombre de la propiedad y/o el decorador @Column() en src/users/user.entity.ts para que coincida (fullName).

Ejecuta la migración:

```bash
npm run migration:run
```

D. Cambiar el Tipo de una Columna (description de varchar a text en Report)
Modifica la entidad: Cambia el tipo en el decorador en src/reports/report.entity.ts:

```bash
@Column({ type: 'text', nullable: true }) // Ejemplo cambiando a text
description: string;
```

Genera la migración:

```bash
npm run migration:generate -- ./src/database/migrations/ChangeReportDescriptionToText
```

Revisa el archivo: Busca sentencias como ALTER TABLE "report" ALTER COLUMN "description" TYPE text. ¡Advertencia! Algunos cambios de tipo pueden requerir cláusulas USING específicas en PostgreSQL (ej: USING description::text) o pueden causar truncamiento de datos. Revisa cuidadosamente el SQL generado.
Ejecuta la migración:

```bash
npm run migration:run
```

Buenas Prácticas y Notas Importantes
Versiona tus Migraciones: Siempre añade y commitea tus archivos de migración (src/database/migrations/*.ts) a tu sistema de control de versiones (Git).
No Modifiques Migraciones Aplicadas: Una vez que una migración ha sido aplicada (especialmente en entornos compartidos o producción), nunca la edites. Si necesitas corregir algo, crea una nueva migración que realice la corrección.
Orden: Las migraciones se ejecutan en orden cronológico basado en el timestamp de su nombre de archivo.
Pruebas: Prueba tus migraciones localmente (run y revert) antes de enviarlas al repositorio o desplegarlas.
Consistencia: Mantén tus entidades y tus migraciones sincronizadas.

```bash

**Cómo usar esta guía:**

1.  Copia todo el contenido dentro del bloque de código Markdown (empezando por `# Gestión de Migraciones...`).
2.  Pégalo en tu archivo `README.md` en la ubicación que consideres más apropiada.
3.  Revisa si las rutas (`src/database/migrations/`, `src/config/orm-cli.config.ts`) coinciden exactamente con tu proyecto. Ajusta si es necesario.

¡Espero que esta guía detallada sea muy útil para ti y tu equipo!
```



 


