import { ColumnType, Generated } from "kysely";

export type Database = {
  user: UserTable;
  friend: FriendTable;
  group: GroupTable;
  post: PostTable;
  reaction: ReactionTable;
};

export type UserTable = {
  userId: Generated<string>;
  username: string;
  hashedPassword: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FriendTable = {
  friendAId: ColumnType<string, string, undefined>;
  friendBId: ColumnType<string, string, undefined>;
  createdAt: Date;
}

export type GroupTable = {
    groupId: Generated<string>;
    leaderId: ColumnType<string, string, undefined>;
    name: string;
    type: string;
    createdAt: Date;
    updatedAt: Date;
}

export type PostTable = {
    postId: Generated<string>;
    ownerId: ColumnType<string, string, undefined>;
    parentId: ColumnType<string, string, undefined>;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export type ReactionTable = {
    postId: ColumnType<string, string, undefined>;
    userId: ColumnType<string, string, undefined>;
    type: string;
}
