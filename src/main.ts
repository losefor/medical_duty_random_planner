import { Category, CategoryNames as CategoryName } from "./category";
import { getDaysInMonth, getRandomEvent, randNumsUniqueToMax } from "./utils";

import { users } from "./users";
import { User } from "./types/user";

const categories: Category[] = [
  {
    name: CategoryName.Emergency,
    sub: [
      {
        name: CategoryName.Night,
        sub: [
          {
            name: CategoryName.Surgical_MH,
            uniqueName: "Emergency:Night:Surgical_MH",
            score: 1,
            nofPeoplePerDay: 1,
          },
          {
            name: CategoryName.Medical_MH,
            uniqueName: "Emergency:Night:Medical_MH",
            score: 1,
            nofPeoplePerDay: 1,
          },
          {
            name: CategoryName.Triage,
            uniqueName: "Emergency:Night:Triage",
            score: 2,
            nofPeoplePerDay: 2,
          },
        ],
      },
      {
        name: CategoryName.Pre_Night,
        sub: [
          {
            name: CategoryName.Surgical_MH,
            uniqueName: "Emergency:Pre_Night:Surgical_MH",
            score: 1,
            nofPeoplePerDay: 1,
          },
          {
            name: CategoryName.Medical_MH,
            uniqueName: "Emergency:Pre_Night:Medical_MH",
            score: 2,
            nofPeoplePerDay: 2,
          },
          {
            name: CategoryName.Triage,
            uniqueName: "Emergency:Pre_Night:Triage",
            score: 3,
            nofPeoplePerDay: 3,
          },
        ],
      },
      {
        name: CategoryName.Morning,
        sub: [
          {
            name: CategoryName.Surgical_MH,
            uniqueName: "Emergency:Morning:Surgical_MH",
            score: 1,
            nofPeoplePerDay: 1,
          },
          {
            name: CategoryName.Medical_MH,
            uniqueName: "Emergency:Morning:Medical_MH",
            score: 1,
            nofPeoplePerDay: 1,
          },
          {
            name: CategoryName.Triage,
            uniqueName: "Emergency:Morning:Triage",
            score: 2,
            nofPeoplePerDay: 2,
          },
        ],
      },
    ],
  },
  {
    name: CategoryName.Referrals,
    sub: [
      {
        name: CategoryName.Morning,
        uniqueName: "Referrals:Morning",
        score: 1,
        nofPeoplePerDay: 1,
      },
      {
        name: CategoryName.Night,
        uniqueName: "Referrals:Night",
        score: 1,
        nofPeoplePerDay: 1,
      },
    ],
  },
  {
    name: CategoryName.Medicine,
    sub: [
      {
        name: CategoryName.Unit_1,
        uniqueName: "Medicine:Unit_1",
        score: 2,
        nofPeoplePerDay: 1,
      },
      {
        name: CategoryName.Unit_2,
        uniqueName: "Medicine:Unit_2",
        score: 2,
        nofPeoplePerDay: 1,
      },
      {
        name: CategoryName.Unit_3,
        uniqueName: "Medicine:Unit_3",
        score: 2,
        nofPeoplePerDay: 1,
      },
      {
        name: CategoryName.Unit_4,
        uniqueName: "Medicine:Unit_4",
        score: 2,
        nofPeoplePerDay: 1,
      },
      {
        name: CategoryName.Unit_5,
        uniqueName: "Medicine:Unit_5",
        score: 2,
        nofPeoplePerDay: 1,
      },
    ],
  },
  {
    name: CategoryName.Hematology,
    sub: [
      {
        name: CategoryName.Males_Ward,
        uniqueName: "Hematology:Males_Ward",
        score: 1,
        nofPeoplePerDay: 1,
      },
      {
        name: CategoryName.Females_Ward,
        uniqueName: "Hematology:Females_Ward",
        score: 1,
        nofPeoplePerDay: 1,
      },
    ],
  },
  {
    name: CategoryName.General_Surgery,
    sub: [
      {
        name: CategoryName.Floor_2,
        sub: [
          {
            name: CategoryName.Men_Ward,
            uniqueName: "General_Surgery:Floor_2:Men_Ward",
            score: 1,
            nofPeoplePerDay: 1,
          },
          {
            name: CategoryName.Women_Ward,
            uniqueName: "General_Surgery:Floor_2:Women_Ward",
            score: 1,
            nofPeoplePerDay: 1,
          },
        ],
      },
      {
        name: CategoryName.Floor_3,
        sub: [
          {
            name: CategoryName.First,
            uniqueName: "General_Surgery:Floor_3:First",
            score: 1,
            nofPeoplePerDay: 1,
          },
          {
            name: CategoryName.Second,
            uniqueName: "General_Surgery:Floor_3:Second",
            score: 1,
            nofPeoplePerDay: 1,
          },
        ],
      },
      {
        name: CategoryName.Floor_5,
        sub: [
          {
            name: CategoryName.Men_Ward,
            uniqueName: "General_Surgery:Floor_5:Men_Ward",
            score: 1,
            nofPeoplePerDay: 1,
          },
          {
            name: CategoryName.Women_Ward,
            uniqueName: "General_Surgery:Floor_5:Women_Ward",
            score: 1,
            nofPeoplePerDay: 1,
          },
        ],
      },
    ],
  },
  {
    name: CategoryName.OB_GYN,
    sub: [
      {
        name: CategoryName.Delivery_Room,
        uniqueName: "OB_GYN:Delivery_Room",
        score: 1,
      },
      { name: CategoryName.OB_War, uniqueName: "OB_GYN:OB_War", score: 1 },
    ],
  },
];

