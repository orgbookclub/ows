import { ArgumentMetadata, BadRequestException } from "@nestjs/common";
import { Types } from "mongoose";

import { ParseObjectIdPipe } from "./parse-object-id.pipe";

describe("ParseObjectIdPipe", () => {
  const pipe = new ParseObjectIdPipe();
  const meta: ArgumentMetadata = {
    type: "param",
    data: "id",
    metatype: String,
  };

  it("returns the value unchanged for a valid 24-hex ObjectId string", () => {
    const id = new Types.ObjectId().toHexString();
    expect(pipe.transform(id, meta)).toBe(id);
  });

  it("throws BadRequestException for a clearly malformed id", () => {
    expect(() => pipe.transform("notanid", meta)).toThrow(BadRequestException);
  });

  it("includes the value and parameter name in the error message", () => {
    expect(() => pipe.transform("notanid", meta)).toThrow(
      'Invalid value "notanid" for parameter "id".',
    );
  });

  it("falls back to 'id' when ArgumentMetadata.data is missing", () => {
    expect(() =>
      pipe.transform("notanid", { type: "param", metatype: String }),
    ).toThrow('Invalid value "notanid" for parameter "id".');
  });

  it("rejects undefined and empty string", () => {
    expect(() => pipe.transform(undefined as unknown as string, meta)).toThrow(
      BadRequestException,
    );
    expect(() => pipe.transform("", meta)).toThrow(BadRequestException);
  });
});
