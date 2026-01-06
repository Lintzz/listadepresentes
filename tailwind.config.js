/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        skin: {
          base: "var(--color-page-bg)",
          header: "var(--color-header-bg)",
          card: "var(--color-card-bg)",
          hover: "var(--color-bg-hover)",
          border: "var(--color-border)",
          overlay: "var(--color-overlay)",

          heading: "var(--color-text-heading)",
          "card-heading": "var(--color-card-heading)",
          body: "var(--color-text-body)",
          muted: "var(--color-text-muted)",

          primary: "var(--color-primary)",
          "primary-hover": "var(--color-primary-hover)",
          "primary-text": "var(--color-text-on-primary)",

          // Status
          "success-bg": "var(--color-success-bg)",
          "success-text": "var(--color-success-text)",
          "error-bg": "var(--color-error-bg)",
          "error-text": "var(--color-error-text)",
          "info-bg": "var(--color-info-bg)",
          "info-text": "var(--color-info-text)",

          // Prioridades
          "prio-high": "var(--prio-high)",
          "prio-med": "var(--prio-med)",
          "prio-low": "var(--prio-low)",
          "prio-text": "var(--prio-text)",

          // Tags
          "tag-size-bg": "var(--tag-size-bg)",
          "tag-size-text": "var(--tag-size-text)",
          "tag-volt-bg": "var(--tag-volt-bg)",
          "tag-volt-text": "var(--tag-volt-text)",

          // Lojas
          "store-ml-bg": "var(--store-ml-bg)",
          "store-ml-text": "var(--store-ml-text)",
          "store-ml-border": "var(--store-ml-border)",
          "store-ml-hover": "var(--store-ml-hover)",

          "store-amz-bg": "var(--store-amz-bg)",
          "store-amz-text": "var(--store-amz-text)",
          "store-amz-border": "var(--store-amz-border)",
          "store-amz-hover": "var(--store-amz-hover)",

          "store-shp-bg": "var(--store-shp-bg)",
          "store-shp-text": "var(--store-shp-text)",
          "store-shp-border": "var(--store-shp-border)",
          "store-shp-hover": "var(--store-shp-hover)",

          "store-mgl-bg": "var(--store-mgl-bg)",
          "store-mgl-text": "var(--store-mgl-text)",
          "store-mgl-border": "var(--store-mgl-border)",
          "store-mgl-hover": "var(--store-mgl-hover)",

          "store-gen-bg": "var(--store-gen-bg)",
          "store-gen-text": "var(--store-gen-text)",
          "store-gen-border": "var(--store-gen-border)",
          "store-gen-hover": "var(--store-gen-hover)",

          // List Themes (Paleta das Listas)
          "list-blue-border": "var(--list-blue-border)",
          "list-blue-text": "var(--list-blue-text)",

          "list-red-border": "var(--list-red-border)",
          "list-red-text": "var(--list-red-text)",

          "list-green-border": "var(--list-green-border)",
          "list-green-text": "var(--list-green-text)",

          "list-purple-border": "var(--list-purple-border)",
          "list-purple-text": "var(--list-purple-text)",

          "list-orange-border": "var(--list-orange-border)",
          "list-orange-text": "var(--list-orange-text)",

          "list-pink-border": "var(--list-pink-border)",
          "list-pink-text": "var(--list-pink-text)",

          // Código
          "code-def": "var(--code-text-default)",
          "code-hov": "var(--code-text-hover)",
        },
      },
    },
  },
  plugins: [],
};
