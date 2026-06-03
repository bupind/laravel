import ErrorPage from '@/components/error-page';

interface Props {
    message?: string;
}

function FrontendError401({ message }: Props) {
    return <ErrorPage context="frontend" status={401} message={message} />;
}

export default FrontendError401;
