/** search/gym API 응답 한 건 및 중첩 객체 (fetchGymList) */

export type GymCoverImage = {
  id: number;
  url: string;
  order: number;
};

export type GymListUser = {
  id: number;
  name: string;
  profile_image: string;
  bank_type: number | null;
};

export type GymOperatingTime = {
  weekday_start_time: string;
  weekday_end_time: string;
  sat_start_time: string;
  sat_end_time: string;
  sun_start_time: string;
  sun_end_time: string;
  holiday: string;
  extra: string;
  weekday_expose: boolean;
  sat_expose: boolean;
  sun_expose: boolean;
};

export type GymInformation = {
  parkable: boolean;
  is_parking_free: boolean;
  free_parking_time: number | null;
  charge_parking_time: number | null;
  charge_parking_price: number | null;
  parking_extra: string;
  cloth_able: boolean;
  is_cloth_free: boolean;
  charge_cloth_time: number | null;
  charge_cloth_price: number | null;
  cloth_extra: string;
  lockable: boolean;
  is_locker_free: boolean;
  charge_locker_time: number | null;
  charge_locker_price: number | null;
  locker_extra: string;
  extra: string;
};

export type WoondocPriceEntry = {
  price: number;
  times: number;
  type: number;
};

export type GymPriceTable = {
  gym_prices: WoondocPriceEntry[];
  order: number;
  title: string;
};

export type GymPriceInfo = {
  day_price: number;
  extra1: string;
  extra2: string;
  extra3: string;
  gym_price_tables: GymPriceTable[];
  one_day: boolean;
};

export type CoachCoverImage = {
  id: number;
  order: number;
  url: string;
};

export type CoachGymSummary = {
  id: number;
  name: string;
  for_women: boolean;
  short_addr: string;
  walk_distance: string;
  profile_image: string;
  lat: string;
  lng: string;
};

export type CoachPriceTable = {
  coach_prices: WoondocPriceEntry[];
  order: number;
  title: string;
};

export type CoachPriceInfo = {
  coach_price_tables: CoachPriceTable[];
  extra: string;
  free_ot_available: number;
  include_gym_voucher: number;
  running_time: number;
};

export type CoachWoondocPrice = {
  content: string;
};

export type CoachReviewImage = {
  id: number;
  order: number;
  url: string;
};

export type CoachReviewUser = {
  id: number;
  name: string;
  profile_image: string;
  bank_type: number | null;
};

export type GymSearchCoachReview = {
  id: number;
  review_images: CoachReviewImage[];
  coach: number;
  coach_name: string;
  content: string;
  user: CoachReviewUser;
  comment: string | null;
  profile_image: string;
  rating: number;
  type: number;
  image_visible: boolean;
  date_add: string;
  gym_name: string;
};

export type CoachLessonInfo = {
  is_active: boolean;
  price: number;
};

export type GymSearchCoach = {
  id: number;
  name: string;
  nick: string;
  profile_image: string;
  phone_number: string;
  sex: number;
  status: number;
  for_women: boolean;
  is_new: boolean;
  lesson_type: number;
  lesson: CoachLessonInfo | null;
  one_line: string;
  consulting_msg: string;
  specialities: string[];
  calorie: number;
  review_calorie: number;
  review_cnt: number;
  rating: string;
  user_id: number;
  cover_images: CoachCoverImage[];
  gym: CoachGymSummary;
  coach_price_info: CoachPriceInfo;
  coach_woondoc_price: CoachWoondocPrice | null;
  reviews: GymSearchCoachReview[];
};

export type GymSearchResult = {
  id: number;
  name: string;
  for_women: boolean;
  gym_price_info: GymPriceInfo | null;
  gym_type: number;
  calorie: number;
  profile_image: string | null;
  short_addr: string;
  lat: string;
  lng: string;
  phone_number: string;
  safe_number: string;
  gym_cover_images: GymCoverImage[];
  user: GymListUser;
  gym_operating_time: GymOperatingTime;
  address: string;
  walk_distance: string;
  gym_information: GymInformation;
  num_of_coach: number;
  coaches: GymSearchCoach[];
};

export type GymListResponse = GymSearchResult[];

/** GymList 화면: 필터 가공 후 `gym_price_info`(부분 필드 + 회원권 정렬 배열) */
export type GymListRowPriceInfo = Partial<GymPriceInfo> & {
  sortedGymPrices?: WoondocPriceEntry[];
};

export type GymListRowData = Omit<GymSearchResult, 'gym_price_info'> & {
  gym_price_info: GymListRowPriceInfo | null;
};

/** 홈 등에서 cover URL로 `profile_image`를 보정한 한 행 */
export type GymSearchListRow = Omit<GymSearchResult, 'profile_image'> & {
  profile_image: string | undefined;
};
