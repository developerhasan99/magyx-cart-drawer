import { Link, Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisTranslations from "@shopify/polaris/locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  // eslint-disable-next-line no-undef
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

// Polaris renders its own internal navigation (Page backAction, Breadcrumbs,
// etc.) as a plain <a> unless told otherwise. Inside the embedded iframe a
// hard anchor navigation drops the host/session query params App Bridge
// relies on and can leave the frame blank — routing it through React
// Router's Link keeps it a client-side SPA navigation instead.
function PolarisLink({ url, external, target, children, ...rest }) {
  if (external) {
    return (
      <a href={url} target={target ?? "_blank"} rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link to={url} target={target} {...rest}>
      {children}
    </Link>
  );
}

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <PolarisAppProvider i18n={polarisTranslations} linkComponent={PolarisLink}>
        <NavMenu>
          <Link to="/app" rel="home">
            Home
          </Link>
          <Link to="/app">Carts</Link>
          <Link to="/app/sticky-cart">Sticky cart</Link>
          <Link to="/app/promotions">Promotions</Link>
          <Link to="/app/analytics">Analytics</Link>
          <Link to="/app/help-support">Help &amp; Support</Link>
        </NavMenu>
        <Outlet />
      </PolarisAppProvider>
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
