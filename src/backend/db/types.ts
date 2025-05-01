import { ColumnType, Generated } from "kysely";

export type Database = {
  user: UserTable;
  post: PostTable;
  like: LikeTable;
  savedPosts: SavedPostsTable;
  follow: FollowTable;
  team: TeamTable;
  teamMember: TeamMemberTable;
  teamInvitation: TeamInvitationTable;
  reputationVote: ReputationVoteTable;
};

export type UserTable = {
  id: string; // UUID
  email: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  location: string | null;
  role: string; // ENUM 
  rank: string | null;
  img: string | null;
  cover: string | null;
  reputation: number;
  lastDailyRewardClaimedAt: Date | null;
  claimedTeamReward: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PostTable = {
  id: string; // UUID
  createdAt: Date;
  updatedAt: Date;
  desc: string | null;
  img: string | null;
  imgHeight: number | null;
  video: string | null;
  isSensitive: boolean;
  userId: ColumnType<string, string, undefined>; // UUID
  rePostId: ColumnType<string, string, undefined>; // UUID
  parentPostId: ColumnType<string, string, undefined>; // UUID
};

export type LikeTable = {
  id: string; // UUID
  createdAt: Date;
  userId: ColumnType<string, string, undefined>; // UUID
  postId: ColumnType<string, string, undefined>; // UUID
};

export type SavedPostsTable = {
  id: string; // UUID
  createdAt: Date;
  userId: ColumnType<string, string, undefined>; // UUID
  postId: ColumnType<string, string, undefined>; // UUID
};

export type FollowTable = {
  id: string; // UUID
  createdAt: Date;
  followerId: ColumnType<string, string, undefined>; // UUID
  followingId: ColumnType<string, string, undefined>; // UUID
};

export type TeamTable = {
  id: string; // UUID
  name: string;
  description: string | null;
  img: string | null;
  cover: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TeamMemberTable = {
  id: string; // UUID
  userId: ColumnType<string, string, undefined>; // UUID
  teamId: ColumnType<string, string, undefined>; // UUID
  role: string; // ENUM 
  createdAt: Date;
  updatedAt: Date;
};

export type TeamInvitationTable = {
  id: string; // UUID
  teamId: ColumnType<string, string, undefined>; // UUID
  email: string;
  status: string; // ENUM 
  createdAt: Date;
  updatedAt: Date;
};

export type ReputationVoteTable = {
  id: string; // UUID
  userId: ColumnType<string, string, undefined>; // UUID
  postId: ColumnType<string, string, undefined>; // UUID
  voteType: string; // ENUM 
  createdAt: Date;
};

