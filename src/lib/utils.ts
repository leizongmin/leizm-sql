import * as assert from "assert";

export function sqlFormat(tpl: string, values: any[]): string {}

/**
 * 返回格式化后的 SQL 语句
 * 格式： SELECT * FROM ::table WHERE `title`=:title
 * @param sql SQL 模板语句
 * @param values 参数对象
 * @param disable$ 是否没有 $ 开头的 key
 */
export function sqlFormatObject(sql: string, values: Record<string, any>, disable$?: boolean): string {
  values = values || {};
  return sql.replace(/:((:)?[\w$]+)/g, (txt, key) => {
    const isId = key[0] === ":";
    if (isId) {
      key = key.slice(1);
    }
    if (values.hasOwnProperty(key)) {
      if (disable$) {
        return values[key];
      }
      if (isId) {
        return sqlEscapeId(values[key]);
      }
      return sqlEscape(values[key]);
    }
    return txt;
  });
}

export function sqlEscape(str: string): string {}

export function sqlEscapeId(str: string): string {}

export function findKeysForUndefinedValue(data: Record<string, any>): string[] {}

/**
 * 返回根据对象生成的 SQL UPDATE 语句
 * @param self QueryBuilder实例
 * @param data 键值对对象
 */
export function sqlUpdateString(self: QueryBuilder, data: Record<string, any>): string {
  return Object.keys(data)
    .map(name => {
      const info = data[name];
      const isJsonField = self._schema && self._schema.isJsonField(name);
      const escapedName = sqlEscapeId(name);
      if (info && typeof info === "object" && Object.keys(info).length === 1 && !isJsonField) {
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
export function sqlConditionStrings(self: QueryBuilder, condition: Record<string, any>): string[] {
  const ret: string[] = [];
  for (const name in condition as any) {
    const info = (condition as any)[name];
    const isJsonField = self._schema && self._schema.isJsonField(name);
    const escapedName = sqlEscapeId(name);
    if (info && typeof info === "object" && Object.keys(info).length === 1 && !isJsonField) {
      const op = Object.keys(info)[0];
      switch (op) {
        case "$in":
          assert.ok(Array.isArray(info.$in), `value for condition type $in in field ${name} must be an array`);
          ret.push(`${escapedName} IN (${info.$in.map((v: any) => sqlEscape(v)).join(", ")})`);
          break;
        case "$like":
          assert.ok(typeof info.$like === "string", `value for condition type $like in ${name} must be a string`);
          ret.push(`${escapedName} LIKE ${sqlEscape(info.$like)}`);
          break;
        default:
          throw new Error(`condition type ${op} does not supported`);
      }
    } else {
      ret.push(`${escapedName}=${sqlEscape((condition as any)[name])}`);
    }
  }
  return ret;
}

/**
 * 返回生成 SQL LIMIT 语句
 * @param skip 跳过的行数
 * @param limit 返回的行数
 */
export function sqlLimitString(skip: number, limit: number): string {
  skip = Number(skip);
  limit = Number(limit);
  if (limit > 0) {
    if (skip > 0) {
      return `LIMIT ${skip},${limit}`;
    }
    return `LIMIT ${limit}`;
  }
  return `LIMIT ${skip},18446744073709551615`;
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
