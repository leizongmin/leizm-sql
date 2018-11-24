[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![David deps][david-image]][david-url]
[![node version][node-image]][node-url]
[![npm download][download-image]][download-url]
[![npm license][license-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@leizm/sql.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@leizm/sql
[travis-image]: https://img.shields.io/travis/leizongmin/leizm-sql.svg?style=flat-square
[travis-url]: https://travis-ci.org/leizongmin/leizm-sql
[coveralls-image]: https://img.shields.io/coveralls/leizongmin/leizm-sql.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/leizongmin/leizm-sql?branch=master
[david-image]: https://img.shields.io/david/leizongmin/leizm-sql.svg?style=flat-square
[david-url]: https://david-dm.org/leizongmin/leizm-sql
[node-image]: https://img.shields.io/badge/node.js-%3E=_4.0-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/@leizm/sql.svg?style=flat-square
[download-url]: https://npmjs.org/package/@leizm/sql
[license-image]: https://img.shields.io/npm/l/@leizm/sql.svg

# @leizm/sql

SQL 查询构造器

## 安装

```bash
npm install @leizm/sql --save
```

## 使用方法

```typescript
import Q from "@leizm/sql";

Q.select("a", "b")
  .from("test")
  .where({ a: 1 })
  .and("b=?", [2])
  .orderBy("b DESC")
  .offset(10)
  .limit(5)
  .build();
// SELECT `a`, `b` FROM `test` WHERE `a`=1 AND `b`=2 ORDER BY b DESC LIMIT 10,5

Q.select()
  .from("hello")
  .as("A")
  .leftJoin("world")
  .as("B")
  .on("A.id=B.id")
  .where("1")
  .and("2")
  .skip(2)
  .limit(3)
  .build();
// SELECT `A`.*, `B`.* FROM `hello` AS `A` LEFT JOIN `world` AS `B` ON A.id=B.id WHERE 1 AND 2 LIMIT 2,3
```

## License

```text
MIT License

Copyright (c) 2018 Zongmin Lei <leizongmin@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
