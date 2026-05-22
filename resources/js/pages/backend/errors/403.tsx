import ErrorPage from '@/components/error-page';

interface Props {
    message?: string;
}

export default function BackendError403({ message }: Props) {
    return <ErrorPage context="backend" status={403} message={message} />;
}
