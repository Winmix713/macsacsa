import { describe, expect, it } from "vitest";

import { mockPredictions } from "@/mocks/predictions";
import { applyPredictionFilters, paginatePredictions } from "../predictionsService";

const cloneDataset = () => structuredClone(mockPredictions);

describe("predictionsService helpers", () => {
  it("filters predictions by status", () => {
    const results = applyPredictionFilters(cloneDataset(), { status: "won" });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((prediction) => prediction.status === "won")).toBe(true);
  });

  it("filters predictions by league", () => {
    const leagueId = "premier-league";
    const results = applyPredictionFilters(cloneDataset(), { league: leagueId });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((prediction) => prediction.match.league.id === leagueId)).toBe(true);
  });

  it("filters predictions by search term", () => {
    const results = applyPredictionFilters(cloneDataset(), { search: "arsenal" });

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("pred-001");
  });

  it("filters predictions within a date range inclusively", () => {
    const from = "2024-11-10";
    const to = "2024-11-13";
    const results = applyPredictionFilters(cloneDataset(), { from, to });
    const fromTime = Date.parse(from);
    const toTime = Date.parse(to) + 86_399_999;

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every((prediction) => {
        const matchTime = Date.parse(prediction.match.date);
        return matchTime >= fromTime && matchTime <= toTime;
      }),
    ).toBe(true);
  });

  it("combines multiple filters", () => {
    const results = applyPredictionFilters(cloneDataset(), {
      status: "won",
      league: "la-liga",
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((prediction) => prediction.status === "won" && prediction.match.league.id === "la-liga")).toBe(
      true,
    );
  });

  it("paginates results deterministically", () => {
    const dataset = cloneDataset();
    const pageSize = 5;
    const page = 2;
    const paginated = paginatePredictions(dataset, page, pageSize);

    expect(paginated.page).toBe(page);
    expect(paginated.pageSize).toBe(pageSize);
    expect(paginated.total).toBe(dataset.length);
    expect(paginated.totalPages).toBe(Math.ceil(dataset.length / pageSize));
    expect(paginated.data).toHaveLength(pageSize);
    expect(paginated.data[0]?.id).toBe(dataset[pageSize]?.id);
  });

  it("clamps page number when exceeding bounds", () => {
    const dataset = cloneDataset();
    const pageSize = 4;
    const paginated = paginatePredictions(dataset, 999, pageSize);

    expect(paginated.page).toBe(paginated.totalPages);
    expect(paginated.data.length).toBeLessThanOrEqual(pageSize);
  });
});
