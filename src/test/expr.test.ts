/**
 * @leizm/mysql tests
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { expect } from "chai";
import Q from "../lib";
import * as utils from "./utils";

test("expr and", function() {
  {
    const sql = Q.expr()
      .and("a=?", [123])
      .and({ b: 456 })
      .and({ c: { $in: [789] } })
      .build();
    utils.debug(sql);
    expect(sql).to.equal("(a=123 AND `b`=456 AND `c` IN (789))");
  }
});

test("expr or", function() {
  {
    const sql = Q.expr()
      .or("a=?", [123])
      .or({ b: 456 })
      .or({ c: { $in: [789] } })
      .build();
    utils.debug(sql);
    expect(sql).to.equal("(a=123 OR `b`=456 OR `c` IN (789))");
  }
});

test("expr and & or", function() {
  {
    const sql = Q.expr()
      .and("a=?", [123])
      .or({ b: 456 })
      .and({ c: { $in: [789] } })
      .or("d=:d", { d: 666 })
      .build();
    utils.debug(sql);
    expect(sql).to.equal("(a=123 OR `b`=456 AND `c` IN (789) OR d=666)");
  }
});

test("expr in query", function() {
  {
    const sql = Q.select("*")
      .from("test")
      .where(
        Q.expr()
          .and("a=?", [123])
          .or({ b: 456 })
          .and({ c: { $in: [789] } })
          .or("d=:d", { d: 666 }),
      )
      .and(Q.expr().format("x=? AND y=? AND z=?", ["a", "b", "c"]))
      .build();
    utils.debug(sql);
    expect(sql).to.equal(
      "SELECT * FROM `test` WHERE (a=123 OR `b`=456 AND `c` IN (789) OR d=666) AND x='a' AND y='b' AND z='c'",
    );
  }
});
