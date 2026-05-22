import ErrorPage from '@/components/error-page';

interface Props {
    message?: string;
}

export default function FrontendError404({ message }: Props) {
    return <ErrorPage context="frontend" status={404} message={message} />;
}
