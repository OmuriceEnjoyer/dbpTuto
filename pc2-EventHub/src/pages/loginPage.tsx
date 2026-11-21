import {useState} from "react";
import type {FormEvent} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {Button} from "../components/Button";
import {ErrorMessage} from "../components/ErrorMessage";
import {FormField} from "../components/FormField";

export function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const {login} = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await login({username, password});
            navigate("/dashboard");
        } catch (err) {
            setError("Failed to login. Please check your credentials and try again.");
        }
        finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>Login</h1>
            {error && <ErrorMessage message={error} />}
            <FormField label="Username" value={username} onChange={setUsername} required />
            <FormField label="Password" value={password} onChange={setPassword} type="password" required />
            <Button type="submit" disabled={submitting}>
                {submitting ? "Logging in..." : "Login"}
            </Button>
        </form>
    );
}