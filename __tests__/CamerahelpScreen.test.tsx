import React from "react";
import { render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import CamerahelpScreen from "../app/(tabs)/(translation)/camerahelp";
import i18n from "i18next";

describe("CamerahelpScreen", () => {
  it("renders the help page title correctly", () => {
    const { getByText } = render(<CamerahelpScreen />);
    expect(getByText(i18n.t("help"))).toBeTruthy();
  });

  it("renders the help description correctly", () => {
    const { getByText } = render(<CamerahelpScreen />);
    expect(getByText(i18n.t("helpDescription"))).toBeTruthy();
  });

  it("renders all the help steps correctly", () => {
    const { getByText } = render(<CamerahelpScreen />);

    expect(getByText(`1. ${i18n.t("helpStep1")}`)).toBeTruthy();
    expect(getByText(`2. ${i18n.t("helpStep2")}`)).toBeTruthy();
    expect(getByText(`3. ${i18n.t("helpStep3")}`)).toBeTruthy();
    expect(getByText(`4. ${i18n.t("helpStep4")}`)).toBeTruthy();
    expect(getByText(`5. ${i18n.t("helpStep5")}`)).toBeTruthy();
    expect(getByText(`6. ${i18n.t("helpStep6")}`)).toBeTruthy();
    expect(getByText(`7. ${i18n.t("helpStep7")}`)).toBeTruthy();
    expect(getByText(`8. ${i18n.t("helpStep8")}`)).toBeTruthy();
  });

  it("applies the correct styles to the title", () => {
    const { getByText } = render(<CamerahelpScreen />);
    const title = getByText(i18n.t("help"));
    const flattenedStyle = StyleSheet.flatten(title.props.style); // Flatten the style array
    expect(flattenedStyle).toMatchObject({
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "left",
    });
  });

  it("applies the correct styles to the text", () => {
    const { getByText } = render(<CamerahelpScreen />);
    const text = getByText(i18n.t("helpDescription"));
    const flattenedStyle = StyleSheet.flatten(text.props.style); // Flatten the style array
    expect(flattenedStyle).toMatchObject({
      fontSize: 16,
      marginBottom: 10,
      textAlign: "left",
    });
  });
});
