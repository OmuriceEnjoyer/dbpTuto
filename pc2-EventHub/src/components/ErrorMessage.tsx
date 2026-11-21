interface errorMessageProps {
    message: string | null;
}

export function ErrorMessage({ message }: errorMessageProps) {
    if (!message) return null;
    return <p role="alert" style={{ color: "red" }}>{message}</p>
}