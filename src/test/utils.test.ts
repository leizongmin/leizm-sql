/**
 * @leizm/mysql tests
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { expect } from "chai";
import { sqlConditionStrings, sqlFormat, sqlFormatObject, sqlUpdateString } from "../lib/utils";

class TestQuery {
  build() {
    return "xxx";
  }
}
class TestQuery2 {
  build() {
    return 123;
  }
}

test("utils sqlConditionStrings", function() {
  expect(sqlConditionStrings({ a: { $lt: 123, $lte: 456 } })).to.deep.equal(["`a`<123", "`a`<=456"]);
  expect(sqlConditionStrings({ a: { $gt: 123, $gte: 456 } })).to.deep.equal(["`a`>123", "`a`>=456"]);
  expect(sqlConditionStrings({ a: { $eq: "aaa" } })).to.deep.equal(["`a`='aaa'"]);
  expect(sqlConditionStrings({ a: { $like: "xx%" } })).to.deep.equal(["`a` LIKE 'xx%'"]);
  expect(sqlConditionStrings({ a: { $notLike: "xx%" } })).to.deep.equal(["`a` NOT LIKE 'xx%'"]);
  expect(sqlConditionStrings({ a: { $in: [1, 2, 3] } })).to.deep.equal(["`a` IN (1, 2, 3)"]);
  expect(sqlConditionStrings({ a: { $in: new TestQuery() } })).to.deep.equal(["`a` IN (xxx)"]);
  expect(sqlConditionStrings({ a: { $notIn: [1, 2, 3] } })).to.deep.equal(["`a` NOT IN (1, 2, 3)"]);
  expect(sqlConditionStrings({ a: { $notIn: new TestQuery() } })).to.deep.equal(["`a` NOT IN (xxx)"]);
  expect(() => sqlConditionStrings({ a: { $xxx: 1 } })).throws(/not supported/);
  expect(() => sqlConditionStrings({ a: { $in: new TestQuery2() } })).throws("build() must returns a string");
  expect(() => sqlConditionStrings({ a: { $in: false } })).throws("must be an array");
  expect(() => sqlConditionStrings({ a: { $notIn: new TestQuery2() } })).throws("build() must returns a string");
  expect(() => sqlConditionStrings({ a: { $notIn: false } })).throws("must be an array");
});

test("utils sqlFormat", function() {
  {
    expect(sqlFormat("a=? AND ??=? AND ??? AND ??? AND d=?", [123, "b", 456, new TestQuery(), "yyy", 789])).to.equal(
      "a=123 AND `b`=456 AND (xxx) AND yyy AND d=789",
    );
    expect(() => sqlFormat("???", [123])).throws("must be a string or QueryBuilder instance");
    expect(() => sqlFormat("???", [false])).throws("must be a string or QueryBuilder instance");
    expect(() => sqlFormat("???", [new TestQuery2()])).throws("build() must returns a string");
  }
  {
    expect(
      sqlFormatObject("a=:1 AND ::2=:3 AND :::4 AND :::5 AND d=:6", {
        "1": 123,
        "2": "b",
        "3": 456,
        "4": new TestQuery(),
        "5": "yyy",
        "6": 789,
      }),
    ).to.equal("a=123 AND `b`=456 AND (xxx) AND yyy AND d=789");
    expect(() => sqlFormatObject(":::a", { a: 123 })).throws("must be a string or QueryBuilder instance");
    expect(() => sqlFormatObject(":::a", { a: false })).throws("must be a string or QueryBuilder instance");
    expect(() => sqlFormatObject(":::a", { a: new TestQuery2() })).throws("build() must returns a string");
    expect(sqlFormatObject(":a", {})).to.equal(":a");
    expect(sqlFormatObject(":a")).to.equal(":a");
  }
});

test("utils sqlUpdateString", function() {
  expect(sqlUpdateString({ a: { $incr: 123 } })).to.equal("`a`=`a`+123");
  expect(() => sqlUpdateString({ a: { $xxx: 123 } })).throws("does not supported");
});
