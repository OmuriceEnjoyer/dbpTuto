import {Link} from "react-router-dom";
import {useAuth} from "../context/AuthContext";

export function Navbar() {
    const {isAuthenticated} = useAuth();

    return (
        <nav>
            <Link to="/">Home</Link>
            {isAuthenticated ? (
                <>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/logout">Logout</Link>
                </>
            ) : (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </>
            )}
        </nav>
    );
}