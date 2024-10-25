export type TUser = {
  id: number;
  name: string;
  phone_number: string;
  grade: number;
  univ_group: number;
};

export type TRetreat = {
  id: number;
  name: string;
  location: string;
  main_verse: string;
  main_speaker: string;
  memo?: string;
};

export type TGrade = {
  grade_id: number;
  grade_name: string;
  grade_number: number;
};

export type TUnivGroup = {
  univ_group_id: number;
  univ_group_name: string;
  univ_group_number: number;
  grades: TGrade[];
};

export type TSchedule = {
  id: number;
  date: Date;
  type: string;
};

export type TPayment = {
  total_price: number;
  partial_price_per_event: number;
};

export type TRetreatInfo = {
  retreat: {
    id: number;
    name: string;
    dates: string[];
    location: string;
    main_verse: string;
    main_speaker: string;
    memo?: string;
    univ_group_and_grade: TUnivGroup[];
    schedule: TSchedule[];
    payment: TPayment;
  };
};
