import { expect, test } from "vitest";
import { Eihter, left, right } from "./either";

function doSomeThing(shouldSuccess: boolean): Eihter<string, string> {
  if (shouldSuccess) {
    return right("success");
  } else {
    return left("error");
  }
}

test("Success result", () => {
  const successResult = doSomeThing(true);

  expect(successResult.isRight()).toBe(true);
  expect(successResult.isLeft()).toBe(false);
});

test("Error result", () => {
  const errorResult = doSomeThing(false);

  expect(errorResult.isLeft()).toBe(true);
  expect(errorResult.isRight()).toBe(false);
});
