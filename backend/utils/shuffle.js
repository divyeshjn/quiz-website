import { randomInt } from "node:crypto";

export const shuffleArray = (array) => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);

    [shuffled[i], shuffled[j]] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  return shuffled;
};