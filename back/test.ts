// const scores = [-4, -2, -2, 0, 1, 1, 1, 2];
// [rating, word, lastTime]
type Answer = [number, string, number];
const scores: Answer[] = [[-4, 'q', -30], [-4, 'q', -100], [-2, 'w', -100], [-2, 'e', -50], [0, 'r', -20], [1, 't', -200], [1, 'y', -50], [1, 'u', -30], [2, 'i', -90]];

const min = Math.min(...scores.map((score) => score[0]));
const max = Math.max(...scores.map((score) => score[0]));

const lastTime = Math.min(...scores.map((score) => score[2]));
const newTime = Math.max(...scores.map((score) => score[2]));

function getScore(score: Answer, min: number, max: number, lastTime: number, newTime: number) {
  const diffScore = (max - min) * 1.5;
  const diffTime = (newTime - lastTime) * 2;

  return Math.pow((diffScore - score[0] + min) * 10 / diffScore, 3) * Math.pow((diffTime - score[2] + lastTime) * 3 / diffTime, 1);
}

const mapped = scores.map((score) => getScore(score, min, max, lastTime, newTime));
const sum = mapped.reduce((acc, cur) => acc + cur, 0);

function getPercentage(score: number) {
  return (score / sum) * 100;
}

console.log(JSON.stringify({ min, max, sum, lastTime, newTime }));

mapped.map((score) => console.log(score, getPercentage(score)));

function getIndexFromScore(scores: number[], sum: number, randomize: () => number) {
  const random = randomize();
  let index = 0; 
  let acc = 0;
  while (acc <= random) {
    acc += scores[index];
    index++;
  }
  return index - 1;
}