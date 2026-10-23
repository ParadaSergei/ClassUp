-- PostgreSQL DDL Schema for ClassUp Database Architecture

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "Category" AS ENUM ('PARENTS', 'STUDENTS', 'ADMINISTRATION');

-- Users Table
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Scripts Table
CREATE TABLE "scripts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "author_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ratings Table
CREATE TABLE "ratings" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "value" INTEGER NOT NULL CHECK ("value" >= 1 AND "value" <= 5),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "script_id" UUID NOT NULL REFERENCES "scripts"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "unique_user_script_rating" UNIQUE ("user_id", "script_id")
);

-- Comments Table
CREATE TABLE "comments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "text" TEXT NOT NULL,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "script_id" UUID NOT NULL REFERENCES "scripts"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Query Performance
CREATE INDEX "idx_scripts_category" ON "scripts"("category");
CREATE INDEX "idx_scripts_author_id" ON "scripts"("author_id");
CREATE INDEX "idx_scripts_is_published" ON "scripts"("is_published");

CREATE INDEX "idx_ratings_script_id" ON "ratings"("script_id");
CREATE INDEX "idx_ratings_user_id" ON "ratings"("user_id");

CREATE INDEX "idx_comments_script_id" ON "comments"("script_id");
CREATE INDEX "idx_comments_user_id" ON "comments"("user_id");
CREATE INDEX "idx_comments_created_at" ON "comments"("created_at");
