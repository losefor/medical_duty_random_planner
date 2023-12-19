export type UserMonthlyDuty = {
  duty: string;
  dom: number;
};

export type User = {
  id: number;
  name: string;
  gender: "MALE" | "FEMALE";
  monthlyEvents: UserMonthlyDuty[];
};
