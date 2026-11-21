interface FormFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
}

export function FormField({ label, value, onChange, type = "text", required = false }: FormFieldProps) {

    const id = label.toLowerCase().replace(/\+/g,"-")

    return (
        <div>
            <label htmlFor={id}>{label}</label>
            <input
                id ={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
            />
        </div>
    );
}