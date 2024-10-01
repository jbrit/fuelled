import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
import "./index.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { INDEXER_GRAPHQL_URL } from "./lib";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const client = new ApolloClient({
  uri: INDEXER_GRAPHQL_URL,
  cache: new InMemoryCache(),
});

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ApolloProvider client={client}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </StrictMode>,
  );
}
