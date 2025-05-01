import { ColumnType, Generated } from "kysely";

export type Database = {
  user: UserTable;
  friend: FriendTable;
  team: TeamTable;
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

export type TeamTable = {
    teamId: Generated<string>;
    userId: ColumnType<string, string, undefined>;
    name: string;
    characters: string[];
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
