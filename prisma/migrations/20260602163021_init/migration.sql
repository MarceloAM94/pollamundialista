-- CreateEnum
CREATE TYPE "EstadoPartido" AS ENUM ('PROGRAMADO', 'BLOQUEADO', 'EN_VIVO', 'FINALIZADO', 'PROCESADO');

-- CreateEnum
CREATE TYPE "EstadoSistema" AS ENUM ('PRE_TORNEO', 'FASE_GRUPOS_ABIERTA', 'TRANSICION', 'FASE_MATAMATA_ABIERTA', 'TORNEO_FINALIZADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partido" (
    "id" SERIAL NOT NULL,
    "fase" INTEGER NOT NULL,
    "ronda" TEXT NOT NULL,
    "grupo" TEXT,
    "equipoLocal" TEXT NOT NULL,
    "equipoVisita" TEXT NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL,
    "estadio" TEXT,
    "estado" "EstadoPartido" NOT NULL DEFAULT 'PROGRAMADO',
    "golesLocalReal" INTEGER,
    "golesVisitaReal" INTEGER,

    CONSTRAINT "Partido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pronostico" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "partidoId" INTEGER NOT NULL,
    "golesLocal" INTEGER,
    "golesVisita" INTEGER,
    "puntos" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pronostico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracion" (
    "id" SERIAL NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Pronostico_usuarioId_partidoId_key" ON "Pronostico"("usuarioId", "partidoId");

-- CreateIndex
CREATE UNIQUE INDEX "Configuracion_clave_key" ON "Configuracion"("clave");

-- AddForeignKey
ALTER TABLE "Pronostico" ADD CONSTRAINT "Pronostico_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pronostico" ADD CONSTRAINT "Pronostico_partidoId_fkey" FOREIGN KEY ("partidoId") REFERENCES "Partido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
