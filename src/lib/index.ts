export * from "./query";
export * from "./utils";

import { QueryBuilder } from "./query";
export default QueryBuilder;

const table = QueryBuilder.table;
export { table };
