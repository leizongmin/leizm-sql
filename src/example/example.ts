import { table, expr } from "../lib";

// 普通查询
table("test")
  .select("a", "b")
  .where({ a: 1 })
  .and("b=?", [2])
  .orderBy("b DESC")
  .offset(10)
  .limit(5)
  .build();
// SELECT `a`, `b` FROM `test` WHERE `a`=1 AND `b`=2 ORDER BY b DESC LIMIT 10,5

// 连表查询
table("hello")
  .select("*")
  .as("A")
  .leftJoin("world")
  .as("B")
  .on("A.id=B.id")
  .where("1")
  .and("2")
  .offset(2)
  .limit(3)
  .build();
// SELECT `A`.*, `B`.* FROM `hello` AS `A` LEFT JOIN `world` AS `B` ON A.id=B.id WHERE 1 AND 2 LIMIT 2,3

// 插入数据
table("test1")
  .insert({
    a: 123,
    b: 456,
  })
  .build();
// INSERT INTO `test1` (`a`, `b`) VALUES (123, 456);

// 批量插入数据
table("test1")
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
// INSERT INTO `test1` (`a`, `b`) VALUES (123, 456),
// (789, 110)");

// 更新数据
table("test1")
  .update({
    a: 123,
    b: 456,
  })
  .where({
    b: 777,
  })
  .limit(12)
  .build();
// UPDATE `test1` SET `a`=123, `b`=456 WHERE `b`=777 LIMIT 12

// 插入数据，如果记录已经存在则改为更新
table("test1")
  .insert({ a: 123, b: 456 })
  .onDuplicateKeyUpdate()
  .set({ a: "xxx" })
  .build();
// INSERT INTO `test1` (`a`, `b`) VALUES (123, 456) ON DUPLICATE KEY UPDATE `a`='xxx'

// 删除数据
table("test1")
  .delete()
  .where({
    b: 777,
  })
  .limit(12)
  .build();
// DELETE FROM `test1` WHERE `b`=777 LIMIT 12

// 子查询
table("test1")
  .select("*")
  .where("a=? AND b IN ???", [
    123,
    table("test2")
      .select("id")
      .where({ id: { $lt: 10 } })
      .limit(100),
  ])
  .build();
// SELECT * FROM `test1` WHERE a=123 AND b IN (SELECT `id` FROM `test2` WHERE `id`<10 LIMIT 100)

const q = table("test1")
  .select("*")
  .where({ a: 123 });
q.clone()
  .where({ b: 456 })
  .offset(10)
  .limit(20)
  .build();
// SELECT * FROM `test1` WHERE `a`=123 AND `b`=456 LIMIT 10,20
q.clone()
  .where({ b: 789, c: 666 })
  .orderBy("a DESC")
  .build();
// SELECT * FROM `test1` WHERE `a`=123 AND `b`=789 AND `c`=666 ORDER BY a DESC

// 条件表达式
table("test")
  .select("*")
  .where(
    expr()
      .and("a=?", [123])
      .or({ b: 456 })
      .and({ c: { $in: [789] } })
      .or("d=:d", { d: 666 }),
  )
  .build();
// SELECT * FROM `test` WHERE (a=123 OR `b`=456 AND `c` IN (789) OR d=666)
