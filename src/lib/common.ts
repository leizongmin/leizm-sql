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
      $in?: any[];
      $notIn?: any[];
      $like?: string;
      $notLike?: string;
      $eq?: any;
      $lt?: any;
      $lte?: any;
      $gt?: any;
      $gte?: any;
      $isNull?: true;
      $isNotNull?: true;
    }
  | any
>;

export type AdvancedUpdate = Record<
  string | number | symbol,
  {
    $incr?: number;
  }
>;

export type DataRow = Record<string, any>;
