import * as assert from "assert";
import * as SqlString from "sqlstring";

/**
 * 判断是否为 QueryBuilder 实例
 * @param query
 */
export function isQueryBuilder(query: any): boolean {
  return query && typeof query.build === "function";
}

/**
 * 格式化SQL字符串
 * @param tpl 模板字符串
 * @param values 模板变量
 */
export function sqlFormat(tpl: string, values: any[] = []): string {
  values = values.slice();
  let index = -1;
  tpl = tpl.replace(/\?+/g, (text, pos) => {
    index++;
    const v = values[index];
    if (text !== "???") return text;

    if (typeof v === "string") {
      values.splice(index, 1);
      index--;
      return v;
    }
    if (isQueryBuilder(v)) {
      const sql = v.build();
      assert.equal(typeof sql, "string", `sqlFormat: values[${index}].build() must returns a string`);
      values.splice(index, 1);
      index--;
      return `(${sql})`;
    }
    throw new Error(`sqlFormat: values[${index}] for ??? must be a string or QueryBuilder instance but got ${v}`);
  });
  return SqlString.format(tpl, values);
}

/**
 * 返回格式化后的 SQL 语句
 * 格式： SELECT * FROM ::table WHERE `title`=:title AND `id` IN :::ids
 * @param sql SQL 模板语句
 * @param values 参数对象
 * @param disable$ 是否没有 $ 开头的 key
 */
export function sqlFormatObject(sql: string, values: Record<string, any> = {}, disable$: boolean = false): string {
  return sql.replace(/:((:){0,2}[\w$]+)/g, (txt, key) => {
    let type = "value";
    let name = key;
    if (key.slice(0, 2) === "::") {
      type = "raw";
      name = key.slice(2);
    } else if (key.slice(0, 1) === ":") {
      type = "id";
      name = key.slice(1);
    }
    if (values.hasOwnProperty(name)) {
      if (disable$) {
        return values[name];
      }
      switch (type) {
        case "id":
          return sqlEscapeId(values[name]);
        case "raw":
          if (typeof values[name] === "string") return values[name];
          if (isQueryBuilder(values[name])) {
            const sql = values[name].build();
            assert.equal(typeof sql, "string", `sqlFormatObject: values["${name}"].build() must returns a string`);
            return `(${sql})`;
          }
          throw new Error(
            `sqlFormatObject: value for :::${name} must be a string or QueryBuilder instance but got ${values[name]}`,
          );
        default:
          return sqlEscape(values[name]);
      }
    }
    return txt;
  });
}

/**
 * 转义SQL值
 * @param value 值
 */
export function sqlEscape(value: string): string {
  return SqlString.escape(value);
}

/**
 * 转义SQL标识符
 * @param value 标识符
 */
export function sqlEscapeId(value: string): string {
  return SqlString.escapeId(value);
}

/**
 * 查找值为undefined的key列表
 * @param data
 */
export function findKeysForUndefinedValue(data: Record<string, any>): string[] {
  return Object.keys(data).filter(k => typeof data[k] === "undefined");
}

/**
 * 返回根据对象生成的 SQL UPDATE 语句
 * @param data 键值对对象
 */
export function sqlUpdateString(data: Record<string, any>): string {
  return Object.keys(data)
    .map(name => {
      const info = data[name];
      const escapedName = sqlEscapeId(name);
      if (info && typeof info === "object" && Object.keys(info).length === 1) {
        const op = Object.keys(info)[0];
        switch (op) {
          case "$incr":
            return `${escapedName}=${escapedName}+${sqlEscape(info.$incr)}`;
          default:
            throw new Error(`update type ${op} does not supported`);
        }
      } else {
        return `${escapedName}=${sqlEscape(data[name])}`;
      }
    })
    .join(", ");
}

/**
 * 返回根据对象生成的 SQL WHERE 语句
 * @param self QueryBuilder实例
 * @param condition 查询条件
 */
