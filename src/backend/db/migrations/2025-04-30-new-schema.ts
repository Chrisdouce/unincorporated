import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // User table
  await db.schema.createTable('User')
    .addColumn('id', 'uuid', col => col.notNull().primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('email', 'varchar', col => col.unique().notNull())
    .addColumn('username', 'varchar', col => col.unique().notNull())
    .addColumn('displayName', 'varchar')
    .addColumn('bio', 'varchar')
    .addColumn('location', 'varchar')
    .addColumn('role', 'varchar') 
    .addColumn('rank', 'varchar')
    .addColumn('img', 'varchar')
    .addColumn('cover', 'varchar')
    .addColumn('reputation', 'integer', col => col.notNull().defaultTo(0))
    .addColumn('lastDailyRewardClaimedAt', 'timestamp')
    .addColumn('claimedTeamReward', 'boolean', col => col.defaultTo(false).notNull())
    .addColumn('createdAt', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('updatedAt', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .execute();

  // Post table
  await db.schema.createTable('Post')
    .addColumn('id', 'uuid', col => col.notNull().primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('createdAt', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('updatedAt', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('desc', 'varchar(255)')
    .addColumn('img', 'text')
    .addColumn('imgHeight', 'integer')
    .addColumn('video', 'text')
    .addColumn('isSensitive', 'boolean', col => col.defaultTo(false).notNull())
    .addColumn('userId', 'uuid', col => col.notNull().references('User.id').onUpdate('cascade').onDelete('cascade'))
    .addColumn('rePostId', 'uuid', col => col.references('Post.id').onUpdate('cascade').onDelete('cascade'))
    .addColumn('parentPostId', 'uuid', col => col.references('Post.id').onUpdate('cascade').onDelete('cascade'))
    .execute();

  // Like table
  await db.schema.createTable('Like')
    .addColumn('id', 'uuid', col => col.notNull().primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('userId', 'uuid', col => col.notNull().references('User.id').onUpdate('cascade').onDelete('cascade'))
    .addColumn('postId', 'uuid', col => col.notNull().references('Post.id').onUpdate('cascade').onDelete('cascade'))
    .execute();
    
  // SavedPosts table
  await db.schema.createTable('SavedPosts')
    .addColumn('id', 'uuid', col => col.notNull().primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('userId', 'uuid', col => col.notNull().references('User.id').onUpdate('cascade').onDelete('cascade'))
    .addColumn('postId', 'uuid', col => col.notNull().references('Post.id').onUpdate('cascade').onDelete('cascade'))
    .execute();

  // Follow table
  await db.schema.createTable('Follow')
    .addColumn('id', 'uuid', col => col.notNull().primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('followerId', 'uuid', col => col.notNull().references('User.id').onUpdate('cascade').onDelete('cascade'))
    .addColumn('followingId', 'uuid', col => col.notNull().references('User.id').onUpdate('cascade').onDelete('cascade'))
    .execute();
  
  // Role Type
  await db.schema.createType('Role')
    .asEnum(['DUELIST', 'VANGUARD', 'STRATEGIST'])
    .execute();

  // Vote Type
  await db.schema
    .createType('VoteType')
    .asEnum(['UPVOTE', 'DOWNVOTE'])
    .execute();

  // Team table
  await db.schema.createTable('Team')
    .addColumn('id', 'uuid', col => col.notNull().primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'text', col => col.notNull().unique())
    .addColumn('leaderId', 'uuid', col => col.notNull().unique().references('User.id').onDelete('cascade'))
    .addColumn('whitelist', 'jsonb', col => col.defaultTo(sql`'[]'::jsonb`).notNull())
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .execute();
 
  // Create index for Team table
  await db.schema
    .createIndex('idx_team_name')
    .on('Team')
    .column('name')
    .execute();
  
  // Team Member table
  await db.schema.createTable('TeamMember')
    .addColumn('id', 'uuid', col => col.notNull().primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('teamId', 'uuid', col => col.notNull().references('Team.id').onUpdate('cascade').onDelete('cascade'))
    .addColumn('userId', 'uuid', col => col.notNull().references('User.id').onUpdate('cascade').onDelete('cascade'))
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('UserUniqueTeamMembership', ['userId'])
    .execute();
  
  // Create index for TeamMember table
  await db.schema
    .createIndex('idx_teammember_teamid')
    .on('TeamMember')
    .column('teamId')
    .execute();

  //Team Invitation table
  await db.schema
    .createTable('TeamInvitation')
    .addColumn('id', 'uuid', col => col.notNull().primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('teamId', 'uuid', col => col.notNull().references('Team.id').onUpdate('cascade').onDelete('cascade'))
    .addColumn('invitedUserId', 'uuid', col => col.notNull().references('User.id').onUpdate('cascade').onDelete('cascade'))
    .addColumn('status', 'text', col => col.defaultTo('PENDING').notNull())
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('unique_invitation', ['teamId', 'invitedUserId'])
    .execute();

  // Create index for TeamInvitation table
  await db.schema
    .createIndex('idx_invite_team')
    .on('TeamInvitation')
    .column('teamId')
    .execute();
  await db.schema
    .createIndex('idx_invite_user')
    .on('TeamInvitation')
    .column('invitedUserId')
    .execute();
  
  // Reputation Vote table
  await db.schema
    .createTable('ReputationVote')
    .addColumn('id', 'uuid', col => col.notNull().primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('voterId', 'uuid', col => col.notNull().references('User.id').onUpdate('cascade').onDelete('cascade'))
    .addColumn('targetUserId', 'uuid', col => col.notNull().references('User.id').onUpdate('cascade').onDelete('cascade'))
    .addColumn('voteType', 'text', col => col.notNull())
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('unique_vote', ['voterId', 'targetUserId'])
    .execute();
  
  // Create index for ReputationVote table
  await db.schema
    .createIndex('idx_vote_voter')
    .on('ReputationVote')
    .column('voterId')
    .execute();
  await db.schema
    .createIndex('idx_vote_target')
    .on('ReputationVote')
    .column('targetUserId')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('ReputationVote').execute();
  await db.schema.dropTable('TeamInvitation').execute();
  await db.schema.dropTable('TeamMember').execute();
  await db.schema.dropTable('Team').execute();
  await db.schema.dropType('VoteType').execute();
  await db.schema.dropType('Role').execute();
  await db.schema.dropTable('Follow').execute();
  await db.schema.dropTable('SavedPosts').execute();
  await db.schema.dropTable('Like').execute();
  await db.schema.dropTable('Post').execute();
  await db.schema.dropTable('User').execute();
}
