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
  time: string; // ISO 8601 형식의 날짜 및 시간 문자열
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
    image_url: string;
    dates: string[];
    location: string;
    univ_group_and_grade: TUnivGroup[];
    schedule: TSchedule[];
    payment: TPayment;
  };
};
