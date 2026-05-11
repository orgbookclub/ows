import { BadRequestException } from "@nestjs/common";

import { EventSortKey } from "./dto/event-sort.v2.dto";
import {
  parseEventPagination,
  parseEventProjection,
  parseEventSort,
} from "./events.v2.utils";

describe("parseEventProjection", () => {
  it("returns mode 'none' when input is undefined", () => {
    const actual = parseEventProjection(undefined);
    expect(actual.mode).toBe("none");
    expect(actual.selectString).toBeUndefined();
    expect(actual.topLevelFields.size).toBe(0);
  });

  it("returns mode 'none' when input is an empty string", () => {
    const actual = parseEventProjection("");
    expect(actual.mode).toBe("none");
  });

  it("parses an inclusion projection into a select string", () => {
    const actual = parseEventProjection("name,status");
    expect(actual.mode).toBe("include");
    expect(actual.selectString).toBe("name status");
    expect(actual.topLevelFields).toEqual(new Set(["name", "status"]));
  });

  it("parses an exclusion projection into a select string", () => {
    const actual = parseEventProjection("-description,-interested");
    expect(actual.mode).toBe("exclude");
    expect(actual.selectString).toBe("-description -interested");
    expect(actual.topLevelFields).toEqual(
      new Set(["description", "interested"]),
    );
  });

  it("trims whitespace and dedupes entries", () => {
    const actual = parseEventProjection("name, status, name");
    expect(actual.selectString).toBe("name status");
  });

  it("supports nested paths under dates", () => {
    const actual = parseEventProjection("name,dates.startDate");
    expect(actual.selectString).toBe("name dates.startDate");
    expect(actual.topLevelFields).toEqual(new Set(["name", "dates"]));
  });

  it("rejects mixed inclusion and exclusion entries", () => {
    expect(() => parseEventProjection("name,-description")).toThrow(
      BadRequestException,
    );
  });

  it("rejects unknown fields", () => {
    expect(() => parseEventProjection("nope")).toThrow(BadRequestException);
  });

  it("rejects non-string input", () => {
    expect(() => parseEventProjection(42)).toThrow(BadRequestException);
  });
});

describe("parseEventSort", () => {
  it("returns undefined when input is omitted", () => {
    expect(parseEventSort(undefined)).toBeUndefined();
    expect(parseEventSort("")).toBeUndefined();
  });

  it("returns the validated enum value", () => {
    expect(parseEventSort("startDateAsc")).toBe(EventSortKey.StartDateAsc);
    expect(parseEventSort("endDateDesc")).toBe(EventSortKey.EndDateDesc);
  });

  it("rejects unknown sort keys", () => {
    expect(() => parseEventSort("nope")).toThrow(BadRequestException);
  });

  it("rejects non-string input", () => {
    expect(() => parseEventSort(1)).toThrow(BadRequestException);
  });
});

describe("parseEventPagination", () => {
  it("applies defaults when both inputs are omitted", () => {
    expect(parseEventPagination(undefined, undefined)).toEqual({
      page: 1,
      pageSize: 20,
    });
  });

  it("parses string inputs from a query string", () => {
    expect(parseEventPagination("3", "50")).toEqual({ page: 3, pageSize: 50 });
  });

  it("rejects non-integer page", () => {
    expect(() => parseEventPagination("abc", undefined)).toThrow(
      BadRequestException,
    );
  });

  it("rejects page below 1", () => {
    expect(() => parseEventPagination("0", undefined)).toThrow(
      BadRequestException,
    );
  });

  it("rejects pageSize above the maximum", () => {
    expect(() => parseEventPagination(undefined, "101")).toThrow(
      BadRequestException,
    );
  });

  it("rejects negative pagination values", () => {
    expect(() => parseEventPagination("-1", undefined)).toThrow(
      BadRequestException,
    );
  });
});
