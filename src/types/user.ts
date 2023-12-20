export type UserMonthlyDuty = {
  event: string;
  dom: number;
};

export type User = {
  id: number;
  name: string;
  gender: "MALE" | "FEMALE";
  monthlyEvents: UserMonthlyDuty[];
};
