type FormProps = {
  children: React.ReactNode;
} & React.FormHTMLAttributes<HTMLFormElement>;

const Form = ({ children, ...props }: FormProps) => {
  return (
    <form autoComplete="off" {...props} noValidate>
      {children}
    </form>
  );
};

export { Form };
