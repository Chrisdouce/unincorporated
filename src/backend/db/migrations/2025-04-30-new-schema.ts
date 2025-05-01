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
    .addColumn('createdAt', 'datetime', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('updatedAt', 'datetime', col => col.notNull().defaultTo(sql`now()`));

  // Post table
  await db.schema.createTable('Post')
    .addColumn('id', 'uuid', col => col.notNull().primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('createdAt', 'datetime', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('updatedAt', 'datetime', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('desc', 'varchar(255)')
    .addColumn('img', 'text')
    .addColumn('imgHeight', 'integer')
    .addColumn('video', 'text')
    .addColumn('isSensitive', 'boolean', col => col.defaultTo(false).notNull())
    .addColumn('userId', 'text', col => col.notNull().references('User.id'))
    .addColumn('rePostId', 'integer')
    .addColumn('parentPostId', 'integer')
    .addForeignKeyConstraint('fk_repost', ['rePostId'], 'Post', ['id'])
    .addForeignKeyConstraint('fk_parentPost', ['parentPostId'], 'Post', ['id'])
    .execute();

  // Like table
  await db.schema.createTable('Like')
    .addColumn('id', 'serial', col => col.notNull().primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('userId', 'text', col => col.notNull().references('User.id'))
    .addColumn('postId', 'integer', col => col.notNull().references('Post.id'))
    .execute();
    
  // SavedPosts table
  await db.schema.createTable('SavedPosts')
    .addColumn('id', 'uuid', col => col.notNull().autoIncrement().primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('userId', 'text', col => col.notNull().references('User.id'))
    .addColumn('postId', 'integer', col => col.notNull().references('Post.id'))
    .execute();

  // Follow table
  await db.schema.createTable('Follow')
    .addColumn('id', 'uuid', col => col.notNull().autoIncrement().primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('followerId', 'text', col => col.notNull().references('User.id'))
    .addColumn('followingId', 'text', col => col.notNull().references('User.id'))
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
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('name', 'text', col => col.notNull().unique())
    .addColumn('leaderId', 'text', col => col.notNull().unique().references('User.id').onDelete('cascade'))
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
  await db.schema
    .createTable('TeamMember')
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('teamId', 'text', col => col.notNull().references('Team.id').onDelete('cascade'))
    .addColumn('userId', 'text', col => col.notNull().references('User.id').onDelete('cascade'))
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
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('teamId', 'text', col => col.notNull().references('Team.id').onDelete('cascade'))
    .addColumn('invitedUserId', 'text', col => col.notNull().references('User.id').onDelete('cascade'))
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
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('voterId', 'text', col => col.notNull().references('User.id').onDelete('cascade'))
    .addColumn('targetUserId', 'text', col => col.notNull().references('User.id').onDelete('cascade'))
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
