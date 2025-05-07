import { ColumnType, Generated } from "kysely";

export type Database = {
  user: UserTable;
  friend: FriendTable;
  group: GroupTable;
  post: PostTable;
  reaction: ReactionTable;
  settings: SettingsTable;
};

export type UserTable = {
  userId: Generated<string>;
  username: string;
  hashedPassword: string;
  createdAt: Date;
  updatedAt: Date;
  groupId: string | null;
};

export type SettingsTable = {
  userId: ColumnType<string, string, undefined>;
  darkMode: boolean;
  ign: string;
  minecraftUUID: string | null;
};

export type FriendTable = {
  friendAId: ColumnType<string, string, undefined>;
  friendBId: ColumnType<string, string, undefined>;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export type GroupTable = {
    groupId: Generated<string>;
    leaderId: ColumnType<string, string, undefined>;
    name: string;
    size: number;
    description: string;
    type: string;
    size: number;
    capacity: number;
    createdAt: Date;
    updatedAt: Date;
}

export type PostTable = {
    postId: Generated<string>;
    ownerId: ColumnType<string, string, undefined>;
    parentId: ColumnType<string, string, undefined>;
    title: string | null;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export type ReactionTable = {
    postId: ColumnType<string, string, undefined>;
    userId: ColumnType<string, string, undefined>;
    type: string;
}
