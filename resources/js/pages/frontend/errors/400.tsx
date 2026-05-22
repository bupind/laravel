import ErrorPage from '@/components/error-page';

interface Props {
    message?: string;
}

export default function FrontendError400({ message }: Props) {
    return <ErrorPage context="frontend" status={400} message={message} />;
}
