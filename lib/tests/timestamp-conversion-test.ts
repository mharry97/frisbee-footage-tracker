import { normalizeTimestampToHHMMSS } from "../utils.ts";

const testCases = ["68:52", "110:43", "05:05", "0:10", "116:55"];

for (const ts of testCases) {
  const result = normalizeTimestampToHHMMSS(ts);
  console.log(`Input: ${ts} → Output: ${result}`);
}
