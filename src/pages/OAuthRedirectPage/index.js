import React, {useEffect} from 'react'
import {useLocation, useNavigate} from "react-router-dom";
import {useLoading} from "../../contexts/LoadingContext";
import {routeLink} from "../../router/Router";
import {useDispatch} from "react-redux";
import {updateOauth, updateToken, updateUser} from "../../redux/slices/userSlice";
import {getUserInfoViaToken} from "../../api/userApi";

const OAuthRedirectPage = () => {
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const token = queryParams.get('token');
    const updated = queryParams.get('updated');
    const setLoading = useLoading();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        setLoading(true);
    }, []);

    useEffect(() => {
        if (token && updated) {
            dispatch(updateToken(token));
            dispatch(updateOauth(updated !== "false"))
            localStorage.setItem("token", token);
            localStorage.setItem("updated", updated);
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
            navigate(routeLink.default);
        }
    }, [token, updated, navigate]);

    return (
        <></>
    )
}

export default OAuthRedirectPage;