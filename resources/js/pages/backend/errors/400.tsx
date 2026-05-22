import ErrorPage from '@/components/error-page';

interface Props {
    message?: string;
}

export default function BackendError400({ message }: Props) {
    return <ErrorPage context="backend" status={400} message={message} />;
}
