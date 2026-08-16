import { runTests } from "./validation.test";

const success = runTests();
if (success) {
  console.log("SUCCESS: All automated validation tests passed!");
  process.exit(0);
} else {
  console.error("FAILURE: Some validation tests failed.");
  process.exit(1);
}
