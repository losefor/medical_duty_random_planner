import {
  Category,
  CategoryNames as CategoryName,
  extractCategoryScoreMap,
} from "./category";
import {
  getDaysInMonth,
  getRandomMapEntry,
  randNumsUniqueToMax,
} from "./utils";

import { users } from "./users";

const categories: Category[] = [
  {
    name: CategoryName.Emergency,
    sub: [
      {
        name: CategoryName.Night,
        sub: [
          { name: CategoryName.Surgical_MH, score: 1 },
          { name: CategoryName.Medical_MH, score: 1 },
          { name: CategoryName.Triage, score: 2 },
        ],
      },
      {
        name: CategoryName.Pre_Night,
        sub: [
          { name: CategoryName.Surgical_MH, score: 1 },
          { name: CategoryName.Medical_MH, score: 2 },
          { name: CategoryName.Triage, score: 3 },
        ],
      },
      {
        name: CategoryName.Morning,
        sub: [
          { name: CategoryName.Surgical_MH, score: 1 },
          { name: CategoryName.Medical_MH, score: 1 },
          { name: CategoryName.Triage, score: 2 },
        ],
      },
    ],
  },
  {
    name: CategoryName.Referrals,
    sub: [
      { name: CategoryName.Morning, score: 1 },
      { name: CategoryName.Night, score: 1 },
    ],
  },
  {
    name: CategoryName.Medicine,
    sub: [
      { name: CategoryName.Unit_1, score: 2 },
      { name: CategoryName.Unit_2, score: 2 },
      { name: CategoryName.Unit_3, score: 2 },
      { name: CategoryName.Unit_4, score: 2 },
      { name: CategoryName.Unit_5, score: 2 },
    ],
  },
  {
    name: CategoryName.Hematology,
    sub: [
      { name: CategoryName.Males_Ward, score: 1 },
      { name: CategoryName.Females_Ward, score: 1 },
    ],
  },
  {
    name: CategoryName.General_Surgery,
    sub: [
      { name: CategoryName.Floor_2, score: 1 },
      { name: CategoryName.Floor_3, score: 1 },
      { name: CategoryName.Floor_5, score: 1 },
    ],
  },
  {
    name: CategoryName.OB_GYN,
    sub: [
      { name: CategoryName.Delivery_Room, score: 1 },
      { name: CategoryName.OB_War, score: 1 },
    ],
  },
];

// get the "leaf" categories into a map of <string_path_to leaf, leaf_score>
const scorePerCategory = extractCategoryScoreMap(categories);

// do the calculations
users.forEach((user) => {
  let duties: string[] = [];
  const scoreTarget = user.gender === "MALE" ? 22 : 21;

  // calculate base user score
  let totalScore = user.monthlyEvents.reduce((acc, curr, i) => {
    // duties.push(curr.duty)
    return acc + (scorePerCategory.get(curr.duty) ?? 0);
  }, 0);

  // a user comes in w a base score already greater than their scoreTarget
  if (totalScore > scoreTarget) {
    // TODO: handle faulty users
  }

  // add up user scores to the users scoreTarget
  while (totalScore < scoreTarget) {
    let entry = getRandomMapEntry(scorePerCategory);

    if (entry) {
      const [duty, score] = entry;

      // Add gender check
      let isNight = duty.split(":").includes("Night");
      while (isNight && user.gender === "FEMALE") {
        entry = getRandomMapEntry(scorePerCategory);
        if (!entry) continue;
        const [duty] = entry;
        isNight = duty.split(":").includes("Night");
      }

      if (totalScore + score <= scoreTarget) {
        duties.push(duty);
        totalScore += score;
      }
    }
  }

  const dutyDays = randNumsUniqueToMax(
    getDaysInMonth(2023, 2),
    user.monthlyEvents.map((duty) => duty.dom),
    duties.length
  );
  const generatedMonthlyDuties = duties.map((duty, i) => {
    return { duty: duty, dom: dutyDays[i] + 1 };
  });

  console.log(user.name, ":", totalScore, ":", user.gender);

  console.log(generatedMonthlyDuties);
});
