import ErrorPage from '@/components/error-page';

interface Props {
    message?: string;
}

function FrontendError404({ message }: Props) {
    return <ErrorPage context="frontend" status={404} message={message} />;
}

export default FrontendError404;
