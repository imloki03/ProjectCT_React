import logo from './logo.svg';
import './App.css';
import './styles/index.css'
import {useTranslation} from "react-i18next";
import {RouterProvider} from "react-router-dom";
import {externalRoute, internalRoute} from "./router/Router";
import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {useLoading} from "./contexts/LoadingContext";
import {getUserInfo} from "./api/userApi";
import {updateUser} from "./redux/slices/userSlice";

function App() {
  const user = useSelector((state) => state?.user?.currentUser || null);
  const token = localStorage.getItem("token");
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [router, setRouter] = useState(null);

  useEffect(() => {
    if (token) {
      (async () => {
        try {
          const response = await getUserInfo(user.username);
          if (response) {
            dispatch(updateUser(response.data));
          }
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, []);

  const getRouter = () => {
    console.log(token)
    if (token !== null) {
      return internalRoute;
    }
    else {
      return externalRoute;
    }
  }

  useEffect(() => {
    const updatedRouter = getRouter();
    setRouter(updatedRouter);
  }, [user, token]);


  return <div>
    {router && <RouterProvider key={router} router={router} />}
  </div>;
}

export default App;
