import { MD3LightTheme } from "react-native-paper";

// theme.ts — tokens de color placeholder (design-system-mapping.md, hasta la guía de marca
// oficial — frontend-components.md § Accesibilidad advierte re-verificar contraste si cambia).
// primary = VENTA Y PRESUPUESTO (🎯), secondary = DEVOLUCIÓN (📉), tertiary = DEL SUPERVISOR (📣).
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#2E7D32",
    secondary: "#EF6C00",
    tertiary: "#5E35B1",
    error: "#C62828",
  },
};
