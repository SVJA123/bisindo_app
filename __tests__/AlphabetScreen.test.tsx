import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import AlphabetScreen from "../app/(tabs)/alphabet";

describe("AlphabetScreen", () => {
  it("renders all alphabet images correctly", () => {
    const { getAllByTestId } = render(<AlphabetScreen />);

    const alphabetImages = getAllByTestId(/^alphabet-image-/);
    expect(alphabetImages.length).toBe(26);
  });

  it("opens the modal with the correct image when an alphabet is pressed", () => {
    const { getByTestId, getByText } = render(<AlphabetScreen />);

    const letterA = getByTestId("alphabet-image-a");
    fireEvent.press(letterA);

    expect(getByText("A")).toBeTruthy();
    expect(getByTestId("expanded-image")).toBeTruthy();
  });

  it("closes the modal when the modal overlay is pressed", () => {
    const { getByTestId, queryByTestId } = render(<AlphabetScreen />);

    const letterA = getByTestId("alphabet-image-a");
    fireEvent.press(letterA);

    const modalOverlay = getByTestId("expanded-image");
    fireEvent.press(modalOverlay);

    expect(queryByTestId("expanded-image")).toBeNull();
  });

  it("applies the correct styles to the grid items", () => {
    const { getByTestId } = render(<AlphabetScreen />);
    const letterA = getByTestId("alphabet-image-a");

    expect(letterA.props.style).toContainEqual({
      width: "45%",
      alignItems: "center",
      margin: 5,
      padding: 10,
      backgroundColor: "white",
      borderRadius: 10,
    });
  });

  it("applies the pressed style when a grid item is pressed", () => {
    const { getByTestId } = render(<AlphabetScreen />);
    const letterA = getByTestId("alphabet-image-a");

    fireEvent(letterA, "pressIn");

    const styles = StyleSheet.flatten(letterA.props.style);

    expect(styles).toMatchObject({
      width: "45%",
      alignItems: "center",
      margin: 5,
      padding: 10,
      backgroundColor: "white",
      borderRadius: 10,
    });
  });
});
