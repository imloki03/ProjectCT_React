import logo from './logo.svg';
import './App.css';
import './styles/index.css'
import {useTranslation} from "react-i18next";
import {RouterProvider} from "react-router-dom";
import {externalRoute, internalRoute} from "./router/Router";

function App() {
  const { t } = useTranslation();
  return <RouterProvider router={internalRoute} />;
}

export default App;
