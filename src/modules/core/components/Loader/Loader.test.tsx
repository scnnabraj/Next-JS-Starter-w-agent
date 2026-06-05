import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import Loader from "./index";

test("renders loading label", async () => {
  const { getByText } = await render(<Loader label="Loading data" />);

  await expect.element(getByText("Loading data")).toBeInTheDocument();
});

test("renders spinner icon", async () => {
  const { container } = await render(<Loader showLabel={false} />);

  expect(container.querySelector("svg")).not.toBeNull();
});

test("applies fullPage layout classes", async () => {
  const { container } = await render(<Loader fullPage />);

  const root = container.firstElementChild;
  expect(root?.className).toContain("min-h-[60vh]");
  expect(root?.className).toContain("w-full");
});
