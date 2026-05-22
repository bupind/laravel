import ErrorPage from '@/components/error-page';

interface Props {
    message?: string;
}

export default function BackendError404({ message }: Props) {
    return <ErrorPage context="backend" status={404} message={message} />;
}