export function sqlConditionStrings(condition: Record<string, any>): string[] {
  const ret: string[] = [];
  const isPureConditionObject = (info: any) => {
    if (info && typeof info === "object") {
      const keys = Object.keys(info);
      return keys.length > 0 && keys.filter(v => v[0] === "$").length === keys.length;
    }
    return false;
  };

  for (const name in condition as any) {
    const info = (condition as any)[name];
    const escapedName = sqlEscapeId(name);
    if (isPureConditionObject(info)) {
      Object.keys(info).forEach(op => {
        switch (op) {
          case "$isNull":
            assert.ok(info.$isNull, `value of $isNull property must be true`);
            ret.push(`${escapedName} IS NULL`);
            break;
          case "$isNotNull":
            assert.ok(info.$isNotNull, `value of $isNotNull property must be true`);
            ret.push(`${escapedName} IS NOT NULL`);
            break;
          case "$lt":
            ret.push(`${escapedName}<${sqlEscape(info.$lt)}`);
            break;
          case "$lte":
            ret.push(`${escapedName}<=${sqlEscape(info.$lte)}`);
            break;
          case "$gt":
            ret.push(`${escapedName}>${sqlEscape(info.$gt)}`);
            break;
          case "$gte":
            ret.push(`${escapedName}>=${sqlEscape(info.$gte)}`);
            break;
          case "$eq":
            ret.push(`${escapedName}=${sqlEscape(info.$eq)}`);
            break;
          case "$ne":
            ret.push(`${escapedName}<>${sqlEscape(info.$ne)}`);
            break;
          case "$in":
            if (isQueryBuilder(info.$in)) {
              const sql = info.$in.build();
              assert.equal(
                typeof sql,
                "string",
                `sqlConditionStrings: values["${name}"].$in.build() must returns a string`,
              );
              ret.push(`${escapedName} IN (${sql})`);
            } else if (Array.isArray(info.$in)) {
              ret.push(`${escapedName} IN (${info.$in.map((v: any) => sqlEscape(v)).join(", ")})`);
            } else {
              throw new Error(`value for condition type $in in field ${name} must be an array`);
            }
            break;
          case "$notIn":
            if (isQueryBuilder(info.$notIn)) {
              const sql = info.$notIn.build();
              assert.equal(
                typeof sql,
                "string",
                `sqlConditionStrings: values["${name}"].$notIn.build() must returns a string`,
              );
              ret.push(`${escapedName} NOT IN (${sql})`);
            } else if (Array.isArray(info.$notIn)) {
              ret.push(`${escapedName} NOT IN (${info.$notIn.map((v: any) => sqlEscape(v)).join(", ")})`);
            } else {
              throw new Error(`value for condition type $notIn in field ${name} must be an array`);
            }
            break;
          case "$like":
            assert.ok(typeof info.$like === "string", `value for condition type $like in ${name} must be a string`);
            ret.push(`${escapedName} LIKE ${sqlEscape(info.$like)}`);
            break;
          case "$notLike":
            assert.ok(
              typeof info.$notLike === "string",
              `value for condition type $notLike in ${name} must be a string`,
            );
            ret.push(`${escapedName} NOT LIKE ${sqlEscape(info.$notLike)}`);
            break;
          default:
            throw new Error(`condition type ${op} does not supported`);
        }
      });
    } else {
      ret.push(`${escapedName}=${sqlEscape((condition as any)[name])}`);
    }
  }
  return ret;
}

/**
 * 返回生成 SQL LIMIT 语句
 * @param offset 跳过的行数
 * @param limit 返回的行数
 */
export function sqlLimitString(offset: number, limit: number): string {
  offset = Number(offset);
  limit = Number(limit);
  if (limit > 0) {
    if (offset > 0) {
      return `LIMIT ${offset},${limit}`;
    }
    return `LIMIT ${limit}`;
  }
  return `LIMIT ${offset},18446744073709551615`;
}

/**
 * 合并多段文本
 * @param strs 文本数组
 */
export function joinMultiString(...strs: string[]): string {
  return strs
    .map(v => v.trim())
    .filter(v => v)
    .join(" ");
}

/**
 * 对象深拷贝
 * @param data
 */
export function deepCopy<T = any>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * 格式化字段列表
 * @param table
 * @param fields
 */
export function formatFields(table: string, fields: string[]) {
  const prefix = table ? `${table}.` : "";
  return fields.map(n => {
    if (n === "*") return `${prefix}*`;
    if (n.toLowerCase().indexOf(" as ") !== -1) return n;
    if (n[0] === "`") return `${prefix}${n}`;
    return `${prefix}${sqlEscapeId(n)}`;
  });
}
