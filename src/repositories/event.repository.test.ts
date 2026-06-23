import { resolveSortSpec } from "./event.repository";

describe("resolveSortSpec", () => {
  const sortKeys = [
    undefined,
    "startDateAsc",
    "startDateDesc",
    "endDateAsc",
    "endDateDesc",
  ];

  it.each(sortKeys)(
    "ends every spec with a unique _id tiebreaker for sortBy=%s",
    (sortBy) => {
      const spec = resolveSortSpec(sortBy);
      const keys = Object.keys(spec);

      expect(keys).toContain("_id");
      // The tiebreaker must be the LAST key so it only breaks ties between
      // documents that are otherwise equal under the primary sort fields.
      expect(keys[keys.length - 1]).toBe("_id");
    },
  );

  it("falls back to the default date-descending spec for unknown keys", () => {
    expect(resolveSortSpec("nonsense")).toEqual({
      "dates.startDate": -1,
      "dates.endDate": -1,
      _id: -1,
    });
  });
});
