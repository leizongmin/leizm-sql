/**
 * @leizm/mysql tests
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { expect } from "chai";
import Q, { table } from "../lib";
import * as utils from "./utils";

test("format", function() {
  expect(Q.table("test1").format('"a"')).to.equal('"a"');
  expect(Q.table("test1").format("a=?", [0])).to.equal("a=0");
  expect(Q.table("test1").format("a=:v", { v: 0 })).to.equal("a=0");
});

test("select", function() {
  {
    const sql = Q.table("test1")
      .select("name", "age")
      .build();
    utils.debug(sql);
    expect(sql).to.equal("SELECT `name`, `age` FROM `test1`");
  }
  {
    const sql = Q.table("test1")
      .select("name", "age")
      .where({
        a: 123,
        b: 456,
      })
      .build();
    utils.debug(sql);
    expect(sql).to.equal("SELECT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456");
  }
  {
    const sql = Q.table("test1")
      .select("name", "age")
      .where("`a`=:a AND `b`=:b", {
        a: 123,
        b: 456,
      })
      .build();
    utils.debug(sql);
    expect(sql).to.equal("SELECT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456");
  }
  {
    const sql = Q.table("test1")
      .select("name", "age")
      .where({
        a: 123,
      })
      .where({
        b: 456,
      })
      .build();
    utils.debug(sql);
    expect(sql).to.equal("SELECT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456");
  }
  {
    const sql = Q.table("test1")
      .select("name", "age")
      .where("`a`=? AND `b`=?", [123, 456])
      .build();
    utils.debug(sql);
    expect(sql).to.equal("SELECT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456");
  }
  {
    const sql = Q.table("test1")
      .select("name", "age")
      .where({
        a: 123,
        b: 456,
      })
      .limit(10)
      .build();
    utils.debug(sql);
    expect(sql).to.equal("SELECT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456 LIMIT 10");
  }
  {
    const sql = Q.table("test1")
      .select("name", "age")
      .where({
        a: 123,
        b: 456,
      })
      .skip(10)
      .build();
    utils.debug(sql);
    expect(sql).to.equal("SELECT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456 LIMIT 10,18446744073709551615");
  }
  {
    const sql = Q.table("test1")
      .select("name", "age")
      .where({
        a: 123,
        b: 456,
      })
      .skip(10)
      .limit(20)
      .build();
    utils.debug(sql);
    expect(sql).to.equal("SELECT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456 LIMIT 10,20");
  }
  {
    const sql = Q.table("test1")
      .select("name", "age")
      .where({
        a: 123,
        b: 456,
      })
      .offset(10)
      .limit(20)
      .orderBy("`a` DESC, `b` ASC")
      .build();
    utils.debug(sql);
    expect(sql).to.equal(
      "SELECT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456 ORDER BY `a` DESC, `b` ASC LIMIT 10,20",
    );
  }
  {
    const sql = Q.table("test1")
      .select("name", "age")
      .where({
        a: 123,
        b: 456,
      })
      .offset(10)
      .limit(20)
      .orderBy("`a` ?, `b` ?", ["DESC", "ASC"])
      .build();
    utils.debug(sql);
    expect(sql).to.equal(
      "SELECT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456 ORDER BY `a` DESC, `b` ASC LIMIT 10,20",
    );
  }
  {
    const sql = Q.table("test1")
      .select("name", "age")
      .where({
        a: 123,
      })
      .and({
        b: 456,
      })
      .offset(10)
      .limit(20)
      .orderBy("`a` ?, `b` ?", ["DESC", "ASC"])
      .build();
    utils.debug(sql);
    expect(sql).to.equal(
      "SELECT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456 ORDER BY `a` DESC, `b` ASC LIMIT 10,20",
    );
  }
  {
    const sql = Q.table("test1")
      .selectDistinct("name", "age")
      .where({
        a: 123,
      })
      .and({
        b: 456,
      })
      .offset(10)
      .limit(20)
      .orderBy("`a` ?, `b` ?", ["DESC", "ASC"])
      .build();
    utils.debug(sql);
    expect(sql).to.equal(
      "SELECT DISTINCT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456 ORDER BY `a` DESC, `b` ASC LIMIT 10,20",
    );
  }
});
test("groupBy", function() {
  {
    const sql = Q.table("test1")
      .select("name", "age")
      .where({
        a: 123,
      })
      .offset(10)
      .limit(20)
      .groupBy("`name`")
      .build();
    utils.debug(sql);
    expect(sql).to.equal("SELECT `name`, `age` FROM `test1` WHERE `a`=123 GROUP BY `name` LIMIT 10,20");
  }
  {
    const sql = Q.table("test1")
      .select("name", "age")
      .where({
        a: 123,
      })
      .offset(10)
      .limit(20)
      .groupBy("`name` HAVING `b`=?", [22])
      .build();
    utils.debug(sql);
    expect(sql).to.equal("SELECT `name`, `age` FROM `test1` WHERE `a`=123 GROUP BY `name` HAVING `b`=22 LIMIT 10,20");
  }
});
test("count", function() {
  {
    const sql = Q.table("test1")
      .count("c")
      .where({
        a: 456,
        b: 789,
      })
      .build();
    utils.debug(sql);
    expect(sql).to.equal("SELECT COUNT(*) AS `c` FROM `test1` WHERE `a`=456 AND `b`=789");
  }
  {
    const sql = Q.table("test1")
      .count("c")
      .where({
        a: 456,
        b: 789,
      })
      .limit(1)
      .build();
    utils.debug(sql);
    expect(sql).to.equal("SELECT COUNT(*) AS `c` FROM `test1` WHERE `a`=456 AND `b`=789 LIMIT 1");
  }
});
test("insert", function() {
  {
    const sql = Q.table("test1")
      .insert({
        a: 123,
        b: 456,
      })
      .build();
    utils.debug(sql);
    expect(sql).to.equal("INSERT INTO `test1` (`a`, `b`) VALUES (123, 456)");
  }
  {
    const sql = Q.table("test1")
      .insert([
        {
          a: 123,
          b: 456,
        },
        {
          a: 789,
          b: 110,
        },
      ])
      .build();
    utils.debug(sql);
    expect(sql).to.equal("INSERT INTO `test1` (`a`, `b`) VALUES (123, 456),\n(789, 110)");
  }
});
test("update", function() {
  {
    const sql = Q.table("test1")
      .update({
        a: 123,
        b: 456,
      })
      .build();
    utils.debug(sql);
    expect(sql).to.equal("UPDATE `test1` SET `a`=123, `b`=456");
  }
  {
    const sql = Q.table("test1")
      .update("a=?, b=?", [123, 456])
      .build();
    utils.debug(sql);
    expect(sql).to.equal("UPDATE `test1` SET a=123, b=456");
  }
  {
    const sql = Q.table("test1")
      .update("a=:a, b=:b", { a: 123, b: 456 })
      .build();
    utils.debug(sql);
    expect(sql).to.equal("UPDATE `test1` SET a=123, b=456");
  }
  {
    const sql = Q.table("test1")
      .update("`a`=123, b=456")
      .build();
    utils.debug(sql);
    expect(sql).to.equal("UPDATE `test1` SET `a`=123, b=456");
  }
  {
    const sql = Q.table("test1")
      .update({
        a: 123,
        b: 456,
      })
      .limit(12)
      .build();
    utils.debug(sql);
    expect(sql).to.equal("UPDATE `test1` SET `a`=123, `b`=456 LIMIT 12");
  }
  {
    const sql = Q.table("test1")
      .update({
        a: 123,
        b: 456,
      })
      .where({
        b: 777,
      })
      .limit(12)
      .build();
    utils.debug(sql);
    expect(sql).to.equal("UPDATE `test1` SET `a`=123, `b`=456 WHERE `b`=777 LIMIT 12");
  }
  {
    const sql = Q.table("test1")
      .update({
        a: 123,
      })
      .set({
        b: 456,
      })
      .where({
        b: 777,
      })
      .limit(12)
      .build();
    utils.debug(sql);
    expect(sql).to.equal("UPDATE `test1` SET `a`=123, `b`=456 WHERE `b`=777 LIMIT 12");
  }
  {
    const sql = Q.table("test1")
      .update()
      .set({
        a: 123,
        b: 456,
      })
      .where({
        b: 777,
      })
      .limit(12)
      .build();
    utils.debug(sql);
    expect(sql).to.equal("UPDATE `test1` SET `a`=123, `b`=456 WHERE `b`=777 LIMIT 12");
  }
  {
    expect(() => {
      Q.table("test1")
        .set({ a: 1 })
        .build();
    }).throw("query type must be UPDATE, please call .update() before");
  }
  {
    expect(() => {
      Q.table("test1")
        .update()
        .build();
    }).throw("update data connot be empty");
  }
  {
    expect(() => {
      Q.table("table")
        .update({})
        .where({
          a: 123,
        })
        .limit(456)
        .build();
    }).throw("update data connot be empty");
  }
  {
    const sql = Q.table("test1")
      .update({})
      .set({ a: 456 })
      .where({
        a: 123,
      })
      .limit(456)
      .build();
    utils.debug(sql);
    expect(sql).to.equal("UPDATE `test1` SET `a`=456 WHERE `a`=123 LIMIT 456");
  }
});

test("insert or update", function() {
  {
    const sql = Q.table("test1")
      .insert({ a: 123, b: 456 })
      .onDuplicateKeyUpdate()
      .set({ a: "xxx" })
      .build();
    utils.debug(sql);
    expect(sql).to.equal("INSERT INTO `test1` (`a`, `b`) VALUES (123, 456) ON DUPLICATE KEY UPDATE `a`='xxx'");
  }
  {
    expect(() =>
      Q.table("test1")
        .insert([{ a: 123, b: 456 }, { a: 111, b: 222 }])
        .onDuplicateKeyUpdate()
        .set({ a: "xxx" })
        .build(),
    ).throws("onDuplicateKeyUpdate() must inserted one row, but accutal is 2 rows");
  }
  {
    expect(() =>
      Q.table("test1")
        .select("*")
        .onDuplicateKeyUpdate()
        .set({ a: "xxx" })
        .build(),
    ).throws("onDuplicateKeyUpdate() must be called after insert()");
  }
});

test("delete", function() {
  {
    const sql = Q.table("test1")
      .delete()
      .build();
    utils.debug(sql);
    expect(sql).to.equal("DELETE FROM `test1`");
  }
  {
    const sql = Q.table("test1")
      .delete()
      .where("`a`=2")
      .build();
    utils.debug(sql);
    expect(sql).to.equal("DELETE FROM `test1` WHERE `a`=2");
  }
  {
    const sql = Q.table("test1")
      .delete()
      .where("`a`=2")
      .limit(1)
      .build();
    utils.debug(sql);
    expect(sql).to.equal("DELETE FROM `test1` WHERE `a`=2 LIMIT 1");
  }
});
test("sql", function() {
  {
    const sql = Q.table("test1")
      .sql('SELECT JSON_OBJECT("key1", 1, "key2", "abc", "key1", "def") as `data`')
      .build();
    utils.debug(sql);
    expect(sql).to.equal('SELECT JSON_OBJECT("key1", 1, "key2", "abc", "key1", "def") as `data`');
  }
  {
    const sql = Q.table("test1")
      .sql('SELECT JSON_OBJECT("key1", 1, "key2", "abc", "key1", "def") as `data` :$limit')
      .limit(10)
      .build();
    utils.debug(sql);
    expect(sql).to.equal('SELECT JSON_OBJECT("key1", 1, "key2", "abc", "key1", "def") as `data` LIMIT 10');
  }
  {
    const sql = Q.table("test1")
      .sql('SELECT JSON_OBJECT("key1", 1, "key2", "abc", "key1", "def") as `data` :$limit')
      .limit(10)
      .offset(5)
      .build();
    utils.debug(sql);
    expect(sql).to.equal('SELECT JSON_OBJECT("key1", 1, "key2", "abc", "key1", "def") as `data` LIMIT 5,10');
  }
  {
    const sql = Q.table("test1")
      .sql('SELECT JSON_OBJECT("key1", 1, "key2", "abc", "key1", "def") as `data` :$orderBy :$limit')
      .limit(10)
      .offset(5)
      .orderBy("`id` ASC")
      .build();
    utils.debug(sql);
    expect(sql).to.equal(
      'SELECT JSON_OBJECT("key1", 1, "key2", "abc", "key1", "def") as `data` ORDER BY `id` ASC LIMIT 5,10',
    );
  }
  {
    const sql = Q.table("test1")
      .sql("SELECT :$fields FROM `test1`")
      .fields("a", "b", "c")
      .limit(10)
      .offset(5)
      .orderBy("`id` ASC")
      .build();
    utils.debug(sql);
    expect(sql).to.equal("SELECT `a`, `b`, `c` FROM `test1`");
  }
});

test("options", function() {
  {
    const sql = Q.table("test1")
      .select()
      .options({
        offset: 1,
        limit: 2,
        orderBy: "`id` DESC",
        groupBy: "`name`",
        fields: ["id", "name"],
      })
      .build();
    utils.debug(sql);
    expect(sql).to.equal("SELECT `id`, `name` FROM `test1` GROUP BY `name` ORDER BY `id` DESC LIMIT 1,2");
  }
  {
    const sql = Q.table("test1")
      .select()
      .options({
        skip: 1,
        limit: 2,
        orderBy: "`id` DESC",
        groupBy: "`name`",
        fields: ["id", "name"],
      })
      .build();
    utils.debug(sql);
    expect(sql).to.equal("SELECT `id`, `name` FROM `test1` GROUP BY `name` ORDER BY `id` DESC LIMIT 1,2");
  }
});

test("where(condition): condition for modify operation cannot be empty", function() {
  // SELECT 操作可以为空
  {
    const sql = Q.table("test1")
      .select("name", "age")
      .where({})
      .build();
    utils.debug(sql);
    expect(sql).to.equal("SELECT `name`, `age` FROM `test1`");
  }
  {
    const sql = Q.table("test1")
      .select("name", "age")
      .where("   ")
      .build();
    utils.debug(sql);
    expect(sql).to.equal("SELECT `name`, `age` FROM `test1`");
  }
  // 其他操作不能为空
  {
    expect(() => {
      const sql = Q.table("test1")
        .update({ a: 123 })
        .where({})
        .build();
      utils.debug(sql);
    }).to.throw("condition for modify operation cannot be empty");
  }
  {
    expect(() => {
      const sql = Q.table("test1")
        .delete()
        .where("   ")
        .build();
      utils.debug(sql);
    }).to.throw("condition for modify operation cannot be empty");
  }
});

test("where(condition): condition key cannot be undefined", function() {
  {
    expect(() => {
      const sql = Q.table("test1")
        .update({ a: 123 })
        .where({ a: 123, b: undefined })
        .build();
      utils.debug(sql);
    }).to.throw("found undefined value for condition keys b; it may caused unexpected errors");
  }
  {
    expect(() => {
      const sql = Q.table("test1")
        .select("name", "age")
        .where({ a: 123, b: 456, c: undefined, d: undefined })
        .build();
      utils.debug(sql);
    }).to.throw("found undefined value for condition keys c,d; it may caused unexpected errors");
  }
});

test("where(condition): support for $in & $like", function() {
  {
    const sql = Q.table("test1")
      .select("name", "age")
      .where({
        a: { $in: [1, 2, 3] },
        b: { $like: "%hello%" },
      })
      .offset(10)
      .limit(20)
      .orderBy("`a` DESC, `b` ASC")
      .build();
    utils.debug(sql);
    expect(sql).to.equal(
      "SELECT `name`, `age` FROM `test1` WHERE `a` IN (1, 2, 3) AND `b` LIKE '%hello%' ORDER BY `a` DESC, `b` ASC LIMIT 10,20",
    );
  }
  {
    expect(() => {
      const sql = Q.table("test1")
        .update({ a: 123 })
        .where({ a: { $in: 123 } })
        .build();
      utils.debug(sql);
    }).to.throw("value for condition type $in in field a must be an array");
  }
  {
    expect(() => {
      const sql = Q.table("test1")
        .update({ a: 123 })
        .where({ a: { $like: 123 } })
        .build();
      utils.debug(sql);
    }).to.throw("value for condition type $like in a must be a string");
  }
  {
    const sql = Q.table("test1")
      .select()
      .where({
        a: { $eq: 1 },
        b: { $gt: 2 },
        c: { $gte: 3 },
        d: { $lt: 4 },
        e: { $lte: 5 },
        f: { $isNull: true },
        g: { $isNotNull: true },
        h: { $like: "a" },
        i: { $notLike: "b" },
        j: { $in: ["c"] },
        k: { $notIn: ["d"] },
        l: { $ne: "x" },
      })
      .build();
    utils.debug(sql);
    expect(sql).to.equal(
      "SELECT * FROM `test1` WHERE `a`=1 AND `b`>2 AND `c`>=3 AND `d`<4 AND `e`<=5 AND `f` IS NULL AND `g` IS NOT NULL AND `h` LIKE 'a' AND `i` NOT LIKE 'b' AND `j` IN ('c') AND `k` NOT IN ('d') AND `l`<>'x'",
    );
  }
});

test("update(data): support for $incr", function() {
  {
    const sql = Q.table("test1")
      .update({ a: { $incr: 1 } })
      .where({ a: 2 })
      .build();
    utils.debug(sql);
    expect(sql).to.equal("UPDATE `test1` SET `a`=`a`+1 WHERE `a`=2");
  }
});

test("build()", function() {
  expect(() => table("test1").build()).to.throws('invalid query type ""');
});
