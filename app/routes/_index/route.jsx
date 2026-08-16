import { redirect, Form, useLoaderData } from "react-router";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Magyx Cart Drawer</h1>
        <p className={styles.text}>
          A Shopify cart drawer app inspired by the Popsi WooCommerce plugin.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Theme app extension</strong>. Add the drawer without
            editing theme code.
          </li>
          <li>
            <strong>Storefront drawer</strong>. Ajax cart updates, discount
            codes, rewards, and upsells.
          </li>
          <li>
            <strong>Configurable design</strong>. Match colors, labels, trust
            badges, and cart icon placement in the theme editor.
          </li>
        </ul>
      </div>
    </div>
  );
}
