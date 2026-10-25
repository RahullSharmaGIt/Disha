-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'CONTRIBUTOR', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "AcademicStream" AS ENUM ('SCIENCE', 'COMMERCE', 'ARTS', 'UNDECIDED');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('COURSE', 'BOOK', 'VIDEO', 'ARTICLE', 'TOOL', 'WEBSITE');

-- CreateEnum
CREATE TYPE "ResourceCost" AS ENUM ('FREE', 'PAID', 'FREEMIUM');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_SELECT', 'MULTI_SELECT', 'SCALE');

-- CreateEnum
CREATE TYPE "SubmissionEntityType" AS ENUM ('CAREER', 'RESOURCE');

-- CreateEnum
CREATE TYPE "SubmissionAction" AS ENUM ('CREATE', 'UPDATE');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "hashedPassword" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "currentClass" TEXT,
    "stream" "AcademicStream",
    "parentEmail" TEXT,
    "parentConsentVerified" BOOLEAN NOT NULL DEFAULT false,
    "parentConsentToken" TEXT,
    "parentConsentSentAt" TIMESTAMP(3),
    "contributorInvitedAt" TIMESTAMP(3),
    "contributorBio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "CareerCluster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerCluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Career" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prerequisites" JSONB NOT NULL,
    "eligibleStreams" "AcademicStream"[],
    "averageDuration" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "riasecRealistic" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riasecInvestigative" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riasecArtistic" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riasecSocial" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riasecEnterprising" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riasecConventional" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "authorId" TEXT,
    "reviewerId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Career_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerResource" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "cost" "ResourceCost" NOT NULL,
    "platform" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizVersion" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "options" JSONB NOT NULL,
    "riasecWeights" JSONB NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "responses" JSONB NOT NULL,
    "riasecScore" JSONB,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "quizResponseId" TEXT NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL,
    "reasoning" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentSubmission" (
    "id" TEXT NOT NULL,
    "submitterId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "entityType" "SubmissionEntityType" NOT NULL,
    "entityId" TEXT,
    "action" "SubmissionAction" NOT NULL,
    "submittedData" JSONB NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNotes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ContentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_parentConsentToken_key" ON "User"("parentConsentToken");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "CareerCluster_name_key" ON "CareerCluster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CareerCluster_slug_key" ON "CareerCluster"("slug");

-- CreateIndex
CREATE INDEX "CareerCluster_slug_idx" ON "CareerCluster"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Career_slug_key" ON "Career"("slug");

-- CreateIndex
CREATE INDEX "Career_slug_idx" ON "Career"("slug");

-- CreateIndex
CREATE INDEX "Career_clusterId_idx" ON "Career"("clusterId");

-- CreateIndex
CREATE INDEX "Career_status_idx" ON "Career"("status");

-- CreateIndex
CREATE INDEX "CareerResource_careerId_idx" ON "CareerResource"("careerId");

-- CreateIndex
CREATE INDEX "CareerResource_status_idx" ON "CareerResource"("status");

-- CreateIndex
CREATE UNIQUE INDEX "QuizVersion_version_key" ON "QuizVersion"("version");

-- CreateIndex
CREATE INDEX "QuizVersion_isActive_idx" ON "QuizVersion"("isActive");

-- CreateIndex
CREATE INDEX "QuizQuestion_versionId_idx" ON "QuizQuestion"("versionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizQuestion_versionId_orderIndex_key" ON "QuizQuestion"("versionId", "orderIndex");

-- CreateIndex
CREATE INDEX "QuizResponse_userId_idx" ON "QuizResponse"("userId");

-- CreateIndex
CREATE INDEX "QuizResponse_versionId_idx" ON "QuizResponse"("versionId");

-- CreateIndex
CREATE INDEX "Recommendation_userId_idx" ON "Recommendation"("userId");

-- CreateIndex
CREATE INDEX "Recommendation_quizResponseId_idx" ON "Recommendation"("quizResponseId");

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_userId_careerId_quizResponseId_key" ON "Recommendation"("userId", "careerId", "quizResponseId");

-- CreateIndex
CREATE INDEX "ContentSubmission_submitterId_idx" ON "ContentSubmission"("submitterId");

-- CreateIndex
CREATE INDEX "ContentSubmission_status_idx" ON "ContentSubmission"("status");

-- CreateIndex
CREATE INDEX "ContentSubmission_entityType_status_idx" ON "ContentSubmission"("entityType", "status");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Career" ADD CONSTRAINT "Career_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "CareerCluster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Career" ADD CONSTRAINT "Career_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Career" ADD CONSTRAINT "Career_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerResource" ADD CONSTRAINT "CareerResource_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerResource" ADD CONSTRAINT "CareerResource_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "QuizVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResponse" ADD CONSTRAINT "QuizResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResponse" ADD CONSTRAINT "QuizResponse_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "QuizVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_quizResponseId_fkey" FOREIGN KEY ("quizResponseId") REFERENCES "QuizResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentSubmission" ADD CONSTRAINT "ContentSubmission_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentSubmission" ADD CONSTRAINT "ContentSubmission_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
