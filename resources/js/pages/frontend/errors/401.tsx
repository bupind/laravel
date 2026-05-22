import ErrorPage from '@/components/error-page';

interface Props {
    message?: string;
}

export default function FrontendError401({ message }: Props) {
    return <ErrorPage context="frontend" status={401} message={message} />;
}
