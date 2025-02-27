import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/slices/userSlice";
import { login } from "../../api/authApi";
import {API_BASE_URL} from "../../components/env";
import {useNavigate} from "react-router-dom";

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const dispatch = useDispatch();

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            console.log("API URL:", process.env.REACT_APP_API_BASE_URL);
            const userData = await login(username, password);
            dispatch(loginSuccess(userData));
            console.log(userData);
        } catch (err) {
            console.log(err)
            setError("Đăng nhập thất bại. Vui lòng kiểm tra lại.");
        }
    };

    const handleNavRegister = () => {
        navigate("/register")
    }

    const handleNavFW = () => {
        navigate("/forgot-password")
    }

    return (
        <div>
            <h2>Login</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
                <button onClick={handleNavRegister}>nav register</button>
                <button onClick={handleNavFW}>Forgot-pasword</button>
            </form>
        </div>
    );
};

export default LoginPage;