export * from "./query";
export * from "./utils";
export * from "./common";
export * from "./expr";

import { QueryBuilder } from "./query";
export default QueryBuilder;

const table = QueryBuilder.table;
const expr = QueryBuilder.expr;
export { table, expr };
