import ErrorPage from '@/components/error-page';

interface Props {
    message?: string;
}

function FrontendError403({ message }: Props) {
    return <ErrorPage context="frontend" status={403} message={message} />;
}

export default FrontendError403;
