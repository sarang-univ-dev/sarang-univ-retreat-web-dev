// #region Common Types
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

// #endregion

// #region Table Types
export type TUnivGroup = {
  id: number;
  name: string;
  number: number;
  createdAt: Date;
};

export type TGrade = {
  id: number;
  univGroupId: number;
  name: string;
  number: number;
  isActive: boolean;
  createdAt: Date;
};

export type TUserProfile = {
  id: number;
  name: string;
  phoneNumber: string;
  gender: Gender;
  gradeId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type TRetreat = {
  id: number;
  slug: string;
  name: string;
  location: string;
  mainVerse: string;
  mainSpeaker: string;
  memo?: string;
  poster_url?: string;
  qrMetadata?: { width: number; height: number; x: number; y: number };
  createdAt: Date;
  updatedAt: Date;
};

export type TRetreatUnivGroup = {
  retreatId: number;
  univGroupId: number;
  information?: JSONValue;
  createdAt: Date;
};

export type TRetreatPaymentSchedule = {
  id: number;
  retreatId: number;
  totalPrice: number;
  partialPricePerSchedule: number;
  startAt: Date;
  endAt: Date;
  createdAt: Date;
};

export type TRetreatRegistrationSchedule = {
  id: number;
  retreatId: number;
  time: Date;
  type: RetreatRegistrationScheduleType;
  createdAt: Date;
};

export type TUserRetreatRegistration = {
  id: number;
  retreatId: number;
  userId: number;
  userType?: UserRetreatRegistrationType;
  price: number;
  paymentStatus: UserRetreatRegistrationPaymentStatus;
  paymentConfirmedUserId?: number;
  paymentConfirmedAt?: Date;
  currentLeaderName: string;
  qrUrl?: string;
  attendedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type TUserRetreatRegistrationSchedule = {
  id: number;
  userRetreatRegistrationId: number;
  retreatRegistrationScheduleId: number;
  confirmedAt?: Date;
  confirmedUserId?: number;
  createdAt: Date;
  deletedAt?: Date;
};

export type TUserRetreatRegistrationScheduleHistory = {
  id: number;
  userRetreatRegistrationId: number;
  beforeScheduleIds: number[];
  beforePrice: number;
  afterScheduleIds: number[];
  afterPrice: number;
  createdUserId: number;
  createdAt: Date;
  resolvedUserId?: number;
  resolvedAt?: Date;
};

export type TUserRetreatRegistrationHistoryMemo = {
  id: number;
  userRetreatRegistrationId: number;
  memoType: UserRetreatRegistrationHistoryMemoType;
  issuerId: number;
  accountReviewerId?: number;
  lineupReviewerId?: number;
  dormitoryReviewerId?: number;
  memo: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TUserRetreatRole = {
  id: number;
  userId: number;
  email: string;
  retreatId: number;
  role: UserRole;
  createdAt: Date;
};
// #endregion

// #region Server Types
export type UserInfo = {
  userId: number;
  name: string;
  phoneNumber: string;
  gender: Gender;
  gradeNumber: number;
  univGroupNumber: number;
};

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE"
}

export enum UserRetreatRegistrationType {
  NEW_COMER = "NEW_COMER",
  STAFF = "STAFF",
  SOLDIER = "SOLDIER"
}

export enum RetreatRegistrationScheduleType {
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH",
  DINNER = "DINNER",
  SLEEP = "SLEEP"
}

export enum UserRetreatRegistrationPaymentStatus {
  NEW_COMER_REQUEST = "NEW_COMER_REQUEST",
  SOLDIER_REQUEST = "SOLDIER_REQUEST",
  PENDING = "PENDING",
  PAID = "PAID",
  REFUND_REQUEST = "REFUND_REQUEST",
  REFUNDED = "REFUNDED"
}

export enum UserRetreatRegistrationHistoryMemoType {
  UNIV_GROUP_STAFF = "UNIV_GROUP_STAFF",
  DORMITORY_TEAM_MEMBER = "DORMITORY_TEAM_MEMBER",
  ACCOUNT_STAFF = "ACCOUNT_STAFF",
  LINEUP_STAFF = "LINEUP_STAFF",
  DORMITORY_STAFF = "DORMITORY_STAFF"
}

export enum UserRole {
  UNIV_GROUP_ADMIN_STAFF = "UNIV_GROUP_ADMIN_STAFF",
  UNIV_GROUP_ACCOUNT_MEMBER = "UNIV_GROUP_ACCOUNT_MEMBER",
  ACCOUNT_STAFF = "ACCOUNT_STAFF",
  UNIV_GROUP_LINEUP_MEMBER = "UNIV_GROUP_LINEUP_MEMBER",
  LINEUP_STAFF = "LINEUP_STAFF",
  UNIV_GROUP_DORMITORY_MEMBER = "UNIV_GROUP_DORMITORY_MEMBER",
  DORMITORY_STAFF = "DORMITORY_STAFF"
}

// #endregion

export type RetreatInfo = {
  retreat: TRetreat;
  univGroupAndGrade: {
    univGroupId: number;
    univGroupName: string;
    univGroupNumber: number;
    grades: Pick<TGrade, "id" | "name" | "number">[];
  }[];
  schedule: TRetreatRegistrationSchedule[];
  payment: TRetreatPaymentSchedule[];
};
