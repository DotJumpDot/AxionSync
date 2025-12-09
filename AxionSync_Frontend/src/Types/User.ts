type User = {
  id: number;
  username: string;
  firstname: string | null;
  lastname: string | null;
  nickname: string | null;
  role: string;
  tel: string | null;
  picture_url: string;
};

type UserUpdate = {
  firstname?: string | null;
  lastname?: string | null;
  nickname?: string | null;
  tel?: string | null;
};

type UserPictureResponse = {
  success: boolean;
  picture_url: string;
  user: User;
};

export type { User, UserUpdate, UserPictureResponse };
