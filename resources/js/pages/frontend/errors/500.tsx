import ErrorPage from '@/components/error-page';

interface Props {
    message?: string;
}

function FrontendError500({ message }: Props) {
    return <ErrorPage context="frontend" status={500} message={message} />;
}

export default FrontendError500;
