/**
 * @leizm/mysql
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import * as assert from "assert";
import * as utils from "./utils";
import { DataRow, QueryOptionsParams, AdvancedCondition, AdvancedUpdate } from "./common";
import { Expression } from "./expr";

export class QueryBuilder<Q = DataRow, R = any> {
  //////////////////////////////////////////////////////////////////////////////

  /**
   * 表达式构造器
   */
  public static expr(): Expression {
    return new Expression();
  }

  /**
   * 创建新Query，设置表名
   */
  public static table<Q = DataRow, R = any>(name: string): QueryBuilder<Q, R> {
    return new QueryBuilder().table(name);
  }

  /**
   * 更新
   */
  public static update<Q = DataRow, R = any>(): QueryBuilder<Q, R> {
    return new QueryBuilder().update();
  }

  /**
   * 查询
   * @param fields
   */
  public static select<Q = DataRow, R = any>(...fields: string[]): QueryBuilder<Q, R> {
    return new QueryBuilder().select(...fields);
  }

  /**
   * 查询
   * @param fields
   */
  public static selectDistinct<Q = DataRow, R = any>(...fields: string[]): QueryBuilder<Q, R> {
    return new QueryBuilder().selectDistinct(...fields);
  }

  /**
   * 插入
   * @param data 数据
   */
  public static insert<Q = DataRow, R = any>(data: Array<Partial<Q>> | Partial<Q>): QueryBuilder<Q, R> {
    return new QueryBuilder().insert(data);
  }

  /**
   * 删除
   */
  public static delete<Q = DataRow, R = any>(): QueryBuilder<Q, R> {
    return new QueryBuilder().delete();
  }

  //////////////////////////////////////////////////////////////////////////////

  protected readonly _data: {
    tableName?: string;
    tableNameEscaped?: string;
    fields: string[];
    conditions: string[];
    type: string;
    update: string[];
    insert: string;
    insertRows: number;
    delete: string;
    sql: string;
    sqlTpl: string;
    sqlValues: any[];
    orderFields: string;
    orderBy: string;
    groupBy: string;
    offsetRows: number;
    limitRows: number;
    limit: string;
    mapTableToAlias: Record<string, string>;
    mapAliasToTable: Record<string, string>;
    currentJoinTableName: string;
    joinTables: Array<{
      table: string;
      fields: string[];
      type: "LEFT JOIN" | "JOIN" | "RIGHT JOIN";
      on: string;
      alias: string;
    }>;
  };

  /**
   * 创建 QueryBuilder
   */
  constructor() {
    this._data = {
      fields: [],
      conditions: [],
      type: "",
      update: [],
      insert: "",
      insertRows: 0,
      delete: "",
      sql: "",
      sqlTpl: "",
      sqlValues: [],
      orderFields: "",
      orderBy: "",
      groupBy: "",
      offsetRows: 0,
      limitRows: 0,
      limit: "",
      mapTableToAlias: {},
      mapAliasToTable: {},
      currentJoinTableName: "",
      joinTables: [],
    };
  }

  /**
   * 克隆当前QueryBuilder
   */
  public clone(): QueryBuilder {
    const q = new QueryBuilder();
    (q as any)._data = utils.deepCopy(this._data);
    return q;
  }

  /**
   * 格式化模板字符串
   * @param tpl 模板字符串
   */
  public format(tpl: string): string;
  /**
   * 格式化模板字符串
   * @param tpl 模板字符串
   * @param values 键值对数据
   */
  public format(tpl: string, values: DataRow): string;
  /**
   * 格式化模板字符串
   * @param tpl 模板字符串
   * @param values 参数数组
   */
  public format(tpl: string, values: any[]): string;

  public format(tpl: string, values?: DataRow | any[]): string {
    assert.ok(typeof tpl === "string", `first parameter must be a string`);
    if (!values) {
      return tpl;
    }
    assert.ok(Array.isArray(values) || typeof values === "object", "second parameter must be an array or object");
    if (Array.isArray(values)) {
      return utils.sqlFormat(tpl, values);
    }
    return utils.sqlFormatObject(tpl, values);
  }

  //////////////////////////////////////////////////////////////////////////////

  /**
   * 设置表名
   * @param tableName 表名
   */
  public into(tableName: string): this {
    return this.table(tableName);
  }

  /**
   * 设置表名
   * @param tableName 表名
   */
  public from(tableName: string): this {
    return this.table(tableName);
  }

  /**
   * 设置表名
   * @param tableName 表名
   */
  public table(tableName: string): this {
    assert.ok(!this._data.tableName, `cannot change table name after it's set to "${this._data.tableName}"`);
    this._data.tableName = tableName;
    this._data.tableNameEscaped = utils.sqlEscapeId(tableName);
    return this;
  }

  //////////////////////////////////////////////////////////////////////////////

  /**
   * 设置表名对应的别名
   * @param tableName 表名
   * @param aliasName 别名
   */
  protected setTableAlias(tableName: string, aliasName: string) {
    // assert.ok(!(tableName in this._data.mapTableToAlias), `table name "${tableName}" already registered`);
    assert.ok(!(aliasName in this._data.mapAliasToTable), `alias name "${aliasName}" already registered`);
    this._data.mapAliasToTable[aliasName] = tableName;
    this._data.mapTableToAlias[tableName] = aliasName;
  }

  /**
   * 添加 JOIN 查询
   * @param tableName
   * @param type
   * @param fields
   * @param alias
   */
  protected addJoinTable(
    tableName: string,
    type: "JOIN" | "LEFT JOIN" | "RIGHT JOIN",
    fields: string[],
    alias: string = "",
  ): this {
    assert.ok(typeof tableName === "string", `first parameter must be a string`);
    this._data.currentJoinTableName = tableName;
    if (fields.length < 1) {
      fields = [];
    }
    this._data.joinTables.push({ table: tableName, fields, type, on: "", alias });
    return this;
  }

  /**
   * 设置表别名，准备连表查询
   * @param name 别名
   */
  public as(name: string): this {
    assert.ok(typeof name === "string", `first parameter must be a string`);
    const tableName = this._data.currentJoinTableName || this._data.tableName!;
    this.setTableAlias(tableName, name);
    if (this._data.joinTables.length > 0) {
      this._data.joinTables[this._data.joinTables.length - 1].alias = name;
    }
    return this;
  }

  /**
   * JOIN 连表
   * @param tableName 表名
   */
  public join(tableName: string, fields: string[] = []): this {
    return this.addJoinTable(tableName, "JOIN", fields);
  }

  /**
   * LEFT JOIN 连表
   * @param tableName 表名
   */
  public leftJoin(tableName: string, fields: string[] = []): this {
    return this.addJoinTable(tableName, "LEFT JOIN", fields);
  }

  /**
   * RIGHT JOIN 连表
   * @param tableName 表名
   */
  public rightJoin(tableName: string, fields: string[] = []): this {
    return this.addJoinTable(tableName, "RIGHT JOIN", fields);
  }

  /**
   * 连表条件
   * @param condition 条件字符串
   * @param values 模板参数
   */
  public on(condition: string, values: DataRow | any[] = []): this {
    const last = this._data.joinTables[this._data.joinTables.length - 1];
    assert.ok(last, `missing leftJoin()`);
    assert.ok(!last.on, `join condition already registered, before condition is "${last.on}"`);
    last.on = this.format(condition, values);
    return this;
  }

  //////////////////////////////////////////////////////////////////////////////

  /**
   * 查询条件
   * @param condition 表达式
   */
  public where(condition: Expression): this;
  /**
   * 查询条件
   * @param condition SQL 语句
   */
  public where(condition: string): this;
  /**
   * 查询条件
   * @param condition 键值对数据：{ aaa: 1, bbb: 22 })
   */
  public where(condition: Partial<Q> | Partial<Pick<AdvancedCondition, keyof Q>>): this;
  /**
   * 查询条件
   * @param condition 模板字符串，可以为 ('aaa=:a AND bbb=:b', { a: 123, b: 456 }) 或 ('aaa=? AND bbb=?', [ 123, 456 ])
   */
  public where(condition: string, values: DataRow | any[]): this;

  public where(
    condition: Expression | string | Partial<Q> | Partial<Pick<AdvancedCondition, keyof Q>>,
    values?: DataRow | any[],
  ): this {
    if (typeof condition === "string") {
      if (values) {
        return this.and(condition, values);
      }
      return this.and(condition);
    } else if (condition instanceof Expression) {
      return this.and(condition);
    }
    return this.and(condition);
  }

  /**
   * 查询条件
   * @param condition 表达式
   */
  public and(condition: Expression): this;
  /**
   * 查询条件
   * @param condition SQL 语句
   */
  public and(condition: string): this;
  /**
   * 查询条件
   * @param condition 键值对数据：{ aaa: 1, bbb: 22 })
   */
  public and(condition: Partial<Q> | Partial<Pick<AdvancedCondition, keyof Q>>): this;
  /**
   * 查询条件
   * @param condition 模板字符串，可以为 ('aaa=:a AND bbb=:b', { a: 123, b: 456 })
   */
  public and(condition: string, values: DataRow): this;
  /**
   * 查询条件
   * @param condition 模板字符串，可以为 ('aaa=? AND bbb=?', [ 123, 456 ])
   */
  public and(condition: string, values: any[]): this;

  public and(
    condition: Expression | string | Partial<Q> | Partial<Pick<AdvancedCondition, keyof Q>>,
    values?: DataRow | any[],
  ): this {
    const t = typeof condition;
    assert.ok(condition, `missing condition`);
    assert.ok(t === "string" || t === "object", `condition must be a string or object`);
    if (typeof condition === "string") {
      if (this._data.type !== "SELECT") {
        // 如果是更改操作，检查 condition 不能为空
        assert.ok(condition.trim(), `condition for modify operation cannot be empty`);
      }
      this._data.conditions.push(this.format(condition, values || []));
    } else if (condition instanceof Expression) {
      this._data.conditions.push(condition.build());
    } else {
      const keys = utils.findKeysForUndefinedValue(condition);
      assert.ok(keys.length < 1, `found undefined value for condition keys ${keys}; it may caused unexpected errors`);
      if (this._data.type !== "SELECT") {
        // 如果是更改操作，检查 condition 不能为空
        assert.ok(Object.keys(condition).length > 0, `condition for modify operation cannot be empty`);
      }
      this._data.conditions = this._data.conditions.concat(utils.sqlConditionStrings(condition as any));
    }
    return this;
  }

  /**
   * 查询的字段
   * @param fields 要查询的字段
   */
  public select(...fields: string[]): this {
    assert.ok(this._data.type === "", `cannot change query type after it was set to "${this._data.type}"`);
    this._data.type = "SELECT";
    if (fields.length < 1) return this;
    return this.fields(...fields);
  }

  /**
   * 设置查询字段
   * @param fields 要查询的字段
   */
  public fields(...fields: string[]): this {
    assert.ok(!(this._data.fields.length > 0), `cannot change fields after it has been set`);
    this._data.fields = this._data.fields.concat(utils.formatFields("", fields));
    return this;
  }

  /**
   * 去除重复的字段查询
   * @param fields
   */
  public selectDistinct(...fields: string[]): this {
    assert.ok(this._data.type === "", `cannot change query type after it was set to "${this._data.type}"`);
    this._data.type = "SELECT DISTINCT";
    assert.ok(fields.length > 0, `distinct expected one or more fields`);
    return this.fields(...fields);
  }

  /**
   * 查询数量
   * @param name 存储结果的字段名
   */
  public count(name: string): this {
    assert.ok(this._data.type === "", `cannot change query type after it was set to "${this._data.type}"`);
    this._data.type = "SELECT";
    this._data.fields.push("COUNT(*) AS " + utils.sqlEscapeId(name));
    return this;
  }

  /**
   * 更新
   */
  public update(): this;
  /**
   * 更新
   * @param update 键值对数据，如 { a: 123, b: 456 }
   */
  public update(update: Partial<Q> | Pick<AdvancedUpdate, keyof Q>): this;
  /**
   * 更新
   * @param update SQL 语句，如 a=a+1
   */
  public update(update: string): this;
  /**
   * 更新
   * @param update SQL 语句模板，如 a=:a
   * @param values 模板参数，如 { a: 123 }
   */
  public update(update: string, values: DataRow): this;
  /**
   * 更新
   * @param update SQL 语句模板，如 a=?
   * @param values 模板参数，如 [ 123 ]
   */
  public update(update: string, values: any[]): this;

  public update(update?: Partial<Q> | Pick<AdvancedUpdate, keyof Q> | string, values?: DataRow | any[]): this {
    assert.ok(this._data.type === "", `cannot change query type after it was set to "${this._data.type}"`);
    this._data.type = "UPDATE";
    this._data.update = [];
    if (update) {
      if (typeof update === "string") {
        if (values) {
          return this.set(update, values);
        }
        return this.set(update);
      }
      return this.set(update);
    }
    return this;
  }

  /**
   * 更新
   * @param update 键值对数据，如 { a: 123, b: 456 }
   */
  public set(update: Partial<Q> | Pick<AdvancedUpdate, keyof Q>): this;
  /**
   * 更新
   * @param update SQL 语句，如 a=a+1
   */
  public set(update: string): this;
  /**
   * 更新
   * @param update SQL 语句模板，如 a=:a
   * @param values 模板参数，如 { a: 123 }
   */
  public set(update: string, values: DataRow): this;
  /**
   * 更新
   * @param update SQL 语句模板，如 a=?
   * @param values 模板参数，如 [ 123 ]
   */
  public set(update: string, values: any[]): this;

  public set(update: Partial<Q> | Pick<AdvancedUpdate, keyof Q> | string, values?: DataRow | any[]): this {
    const t = typeof update;
    assert.ok(
      this._data.type === "UPDATE" || this._data.type === "INSERT_OR_UPDATE",
      `query type must be UPDATE, please call .update() before`,
    );
    assert.ok(update, `missing update data`);
    assert.ok(t === "string" || t === "object", `first parameter must be a string or array`);
    if (typeof update === "string") {
      this._data.update.push(this.format(update, values || []));
    } else {
      let update2 = update as Record<string, any>;
      const sql = utils.sqlUpdateString(update2);
      if (sql) {
        this._data.update.push(sql);
      }
    }
    return this;
  }

  /**
   * 插入
   * @param data 键值对数据
   */
  public insert(data: Partial<Q>): this;
  /**
   * 插入
   * @param data 键值对数据数组
   */
  public insert(data: Array<Partial<Q>>): this;

  public insert(data: Partial<Q> | Array<Partial<Q>>): this {
    assert.ok(this._data.type === "", `cannot change query type after it was set to "${this._data.type}"`);
    this._data.type = "INSERT";
    assert.ok(data, `missing data`);
    assert.ok(typeof data === "object", `data must be an object or array`);
    if (Array.isArray(data)) {
      assert.ok(data.length >= 1, `data array must at least have 1 item`);
    } else {
      data = [data];
    }

    const list: Array<DataRow> = data as Array<DataRow>;
    const originFields = Object.keys(list[0]);
    const fields = originFields.map(name => utils.sqlEscapeId(name));
    const values: string[] = [];
    for (const item of list) {
      assert.ok(item && typeof item === "object", `every item of data array must be an object`);
      const line: string[] = [];
      for (const field of originFields) {
        assert.ok(field in item, `every item of data array must have field "${field}"`);
        line.push(utils.sqlEscape(item[field]));
      }
      values.push(`(${line.join(", ")})`);
    }
    this._data.insert = `(${fields.join(", ")}) VALUES ${values.join(",\n")}`;
    this._data.insertRows = list.length;
    return this;
  }

  /**
   * 删除
   */
  public delete(): this {
    assert.ok(this._data.type === "", `cannot change query type after it was set to "${this._data.type}"`);
    this._data.type = "DELETE";
    return this;
  }

  /**
   * 插入记录时如果键冲突，则改为更新
   * ON DUPLICATE KEY UPDATE
   * 用法：table("xx").insert(row).onDuplicateKeyUpdate().set(update)
   */
  public onDuplicateKeyUpdate(): this {
    assert.ok(this._data.type === "INSERT", `onDuplicateKeyUpdate() must be called after insert()`);
    assert.ok(
      this._data.insertRows === 1,
      `onDuplicateKeyUpdate() must inserted one row, but accutal is ${this._data.insertRows} rows`,
    );
    this._data.type = "INSERT_OR_UPDATE";
    return this;
  }

  /**
   * 自定义SQL语句
   * @param sql SQL 查询语句
   */
  public sql(sql: string): this;
  /**
   * 自定义SQL语句
   * @param sql SQL 查询语句
   * @param values 模板参数，如 { a: 123 }
   */
  public sql(sql: string, values: DataRow): this;
  /**
   * 自定义SQL语句
   * @param sql SQL 查询语句
   * @param values 模板参数，如 [ 123 ]
   */
  public sql(sql: string, values: any[]): this;

  public sql(sql: string, values?: DataRow | any[]): this {
    assert.ok(this._data.type === "", `cannot change query type after it was set to "${this._data.type}"`);
    this._data.type = "CUSTOM";
    this._data.sqlTpl = sql;
    this._data.sqlValues = Array.isArray(values) ? values : [];
    return this;
  }

  /**
   * 排序方法
   * @param tpl SQL 查询语句
   */
  public orderBy(tpl: string): this;
  /**
   * 排序方法
   * @param tpl SQL 查询语句
   * @param values 模板参数，如 { a: 123 }
   */
  public orderBy(tpl: string, values: DataRow): this;
  /**
   * 排序方法
   * @param tpl SQL 查询语句
   * @param values 模板参数，如 [ 123 ]
   */
  public orderBy(tpl: string, values: any[]): this;

  public orderBy(tpl: string, values?: DataRow | any[]): this {
    if (values) {
      this._data.orderFields = this.format(tpl, values);
    } else {
      this._data.orderFields = tpl;
    }
    this._data.orderBy = `ORDER BY ${this._data.orderFields}`;
    this._data.orderBy = this._data.orderBy.replace(/'DESC'/gi, "DESC").replace(/'ASC'/gi, "ASC");
    return this;
  }

  /**
   * 分组方法
   * @param fields 字段
   */
  public groupBy(...fields: string[]): this {
    assert.ok(fields.length > 0, `groupBy expected one or more fields`);
    this._data.groupBy = `GROUP BY ${utils.formatFields("", fields).join(", ")}`;
    return this;
  }

  /**
   * 分组条件
   * @param tpl SQL 查询语句
   */
  public having(tpl: string): this;
  /**
   * 分组条件
   * @param tpl SQL 查询语句
   * @param values 模板参数，如 { a: 123 }
   */
  public having(tpl: string, values: DataRow): this;
  /**
   * 分组条件
   * @param tpl SQL 查询语句
   * @param values 模板参数，如 [ 123 ]
   */
  public having(tpl: string, values: any[]): this;

  public having(tpl: string, values?: DataRow | any[]): this {
    assert.ok(this._data.groupBy.length > 0, `please call groupBy() firstly`);
    if (values) {
      this._data.groupBy += " HAVING " + this.format(tpl, values);
    } else {
      this._data.groupBy += " HAVING " + tpl;
    }
    return this;
  }

  /**
   * 跳过指定行数
   * @param rows 行数
   */
  public offset(rows: number): this {
    assert.ok(rows >= 0, `rows must >= 0`);
    this._data.offsetRows = Number(rows);
    this._data.limit = utils.sqlLimitString(this._data.offsetRows, this._data.limitRows);
    return this;
  }

  /**
   * 跳过指定行数
   * @param rows 行数
   */
  public skip(rows: number): this {
    return this.offset(rows);
  }

  /**
   * 返回指定行数
   * @param rows 行数
   */
  public limit(rows: number): this {
    assert.ok(rows >= 0, `rows must >= 0`);
    this._data.limitRows = Number(rows);
    this._data.limit = utils.sqlLimitString(this._data.offsetRows, this._data.limitRows);
    return this;
  }

  /**
   * 批量设置 options
   * @param options 选项，包含 { offset, limit, orderBy, groupBy, fields }
   */
  public options(options: QueryOptionsParams): this {
    assert.ok(options, `options must be an Object`);
    if (typeof options.skip !== "undefined") {
      this.offset(options.skip);
    }
    if (typeof options.offset !== "undefined") {
      this.offset(options.offset);
    }
    if (typeof options.limit !== "undefined") {
      this.limit(options.limit);
    }
    if (typeof options.orderBy !== "undefined") {
      this.orderBy(options.orderBy);
    }
    if (typeof options.groupBy !== "undefined") {
      this.groupBy(options.groupBy);
    }
    if (typeof options.fields !== "undefined") {
      this.fields(...options.fields);
    }
    return this;
  }

  /**
   * 生成 SQL 语句
   */
  public build(): string {
    const data = this._data;
    const currentTableName = data.tableName!;
    const currentTableEscapedName = data.tableNameEscaped!;
    data.conditions = data.conditions.map(v => v.trim()).filter(v => v);
    const where = data.conditions.length > 0 ? `WHERE ${data.conditions.join(" AND ")}` : "";
    const limit = data.limit;
    let sql: string;

    assert.ok(currentTableName && currentTableEscapedName, "missing table name");

    switch (data.type) {
      case "SELECT":
      case "SELECT DISTINCT": {
        const join: string[] = [];
        if (data.joinTables.length > 0) {
          // 设置 FROM table AS a 并且将 SELECT x 改为 SELECT a.x
          if (data.mapTableToAlias[currentTableName]) {
            const a = utils.sqlEscapeId(data.mapTableToAlias[currentTableName]);
            join.push(`AS ${a}`);
            data.fields = utils.formatFields(a, data.fields);
          } else {
            data.fields = utils.formatFields(currentTableEscapedName, data.fields);
          }
          // 创建连表
          for (let i = 0; i < data.joinTables.length; i++) {
            const item = data.joinTables[i];
            const t = utils.sqlEscapeId(item.table);
            let str = `${item.type} ${t}`;
            let a = item.alias || data.mapTableToAlias[item.table] || "";
            if (a) {
              a = utils.sqlEscapeId(a);
              str += ` AS ${a}`;
            } else {
              a = t;
            }
            if (item.on) {
              str += ` ON ${item.on}`;
            }
            if (item.fields) {
              data.fields = data.fields.concat(utils.formatFields(a, item.fields));
            }
            join.push(str);
          }
        } else {
          data.fields = utils.formatFields("", data.fields);
        }
        if (data.fields.length === 0) {
          data.fields = ["*"];
        }
        const tail = utils.joinMultiString(...join, where, data.groupBy, data.orderBy, data.limit);
        sql = `${data.type} ${data.fields.join(", ")} FROM ${currentTableEscapedName} ${tail}`;
        break;
      }
      case "INSERT": {
        sql = `INSERT INTO ${currentTableEscapedName} ${data.insert}`;
        break;
      }
      case "UPDATE": {
        assert.ok(data.update.length > 0, `update data connot be empty`);
        const tail = utils.joinMultiString(where, limit);
        sql = `UPDATE ${currentTableEscapedName} SET ${data.update.join(", ")} ${tail}`;
        break;
      }
      case "INSERT_OR_UPDATE":
        assert.ok(data.update.length > 0, `update data connot be empty`);
        sql = `INSERT INTO ${currentTableEscapedName} ${data.insert} ON DUPLICATE KEY UPDATE ${data.update.join(", ")}`;
        break;
      case "DELETE": {
        const tail = utils.joinMultiString(where, limit);
        sql = `DELETE FROM ${currentTableEscapedName} ${tail}`;
        break;
      }
      case "CUSTOM": {
        this._data.sql = this.format(
          utils.sqlFormatObject(
            data.sqlTpl,
            {
              $table: this._data.tableNameEscaped,
              $orderBy: this._data.orderBy,
              $limit: this._data.limit,
              $fields: this._data.fields.join(", "),
              $skipRows: this._data.offsetRows,
              $offsetRows: this._data.offsetRows,
              $limitRows: this._data.limitRows,
            },
            true,
          ),
          data.sqlValues,
        );
        sql = this._data.sql;
        break;
      }
      default:
        throw new Error(`invalid query type "${data.type}"`);
    }
    return sql.trim();
  }
}
