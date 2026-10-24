-- PostgreSQL DDL Schema for ClassUp Database Architecture

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'TEACHER');
CREATE TYPE "CategoryEnum" AS ENUM ('PARENTS', 'STUDENTS', 'ADMINISTRATION');

-- 1. Users Table
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

-- 2. Categories Table
CREATE TABLE "categories" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "slug" VARCHAR(255) NOT NULL UNIQUE,
    "description" TEXT
);

-- 3. Scripts Table
CREATE TABLE "scripts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "situation" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "method_tip" TEXT,
    "category_id" UUID REFERENCES "categories"("id") ON DELETE CASCADE,
    "category_enum" "CategoryEnum" NOT NULL DEFAULT 'PARENTS',
    "author_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Ratings Table
CREATE TABLE "ratings" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "value" INTEGER NOT NULL CHECK ("value" >= 1 AND "value" <= 5),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "script_id" UUID NOT NULL REFERENCES "scripts"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "unique_user_script_rating" UNIQUE ("user_id", "script_id")
);

-- 5. Comments Table
CREATE TABLE "comments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "text" TEXT NOT NULL,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "script_id" UUID NOT NULL REFERENCES "scripts"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Saved Scripts / Bookmarks Table
CREATE TABLE "saved_scripts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "script_id" UUID NOT NULL REFERENCES "scripts"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "unique_user_script_saved" UNIQUE ("user_id", "script_id")
);

-- Indexes for Query Performance
CREATE INDEX "idx_scripts_category_id" ON "scripts"("category_id");
CREATE INDEX "idx_scripts_author_id" ON "scripts"("author_id");
CREATE INDEX "idx_scripts_is_published" ON "scripts"("is_published");

CREATE INDEX "idx_ratings_script_id" ON "ratings"("script_id");
CREATE INDEX "idx_ratings_user_id" ON "ratings"("user_id");

CREATE INDEX "idx_comments_script_id" ON "comments"("script_id");
CREATE INDEX "idx_comments_user_id" ON "comments"("user_id");
CREATE INDEX "idx_comments_created_at" ON "comments"("created_at");

CREATE INDEX "idx_saved_scripts_user_id" ON "saved_scripts"("user_id");
CREATE INDEX "idx_saved_scripts_script_id" ON "saved_scripts"("script_id");
