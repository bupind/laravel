import ErrorPage from '@/components/error-page';

interface Props {
    message?: string;
}

export default function BackendError500({ message }: Props) {
    return <ErrorPage context="backend" status={500} message={message} />;
}