interface Context {
  uniqueName: string;
  occurrence: number;
  days: Record<number, number>;
  meta: { user: User; event: any }[];
}

// context of the operation
let ctx: Context[] = [];

const extractLeafs = (categories: Category[]) => {
  let leafs: Category[] = [];

  const traverse = (node: Category) => {
    if (node.sub && node.sub.length > 0) {
      node.sub.forEach(traverse);
    } else {
      leafs.push(node);
    }
  };

  categories.forEach(traverse);
  return leafs;
};

// get the "leaf" categories into a map of <string_path_to leaf, leaf_score>
// const scorePerCategory = extractCategoryScoreMap(categories);

const leafNodes = extractLeafs(categories);

const getCategoryByEvent = (event: string) => {
  return categories.find((x) => x.uniqueName === event);
};

// do the calculations
users.forEach((user) => {
  // events are sorted by dom
  let events: string[] = [];

  // get the target score for the user
  const scoreTarget = user.gender === "MALE" ? 22 : 21;

  // calculate base user score
  let totalScore = user.monthlyEvents.reduce((acc, curr, i) => {
    return acc + (getCategoryByEvent(curr.event)?.score ?? 0);
  }, 0);

  // a user comes in w a base score already greater than their scoreTarget
  if (totalScore > scoreTarget) {
    // TODO: handle faulty users
  }

  // add up user scores to the users scoreTarget
  while (totalScore < scoreTarget) {
    let event = getRandomEvent(leafNodes);

    if (event) {
      const { score, uniqueName } = event;

      if (!uniqueName) {
        throw new Error("uniqueName is undefined");
      }

      // Add gender check
      let isNight = uniqueName.split(":").includes("Night");

      while (isNight && user.gender === "FEMALE") {
        event = getRandomEvent(leafNodes);

        if (!event) continue;
        const { uniqueName } = event;

        if (!uniqueName) {
          throw new Error("uniqueName is undefined");
        }

        isNight = uniqueName.split(":").includes("Night");
      }

      if (!score) {
        throw new Error("score is undefined");
      }

      if (totalScore + score <= scoreTarget) {
        events.push(uniqueName);
        totalScore += score;
      }
    }
  }

  const eventDays = randNumsUniqueToMax(
    getDaysInMonth(2023, 2),
    user.monthlyEvents.map((duty) => duty.dom),
    events.length
  );

  // const selectRandomDate = (event: string, dom: number): number => {
  //   if (
  //     ctx.find((ctx) => ctx.uniqueName === event)?.days[dom] !==
  //     getCategoryByEvent(event)?.nofPeoplePerDay
  //   ) {
  //     return dom;
  //   }
  //   dom = Math.floor(Math.random() * getDaysInMonth(2023, 2));
  //   return selectRandomDate(event, dom);
  // };

  const generatedMonthlyEvents = events.map((duty, i) => {
    let dom = eventDays[i] + 1; // dom is 0 based

    //TODO: check if the event is already in the ctx and not exceed nofPeoplePerDay
    // const randomDom = selectRandomDate(duty, dom);

    // Shape the event to the UserMonthlyDuty type
    const event = { event: duty, dom: dom };

    const eventCtx = ctx.find((ctx) => ctx.uniqueName === duty);

    if (!eventCtx) {
      ctx.push({
        uniqueName: duty,
        occurrence: 1,
        days: { [event.dom]: 1 },
        meta: [{ user, event }],
      });
    } else {
      eventCtx.occurrence += 1;
      eventCtx.meta.push({ user, event });
      if (eventCtx.days[event.dom]) {
        eventCtx.days[event.dom]++;
      } else {
        eventCtx.days[event.dom] = 1;
      }
    }

    return event;
  });

  console.log({
    name: user.name,
    scoreTarget,
    events: generatedMonthlyEvents,
  });
});

// console.log(JSON.stringify(ctx));
