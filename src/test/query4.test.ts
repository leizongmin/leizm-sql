/**
 * @leizm/mysql tests
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { expect } from "chai";
import Q from "../lib";
import * as utils from "./utils";

test("typings", function() {
  {
    const a = 1;
    const b = "b";
    const sql = Q.select<{
      a: number;
      b: string;
      c: boolean;
    }>("*")
      .from("test1")
      .where({ a: { $eq: 2 }, b: { $lt: 3 } })
      .where({ [b]: { $eq: a } })
      .build();
    utils.debug(sql);
    expect(sql).to.equal("SELECT * FROM `test1` WHERE `a`=2 AND `b`<3 AND `b`=1");
  }
  {
    const a = 1;
    const b = "b";
    const sql = Q.update<{
      a: number;
      b: string;
      c: boolean;
    }>()
      .table("test1")
      .where({ a: { $eq: 2 }, b: { $lt: 3 } })
      .set({ [b]: { $incr: a } })
      .build();
    utils.debug(sql);
    expect(sql).to.equal("UPDATE `test1` SET `b`=`b`+(1) WHERE `a`=2 AND `b`<3");
  }
});
