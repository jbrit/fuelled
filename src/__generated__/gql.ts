/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "query AllPools {\n  Pool {\n    id\n    name\n    symbol\n    description\n    image\n    twitter\n    telegram\n    website\n    txId\n    asset\n    contract\n    createdAt\n    createdBy\n    db_write_timestamp\n  }\n}": types.AllPoolsDocument,
    "query AllTrades {\n  Trade {\n    createdAt\n    db_write_timestamp\n    ethAmount\n    id\n    token\n    tokenAmount\n    tradeType\n    trader\n    txId\n  }\n}": types.AllTradesDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query AllPools {\n  Pool {\n    id\n    name\n    symbol\n    description\n    image\n    twitter\n    telegram\n    website\n    txId\n    asset\n    contract\n    createdAt\n    createdBy\n    db_write_timestamp\n  }\n}"): (typeof documents)["query AllPools {\n  Pool {\n    id\n    name\n    symbol\n    description\n    image\n    twitter\n    telegram\n    website\n    txId\n    asset\n    contract\n    createdAt\n    createdBy\n    db_write_timestamp\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query AllTrades {\n  Trade {\n    createdAt\n    db_write_timestamp\n    ethAmount\n    id\n    token\n    tokenAmount\n    tradeType\n    trader\n    txId\n  }\n}"): (typeof documents)["query AllTrades {\n  Trade {\n    createdAt\n    db_write_timestamp\n    ethAmount\n    id\n    token\n    tokenAmount\n    tradeType\n    trader\n    txId\n  }\n}"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;