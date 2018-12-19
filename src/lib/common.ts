/**
 * @leizm/mysql
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

export interface QueryOptionsParams {
  /**
   * 跳过的行数
   */
  skip?: number;
  /**
   * 跳过的行数
   */
  offset?: number;
  /**
   * 返回的行数
   */
  limit?: number;
  /**
   * 排序方向
   */
  orderBy?: string;
  /**
   * 分组
   */
  groupBy?: string;
  /**
   * 返回字段列表
   */
  fields?: string[];
}

export type AdvancedCondition = Record<
  string | number | symbol,
  | {
      /** x IN y */
      $in?: any[];
      /** x NOT IN y */
      $notIn?: any[];
      /** x LIKE y */
      $like?: string;
      /** x NOT LIKE y */
      $notLike?: string;
      /** x = y */
      $eq?: any;
      /** x <> y */
      $ne?: any;
      /** x < y */
      $lt?: any;
      /** x <= y */
      $lte?: any;
      /** x > y */
      $gt?: any;
      /** x >= y */
      $gte?: any;
      /** x IS NULL */
      $isNull?: true;
      /** x IS NOT NULL */
      $isNotNull?: true;
      /** x = y (y不做任何转义) */
      $raw?: string;
    }
  | any
>;

export type AdvancedUpdate = Record<
  string | number | symbol,
  | {
      /** x = x + y */
      $incr?: number;
      /** x = x - y */
      $decr?: number;
      /** x = y (y不做任何转义) */
      $raw: string;
    }
  | any
>;

export type DataRow = Record<string, any>;
