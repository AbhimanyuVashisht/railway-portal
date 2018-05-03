import DashboardPage from "views/Dashboard/Dashboard.jsx";

import {
  Dashboard,
} from "@material-ui/icons";

const dashboardRoutes = [
  {
    path: "/portal",
    sidebarName: "Portal",
    navbarName: ".4Portal",
    icon: Dashboard,
    component: DashboardPage
  },
  { redirect: true, path: "/", to: "/portal", navbarName: "Redirect" }
];

export default dashboardRoutes;
