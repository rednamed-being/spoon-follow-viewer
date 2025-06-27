export interface SpoonUser {
  id: number;
  nickname: string;
  tag: string;
  top_impressions: any[];
  description: string;
  profile_url: string;
  gender: number;
  follow_status: number;
  follower_count: number;
  following_count: number;
  is_active: boolean;
  is_staff: boolean;
  is_vip: boolean;
  date_joined: string;
  current_live: any;
  country: string;
  is_verified: boolean;
}

export interface UserData {
  id: string;
  nickname: string;
  tag: string;
  profile_url: string | null;
}

export interface FollowData {
  followers: SpoonUser[];
  followings: SpoonUser[];
  mutualFollows: SpoonUser[];
}

export interface SpoonApiResponse {
  status_code: number;
  detail: string;
  next: string;
  previous: string;
  results: SpoonUser[];
}
