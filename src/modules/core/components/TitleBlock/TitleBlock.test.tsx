import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import TitleBlock from "./index";

test("renders title when enableTitle is true (default)", async () => {
  const { getByText, container } = await render(
    <TitleBlock title="Hello Title" />,
  );

  expect(container.querySelector("h2")).not.toBeNull();
  await expect.element(getByText("Hello Title")).toBeInTheDocument();
});

test("renders title when enableTitle is explicitly true", async () => {
  const { getByText, container } = await render(
    <TitleBlock title="Visible Title" enableTitle={true} />,
  );

  expect(container.querySelector("h2")).not.toBeNull();
  await expect.element(getByText("Visible Title")).toBeInTheDocument();
});

test("does not render title when enableTitle is false", async () => {
  const { container } = await render(
    <TitleBlock title="Hidden Title" enableTitle={false} />,
  );

  expect(container.querySelector("h2")).toBeNull();
});

test("renders description only when enableTitle is false", async () => {
  const { getByText, container } = await render(
    <TitleBlock
      title="Hidden Title"
      description="Visible Description"
      enableTitle={false}
    />,
  );

  expect(container.querySelector("h2")).toBeNull();
  await expect.element(getByText("Visible Description")).toBeInTheDocument();
});

test("renders title and description when both are enabled", async () => {
  const { getByText } = await render(
    <TitleBlock
      title="Hello Title"
      description="Hello Description"
      enableTitle={true}
      enableDescription={true}
    />,
  );

  await expect.element(getByText("Hello Title")).toBeInTheDocument();
  await expect.element(getByText("Hello Description")).toBeInTheDocument();
});

test("renders title only when enableDescription is false", async () => {
  const { getByText, container } = await render(
    <TitleBlock
      title="Only Title"
      description="Hidden Description"
      enableTitle={true}
      enableDescription={false}
    />,
  );

  expect(container.querySelector("h2")).not.toBeNull();
  await expect.element(getByText("Only Title")).toBeInTheDocument();
  expect(container.querySelector("p")).toBeNull();
});
