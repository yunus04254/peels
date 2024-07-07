import StatisticsSection from "src/components/custom/StatisticsSection";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Chart as ChartJS } from "chart.js";
import { AuthProvider } from 'src/context/AuthContext';
import { expect, jest, test } from "@jest/globals";

ChartJS.register = jest.fn();

describe(StatisticsSection, () => {
    const routerWrapper = ({ children }) => (
        <BrowserRouter>
          <AuthProvider>
            {children}
          </AuthProvider>
        </BrowserRouter>
      );

  const mockStats = {
    totalEntries: '10',
    totalJournals: '5',
    longestStreak: '7',
    currentStreak: '3',
  };

  const mockMoodData = {
    labels: ["Happy", "Sad", "Excited"],
    datasets: [{ data: [5, 2, 3] }],
  };

  it("renders without crashing", () => {
    const { getByText } = render(<StatisticsSection />, { wrapper: routerWrapper });
    expect(getByText("Profile")).toBeInTheDocument();
    expect(getByText("Mood")).toBeInTheDocument();
  });

  it("displays default stats when none are provided", () => {
    const { getByText } = render(<StatisticsSection />, { wrapper: routerWrapper });
    expect(getByText("0")).toBeInTheDocument();
  });

  it("correctly displays provided stats", () => {
    const { getByText } = render(<StatisticsSection stats={mockStats} />, { wrapper: routerWrapper });
    expect(getByText(mockStats.currentStreak)).toBeInTheDocument();
    expect(getByText(mockStats.totalEntries)).toBeInTheDocument();
  });

  it("shows 'Create an entry first!' message when no mood data is provided", () => {
    const { getByText } = render(<StatisticsSection />, { wrapper: routerWrapper });
    expect(getByText("Create an entry first!")).toBeInTheDocument();
  });

  it("renders Pie chart when mood data is provided", () => {
    const { getByText } = render(<StatisticsSection moodData={mockMoodData} />, { wrapper: routerWrapper });
    expect(getByText("Mood")).toBeInTheDocument();
    mockMoodData.labels.forEach(label => {
      expect(getByText(label)).toBeInTheDocument();
    });
  });

  it("displays 'See All' links", () => {
    const { getAllByText } = render(<StatisticsSection />, { wrapper: routerWrapper });
    const seeAllLinks = getAllByText("See All");
    expect(seeAllLinks.length).toBe(2);
  });
});
