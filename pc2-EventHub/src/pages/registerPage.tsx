import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";
import { ErrorMessage } from "../components/ErrorMessage";
import { FormField } from "../components/FormField";

export function RegisterPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            await register({ username, password, email, fullName });
            navigate("/login");
        } catch (err) {
            setError("Failed to register. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>Register</h1>
            {error && <ErrorMessage message={error} />}
            <FormField label="Username" value={username} onChange = {setUsername} required />
            <FormField label="Email" value={email} onChange = {setEmail} required />
            <FormField label="Password" value={password} onChange = {setPassword} type="password" required />
            <FormField label="Full Name" value={fullName} onChange = {setFullName} required />
            <Button type="submit" disabled={submitting}>
                {submitting ? "Registering..." : "Register"}
            </Button>
        </form>
    );
}

