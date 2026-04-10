-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "username" TEXT,
    "password" TEXT,
    "bio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Pokemon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dexNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "types" TEXT NOT NULL,
    "hp" INTEGER NOT NULL DEFAULT 0,
    "attack" INTEGER NOT NULL DEFAULT 0,
    "defense" INTEGER NOT NULL DEFAULT 0,
    "spAtk" INTEGER NOT NULL DEFAULT 0,
    "spDef" INTEGER NOT NULL DEFAULT 0,
    "speed" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "spriteUrl" TEXT,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "Ability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "PokemonAbility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pokemonId" TEXT NOT NULL,
    "abilityId" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PokemonAbility_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "Pokemon" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PokemonAbility_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "Ability" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT
);

-- CreateTable
CREATE TABLE "TeamBuild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "format" TEXT NOT NULL,
    "archetype" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" TEXT NOT NULL,
    CONSTRAINT "TeamBuild_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slotIndex" INTEGER NOT NULL,
    "teamId" TEXT NOT NULL,
    "pokemonId" TEXT NOT NULL,
    "nickname" TEXT,
    "level" INTEGER NOT NULL DEFAULT 50,
    "itemName" TEXT,
    "nature" TEXT,
    "ability" TEXT,
    "moves" TEXT NOT NULL,
    "evHp" INTEGER NOT NULL DEFAULT 0,
    "evAtk" INTEGER NOT NULL DEFAULT 0,
    "evDef" INTEGER NOT NULL DEFAULT 0,
    "evSpAtk" INTEGER NOT NULL DEFAULT 0,
    "evSpDef" INTEGER NOT NULL DEFAULT 0,
    "evSpeed" INTEGER NOT NULL DEFAULT 0,
    "ivHp" INTEGER NOT NULL DEFAULT 31,
    "ivAtk" INTEGER NOT NULL DEFAULT 31,
    "ivDef" INTEGER NOT NULL DEFAULT 31,
    "ivSpAtk" INTEGER NOT NULL DEFAULT 31,
    "ivSpDef" INTEGER NOT NULL DEFAULT 31,
    "ivSpeed" INTEGER NOT NULL DEFAULT 31,
    "notes" TEXT,
    CONSTRAINT "TeamSlot_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "TeamBuild" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamSlot_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "Pokemon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "TeamBuild" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vote_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "TeamBuild" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PokemonRecommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pokemonId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "itemName" TEXT,
    "nature" TEXT,
    "abilityName" TEXT,
    "moves" TEXT NOT NULL,
    "evHp" INTEGER NOT NULL DEFAULT 0,
    "evAtk" INTEGER NOT NULL DEFAULT 0,
    "evDef" INTEGER NOT NULL DEFAULT 0,
    "evSpAtk" INTEGER NOT NULL DEFAULT 0,
    "evSpDef" INTEGER NOT NULL DEFAULT 0,
    "evSpeed" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "format" TEXT NOT NULL DEFAULT 'Singles',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PokemonRecommendation_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "Pokemon" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PokemonRecommendation_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Pokemon_dexNumber_key" ON "Pokemon"("dexNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Pokemon_name_key" ON "Pokemon"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Ability_name_key" ON "Ability"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Item_name_key" ON "Item"("name");

-- CreateIndex
CREATE INDEX "TeamBuild_format_idx" ON "TeamBuild"("format");

-- CreateIndex
CREATE INDEX "TeamBuild_authorId_idx" ON "TeamBuild"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamSlot_teamId_slotIndex_key" ON "TeamSlot"("teamId", "slotIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_userId_teamId_key" ON "Vote"("userId", "teamId");
