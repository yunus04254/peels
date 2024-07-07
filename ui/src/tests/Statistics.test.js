import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import StatisticsPage from "src/pages/Statistics";
import * as api from "src/lib/api";
import * as AuthContext from "src/context/AuthContext";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebase-config";
import { expect, jest } from "@jest/globals";

initializeApp(firebaseConfig);

jest.mock("src/lib/api");
jest.mock("src/context/AuthContext");

// Mock react-chartjs-2 components here
jest.mock("react-chartjs-2", () => ({
  Pie: () => null,
  Line: () => null,
}));

describe("StatisticsPage component", () => {
  const routerWrapper = ({ children }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );
  const fakeStats = {
    totalEntries: "5",
    totalJournals: "2",
    longestStreak: "3",
    moodData: {
      labels: ["Happy", "Sad"],
      datasets: [{ data: [3, 2] }],
    },
    entriesData: {
      labels: ["Jan", "Feb"],
      datasets: [{ data: [2, 3] }],
    },
    moodOverTimeData: {
      labels: ["Week 1", "Week 2"],
      datasets: [{ data: [4, 5] }],
    },
    wordsPerEntryData: {
      labels: ["Entry 1", "Entry 2"],
      datasets: [{ data: [100, 150] }],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    AuthContext.useAuth.mockReturnValue({ user: { userID: "user123" } });
    jest.spyOn(Date, "now").mockReturnValue(new Date("2024-03-26").getTime());

    api.Get.mockImplementation(async (url) => {
      if (url.includes("statistics")) {
        return await Promise.resolve({
          ok: true,
          json: () => Promise.resolve(fakeStats),
        });
      }
      return await Promise.resolve({ ok: false });
    });

    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders statistics page and makes API calls successfully", async () => {
    let getByText;
    await act(async () => {
      const rendered = render(<StatisticsPage />, { wrapper: routerWrapper });
      getByText = rendered.getByText;
    });

    expect(getByText("Insights")).toBeInTheDocument();
    expect(getByText("Total Entries")).toBeInTheDocument();
    expect(getByText("5")).toBeInTheDocument();
    expect(api.Get).toHaveBeenCalled();
  });

  it("updates statistics upon date range change", async () => {
    // Mock API response for a specific date range
    api.Get.mockImplementationOnce(async (url) => {
      if (url.includes("Last 30 Days")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              /* specific data for Last 30 Days */
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(fakeStats),
      });
    });

    const { getByText, findByText } = render(<StatisticsPage />, {
      wrapper: routerWrapper,
    });

    // Use findByText to wait for the element to appear
    const totalEntriesText = await findByText("5");

    expect(totalEntriesText).toBeInTheDocument();
  });

  it("scrolls to chart on button click", async () => {
    HTMLDivElement.prototype.scrollIntoView = jest.fn();

    const { getByText } = render(<StatisticsPage />, {
      wrapper: routerWrapper,
    });

    await act(async () => {
      const button = getByText("Mood Pie Chart", { selector: "button" });
      fireEvent.click(button);
    });

    expect(HTMLDivElement.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("fetches and displays data for a custom date range", async () => {
    // Mock the implementation to simulate fetching data for the custom date range
    api.Get.mockImplementationOnce(async (url) => {
      if (url.includes("Custom")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              /* data specific to the custom date range */
            }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    const { getByText, getByLabelText } = render(<StatisticsPage />, {
      wrapper: routerWrapper,
    });

    fireEvent.change(getByLabelText("Start Date"), {
      target: { value: "2023-01-01" },
    });
    fireEvent.change(getByLabelText("End Date"), {
      target: { value: "2023-01-31" },
    });

    fireEvent.click(getByText("Apply Custom"));

    await waitFor(() => {
      const lastCallArguments =
        api.Get.mock.calls[api.Get.mock.calls.length - 1];
      const lastCallUrl = lastCallArguments[0];

      expect(lastCallUrl).toMatch(/startDate=2023-01-01/);
      expect(lastCallUrl).toMatch(/endDate=2023-01-31/);
    });
  });

  it("updates statistics and charts when a new date range is selected", async () => {
    const { getByText } = render(<StatisticsPage />, {
      wrapper: routerWrapper,
    });

    // Trigger the date range selection in your component
    await act(async () => {
      const dateRangeOption = getByText("Last 90 Days");
      fireEvent.click(dateRangeOption);
    });

    // Calculate expected dates based on the mocked current date
    const currentDate = new Date();
    const expectedEndDate = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD format
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - 90); // Adjust for "Last 90 Days", considering the current date as the end date
    const expectedStartDate = startDate.toISOString().split("T")[0]; // YYYY-MM-DD format

    // Wait for and verify the API call with dynamically calculated dates
    await waitFor(() => {
      const calls = api.Get.mock.calls;
      const lastCallQueryParams = calls[calls.length - 1][0];

      expect(lastCallQueryParams).toContain(`startDate=${expectedStartDate}`);
      expect(lastCallQueryParams).toContain(`endDate=${expectedEndDate}`);
    });
  });

  it("updates selectedRange and applies correct class when date range links are clicked", async () => {
    const { getByText } = render(<StatisticsPage />, {
      wrapper: routerWrapper,
    });

    await act(async () => {
      const last7DaysLink = getByText("Last 7 Days");
      fireEvent.click(last7DaysLink);
    });

    await waitFor(() => {
      expect(getByText("Last 7 Days").className).toContain("selected-range");
      expect(getByText("Last 30 Days").className).not.toContain(
        "selected-range"
      );
    });

    await act(async () => {
      const last30DaysLink = getByText("Last 30 Days");
      fireEvent.click(last30DaysLink);
    });

    await waitFor(() => {
      expect(getByText("Last 30 Days").className).toContain("selected-range");
      expect(getByText("Last 7 Days").className).not.toContain(
        "selected-range"
      );
    });
  });

  it('updates selectedRange and applies correct class when "Last 1 Year" and "All Time" links are clicked', async () => {
    const { getByText } = render(<StatisticsPage />, {
      wrapper: routerWrapper,
    });

    await act(async () => {
      fireEvent.click(getByText("Last 1 Year"));
    });
    await waitFor(() => {
      expect(getByText("Last 1 Year").className).toContain("selected-range");
      expect(getByText("All Time").className).not.toContain("selected-range");
    });

    await act(async () => {
      fireEvent.click(getByText("All Time"));
    });
    await waitFor(() => {
      expect(getByText("All Time").className).toContain("selected-range");
      expect(getByText("Last 1 Year").className).not.toContain(
        "selected-range"
      );
    });
  });

  it("resets endDate if it is less than the newly selected startDate in the custom date range", async () => {
    const { getByLabelText, getByText } = render(<StatisticsPage />, {
      wrapper: routerWrapper,
    });

    fireEvent.change(getByLabelText("Start Date"), {
      target: { value: "2024-01-01" },
    });
    fireEvent.change(getByLabelText("End Date"), {
      target: { value: "2024-01-10" },
    });

    fireEvent.change(getByLabelText("Start Date"), {
      target: { value: "2024-01-15" },
    });

    fireEvent.click(getByText("Apply Custom"));

    await waitFor(() => {
      expect(getByLabelText("End Date").value).toBe("");
    });
  });
});
