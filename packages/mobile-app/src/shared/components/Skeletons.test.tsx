import React from "react";
import { render } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { SkeletonCard, SkeletonListItem } from "./Skeletons";

function renderWithPaper(ui: React.ReactElement) {
  return render(<PaperProvider>{ui}</PaperProvider>);
}

describe("SkeletonCard", () => {
  it("renderiza el contenedor de carga", () => {
    const { getByTestId } = renderWithPaper(<SkeletonCard />);
    expect(getByTestId("skeleton-card")).toBeTruthy();
  });
});

describe("SkeletonListItem", () => {
  it("renderiza 3 indicadores por defecto", () => {
    const { getByTestId } = renderWithPaper(<SkeletonListItem />);
    expect(getByTestId("skeleton-list-item-0")).toBeTruthy();
    expect(getByTestId("skeleton-list-item-1")).toBeTruthy();
    expect(getByTestId("skeleton-list-item-2")).toBeTruthy();
  });

  it("respeta el prop `count`", () => {
    const { queryByTestId } = renderWithPaper(<SkeletonListItem count={1} />);
    expect(queryByTestId("skeleton-list-item-0")).toBeTruthy();
    expect(queryByTestId("skeleton-list-item-1")).toBeNull();
  });
});
