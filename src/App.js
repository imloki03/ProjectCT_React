import logo from './logo.svg';
import './App.css';
import './styles/index.css'
import {useTranslation} from "react-i18next";
import {RouterProvider} from "react-router-dom";
import {externalRoute, internalRoute} from "./router/Router";
import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {getUserInfoViaToken} from "./api/userApi";
import {updateUser} from "./redux/slices/userSlice";

function App() {
  const user = useSelector((state) => state?.user?.currentUser || null);
  const token = useSelector((state) => state?.user?.token || null);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [routerKey, setRouterKey] = useState(0);

  useEffect(() => {
    if (token) {
      (async () => {
        try {
          const response = await getUserInfoViaToken();
          if (response) {
            dispatch(updateUser(response.data));
          }
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [token]);


  const getRouter = () => {
    console.log("getRouter")
    return user !== null || token !== null ? internalRoute : externalRoute;
  };

  useEffect(() => {
    setRouterKey((prevKey) => prevKey + 1);
  }, [user, token]);

  return <RouterProvider key={routerKey} router={getRouter()} />;
}

export default App;
