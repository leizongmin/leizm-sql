/**
 * @leizm/mysql tests
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { expect } from "chai";
import Q from "../lib";
import * as utils from "./utils";

test("sub query", function() {
  {
    const sql = Q.select("*")
      .from("test1")
      .where("a=? AND b IN ???", [
        123,
        Q.select("id")
          .from("test2")
          .where({ id: { $lt: 10 } })
          .limit(100),
      ])
      .build();
    utils.debug(sql);
    expect(sql).to.equal(
      "SELECT * FROM `test1` WHERE a=123 AND b IN (SELECT `id` FROM `test2` WHERE `id`<10 LIMIT 100)",
    );
  }
  {
    const sql = Q.select("*")
      .from("test1")
      .where("a=:a AND b IN :::b", {
        a: 123,
        b: Q.select("id")
          .from("test2")
          .where({ id: { $lt: 10 } })
          .limit(100),
      })
      .build();
    utils.debug(sql);
    expect(sql).to.equal(
      "SELECT * FROM `test1` WHERE a=123 AND b IN (SELECT `id` FROM `test2` WHERE `id`<10 LIMIT 100)",
    );
  }
  {
    const sql = Q.select("*")
      .from("test1")
      .where({
        a: 123,
        b: {
          $in: Q.select("id")
            .from("test2")
            .where({ id: { $lt: 10 } })
            .limit(100),
        },
      })
      .build();
    utils.debug(sql);
    expect(sql).to.equal(
      "SELECT * FROM `test1` WHERE `a`=123 AND `b` IN (SELECT `id` FROM `test2` WHERE `id`<10 LIMIT 100)",
    );
  }
});
